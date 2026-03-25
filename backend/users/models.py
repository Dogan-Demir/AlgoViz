from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models


class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required.")
        email = self.normalize_email(email)
        extra_fields.setdefault("username", "")
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(email, password, **extra_fields)


class CustomUser(AbstractUser):
    objects = CustomUserManager()
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
