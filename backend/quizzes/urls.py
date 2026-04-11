from django.urls import path

from .views import (
    LeaderboardView,
    QuestionListView,
    QuizSubmitView,
    UserProgressDetailView,
    UserProgressView,
)

urlpatterns = [
    path("quizzes/questions/", QuestionListView.as_view(), name="quiz-questions"),
    path("quizzes/submit/", QuizSubmitView.as_view(), name="quiz-submit"),
    path("quizzes/progress/", UserProgressView.as_view(), name="quiz-progress"),
    path("quizzes/progress/<str:algorithm_id>/", UserProgressDetailView.as_view(), name="quiz-progress-detail"),
    path("quizzes/leaderboard/", LeaderboardView.as_view(), name="quiz-leaderboard"),
]
