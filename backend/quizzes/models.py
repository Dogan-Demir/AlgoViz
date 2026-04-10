"""
Models for the quizzes and progress tracking system.
"""

from django.conf import settings
from django.db import models


class Question(models.Model):
    """A single quiz question linked to an algorithm."""

    QUESTION_TYPES = [
        ("multiple_choice", "Multiple Choice"),
        ("step_prediction", "Step Prediction"),
        ("complexity", "Complexity"),
        ("scenario", "Scenario"),
    ]

    DIFFICULTY_CHOICES = [
        ("easy", "Easy"),
        ("medium", "Medium"),
        ("hard", "Hard"),
    ]

    POINTS_BY_DIFFICULTY = {
        "easy": 10,
        "medium": 20,
        "hard": 30,
    }

    algorithm_id = models.CharField(max_length=100)
    question_type = models.CharField(max_length=30, choices=QUESTION_TYPES)
    difficulty = models.CharField(max_length=10, choices=DIFFICULTY_CHOICES, default="medium")
    question_text = models.TextField()
    # List of option strings e.g. ["O(n)", "O(n log n)", "O(n²)", "O(1)"]
    options = models.JSONField()
    # Index into options that is correct (0-based)
    correct_answer = models.PositiveSmallIntegerField()
    explanation = models.TextField(blank=True)
    points = models.PositiveSmallIntegerField(default=20)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["algorithm_id", "difficulty"]

    def save(self, *args, **kwargs):
        # Auto-set points from difficulty unless already set
        if not self.pk:
            self.points = self.POINTS_BY_DIFFICULTY.get(self.difficulty, 20)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.algorithm_id}] {self.question_text[:60]}"


class QuizAttempt(models.Model):
    """Records one quiz session for a user."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="quiz_attempts",
    )
    # Which algorithms were included in this quiz session
    algorithm_ids = models.JSONField()
    score = models.PositiveIntegerField(default=0)
    total_questions = models.PositiveSmallIntegerField(default=0)
    correct_count = models.PositiveSmallIntegerField(default=0)
    completed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-completed_at"]

    def __str__(self):
        return f"{self.user.email} – {self.score}pts at {self.completed_at:%Y-%m-%d %H:%M}"


class UserProgress(models.Model):
    """Per-user, per-algorithm progress record."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="progress",
    )
    algorithm_id = models.CharField(max_length=100)
    quizzes_passed = models.PositiveSmallIntegerField(default=0)
    challenges_completed = models.PositiveSmallIntegerField(default=0)
    # User manually marks themselves as confident
    is_confident = models.BooleanField(default=False)
    last_activity = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("user", "algorithm_id")
        ordering = ["algorithm_id"]

    @property
    def is_completed(self):
        """Completed = passed 3+ quizzes OR self-marked confident."""
        return self.quizzes_passed >= 3 or self.is_confident

    def __str__(self):
        return f"{self.user.email} – {self.algorithm_id} (passed: {self.quizzes_passed})"


class UserStats(models.Model):
    """Global stats per user — score, streak, leaderboard data."""

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="stats",
    )
    total_score = models.PositiveIntegerField(default=0)
    current_streak = models.PositiveSmallIntegerField(default=0)
    longest_streak = models.PositiveSmallIntegerField(default=0)
    last_activity_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.email} – score:{self.total_score} streak:{self.current_streak}"
