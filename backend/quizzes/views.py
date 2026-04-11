"""
Quiz API views.
"""

import random
from datetime import date, timedelta

from django.db import transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Question, QuizAttempt, UserProgress, UserStats
from .serializers import (
    LeaderboardEntrySerializer,
    QuestionSerializer,
    QuizAttemptResultSerializer,
    QuizSubmitSerializer,
    UserProgressSerializer,
)

QUESTIONS_PER_QUIZ = 10
PASS_THRESHOLD = 0.6  # 60% correct to "pass" a quiz for an algorithm


def _get_or_create_stats(user):
    stats, _ = UserStats.objects.get_or_create(user=user)
    return stats


def _update_streak(stats):
    """Increment streak if active today/yesterday, else reset to 1."""
    today = date.today()
    if stats.last_activity_date == today:
        return  # already counted today
    if stats.last_activity_date == today - timedelta(days=1):
        stats.current_streak += 1
    else:
        stats.current_streak = 1
    if stats.current_streak > stats.longest_streak:
        stats.longest_streak = stats.current_streak
    stats.last_activity_date = today


class QuestionListView(APIView):
    """
    GET /api/quizzes/questions/?algorithms=bubble-sort,binary-search
    Returns up to QUESTIONS_PER_QUIZ shuffled questions for the requested algorithms.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        algorithms_param = request.query_params.get("algorithms", "")
        algorithm_ids = [a.strip() for a in algorithms_param.split(",") if a.strip()]

        if not algorithm_ids:
            return Response(
                {"error": "Provide at least one algorithm id via ?algorithms="},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs = Question.objects.filter(algorithm_id__in=algorithm_ids)
        questions = list(qs)

        if not questions:
            return Response(
                {"error": "No questions found for the requested algorithms."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Sample up to QUESTIONS_PER_QUIZ, keeping a mix across algorithms
        sample = random.sample(questions, min(QUESTIONS_PER_QUIZ, len(questions)))
        random.shuffle(sample)

        return Response(QuestionSerializer(sample, many=True).data)


class QuizSubmitView(APIView):
    """
    POST /api/quizzes/submit/
    Body: { answers: [{question_id, selected_answer}, ...] }
    Returns per-question results, score, updated streak and total score.
    """
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = QuizSubmitSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        answers = serializer.validated_data["answers"]
        question_ids = [a["question_id"] for a in answers]
        questions_map = {q.id: q for q in Question.objects.filter(id__in=question_ids)}

        results = []
        total_score = 0
        max_score = 0
        correct_count = 0
        algorithm_ids_in_quiz = set()

        for answer in answers:
            q = questions_map.get(answer["question_id"])
            if not q:
                continue
            algorithm_ids_in_quiz.add(q.algorithm_id)
            max_score += q.points
            correct = answer["selected_answer"] == q.correct_answer
            points_earned = q.points if correct else 0
            total_score += points_earned
            if correct:
                correct_count += 1
            results.append({
                "question_id": q.id,
                "correct": correct,
                "correct_answer": q.correct_answer,
                "explanation": q.explanation,
                "points_earned": points_earned,
            })

        # Save attempt
        QuizAttempt.objects.create(
            user=request.user,
            algorithm_ids=list(algorithm_ids_in_quiz),
            score=total_score,
            total_questions=len(results),
            correct_count=correct_count,
        )

        # Update UserProgress per algorithm — mark a pass if >= PASS_THRESHOLD
        passed = (correct_count / len(results)) >= PASS_THRESHOLD if results else False
        for algo_id in algorithm_ids_in_quiz:
            progress, _ = UserProgress.objects.get_or_create(
                user=request.user, algorithm_id=algo_id
            )
            if passed:
                progress.quizzes_passed += 1
            progress.save()

        # Update UserStats
        stats = _get_or_create_stats(request.user)
        stats.total_score += total_score
        _update_streak(stats)
        stats.save()

        return Response(
            QuizAttemptResultSerializer({
                "score": total_score,
                "max_score": max_score,
                "correct_count": correct_count,
                "total_questions": len(results),
                "results": results,
                "new_total_score": stats.total_score,
                "current_streak": stats.current_streak,
            }).data,
            status=status.HTTP_201_CREATED,
        )


class UserProgressView(APIView):
    """
    GET /api/quizzes/progress/
    Returns the current user's progress across all algorithms.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        progress = UserProgress.objects.filter(user=request.user)
        return Response(UserProgressSerializer(progress, many=True).data)


class UserProgressDetailView(APIView):
    """
    PATCH /api/quizzes/progress/<algorithm_id>/
    Toggle is_confident for a single algorithm.
    """
    permission_classes = [IsAuthenticated]

    def patch(self, request, algorithm_id):
        is_confident = request.data.get("is_confident")
        if is_confident is None:
            return Response(
                {"error": "is_confident field required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        progress, _ = UserProgress.objects.get_or_create(
            user=request.user, algorithm_id=algorithm_id
        )
        progress.is_confident = bool(is_confident)
        progress.save()
        return Response(UserProgressSerializer(progress).data)


class LeaderboardView(APIView):
    """
    GET /api/quizzes/leaderboard/?type=score|streak
    Returns top 20 users ranked by score or streak.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        board_type = request.query_params.get("type", "score")

        if board_type == "streak":
            top = UserStats.objects.select_related("user").order_by("-current_streak", "-total_score")[:20]
        else:
            top = UserStats.objects.select_related("user").order_by("-total_score", "-current_streak")[:20]

        entries = [
            {
                "rank": i + 1,
                "email": stats.user.email,
                "total_score": stats.total_score,
                "current_streak": stats.current_streak,
            }
            for i, stats in enumerate(top)
        ]

        return Response(LeaderboardEntrySerializer(entries, many=True).data)
