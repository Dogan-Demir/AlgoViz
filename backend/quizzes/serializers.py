from rest_framework import serializers

from .models import Question, QuizAttempt, UserProgress, UserStats


class QuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Question
        fields = ["id", "algorithm_id", "question_type", "difficulty", "question_text", "options", "points"]
        # correct_answer is NOT included — sent only after submission


class AnswerSubmitSerializer(serializers.Serializer):
    """One answered question in a submission."""
    question_id = serializers.IntegerField()
    selected_answer = serializers.IntegerField(min_value=0)


class QuizSubmitSerializer(serializers.Serializer):
    """Full quiz submission payload."""
    answers = AnswerSubmitSerializer(many=True, min_length=1)


class AnswerResultSerializer(serializers.Serializer):
    """Per-question result returned after submission."""
    question_id = serializers.IntegerField()
    correct = serializers.BooleanField()
    correct_answer = serializers.IntegerField()
    explanation = serializers.CharField()
    points_earned = serializers.IntegerField()


class QuizAttemptResultSerializer(serializers.Serializer):
    """Full result returned after a quiz is submitted."""
    score = serializers.IntegerField()
    max_score = serializers.IntegerField()
    correct_count = serializers.IntegerField()
    total_questions = serializers.IntegerField()
    results = AnswerResultSerializer(many=True)
    new_total_score = serializers.IntegerField()
    current_streak = serializers.IntegerField()


class UserProgressSerializer(serializers.ModelSerializer):
    is_completed = serializers.SerializerMethodField()

    class Meta:
        model = UserProgress
        fields = [
            "algorithm_id",
            "quizzes_passed",
            "challenges_completed",
            "is_confident",
            "is_completed",
            "last_activity",
        ]
        read_only_fields = ["algorithm_id", "quizzes_passed", "challenges_completed", "last_activity"]

    def get_is_completed(self, obj):
        return obj.is_completed


class LeaderboardEntrySerializer(serializers.Serializer):
    rank = serializers.IntegerField()
    email = serializers.CharField()
    total_score = serializers.IntegerField()
    current_streak = serializers.IntegerField()
