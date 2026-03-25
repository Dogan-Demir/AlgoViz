from django.contrib.auth.models import AbstractUser
from django.db import models


class CustomUser(AbstractUser):
    # Use email as the login identifier instead of username
    username = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)

    # Onboarding state — checked by the frontend to trigger the tour
    has_completed_onboarding = models.BooleanField(default=False)

    # Populated from Google OAuth profile
    avatar_url = models.URLField(blank=True)
    google_id = models.CharField(max_length=255, blank=True, null=True, unique=True)

    created_at = models.DateTimeField(auto_now_add=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []  # email is already required as the USERNAME_FIELD

    class Meta:
        db_table = "users_customuser"

    def __str__(self) -> str:
        return self.email
