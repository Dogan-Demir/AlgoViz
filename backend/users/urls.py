from django.urls import path

from .views import GoogleAuthView, LoginView, MeView, RegisterView, TokenRefreshView

urlpatterns = [
    path("register", RegisterView.as_view(), name="user-register"),
    path("login", LoginView.as_view(), name="user-login"),
    path("token/refresh", TokenRefreshView.as_view(), name="token-refresh"),
    path("me", MeView.as_view(), name="user-me"),
    path("google", GoogleAuthView.as_view(), name="user-google"),
]
