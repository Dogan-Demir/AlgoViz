from django.contrib import admin

from .models import Question, QuizAttempt, UserProgress, UserStats


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ("algorithm_id", "question_type", "difficulty", "points", "question_text")
    list_filter = ("algorithm_id", "question_type", "difficulty")
    search_fields = ("question_text",)


@admin.register(QuizAttempt)
class QuizAttemptAdmin(admin.ModelAdmin):
    list_display = ("user", "score", "correct_count", "total_questions", "completed_at")
    list_filter = ("completed_at",)
    readonly_fields = ("completed_at",)


@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ("user", "algorithm_id", "quizzes_passed", "is_confident", "challenges_completed")
    list_filter = ("algorithm_id", "is_confident")


@admin.register(UserStats)
class UserStatsAdmin(admin.ModelAdmin):
    list_display = ("user", "total_score", "current_streak", "longest_streak", "last_activity_date")
