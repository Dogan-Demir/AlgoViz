from django.contrib.auth import authenticate, get_user_model
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from .serializers import GoogleAuthSerializer, LoginSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


def _tokens_for_user(user):
    """Return a JWT access/refresh pair for the given user."""
    refresh = RefreshToken.for_user(user)
    return {"refresh": str(refresh), "access": str(refresh.access_token)}


class RegisterView(APIView):
    permission_classes = []  # public endpoint

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]
        user = User.objects.create_user(email=email, password=password)

        tokens = _tokens_for_user(user)
        return Response(
            {**tokens, "user": UserSerializer(user).data},
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = []  # public endpoint

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(
            request,
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                {"detail": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        tokens = _tokens_for_user(user)
        return Response({**tokens, "user": UserSerializer(user).data})


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        # Only allow updating the onboarding flag via this endpoint
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        serializer.save()
        return Response(serializer.data)


class GoogleAuthView(APIView):
    """Verify a Google ID token and return an AlgoViz JWT pair."""

    permission_classes = []

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        credential = serializer.validated_data["credential"]

        try:
            from django.conf import settings
            from google.auth.transport import requests as google_requests
            from google.oauth2 import id_token

            id_info = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError as exc:
            return Response(
                {"detail": f"Invalid Google token: {exc}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        google_id = id_info["sub"]
        email = id_info.get("email", "").lower()
        avatar_url = id_info.get("picture", "")

        # Find existing user by google_id, then by email, or create a new one
        user = (
            User.objects.filter(google_id=google_id).first()
            or User.objects.filter(email=email).first()
        )

        if user is None:
            user = User.objects.create_user(email=email, password=None)

        # Keep google_id and avatar in sync
        updated = False
        if not user.google_id:
            user.google_id = google_id
            updated = True
        if avatar_url and user.avatar_url != avatar_url:
            user.avatar_url = avatar_url
            updated = True
        if updated:
            user.save(update_fields=["google_id", "avatar_url"])

        tokens = _tokens_for_user(user)
        return Response({**tokens, "user": UserSerializer(user).data})


# Re-export the simplejwt refresh view so urls.py can import one place
TokenRefreshView = BaseTokenRefreshView
