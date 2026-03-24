"""
URL configuration for streaming app.
"""

from django.urls import path

from .views import SSEStreamView

urlpatterns = [
    path("runs/<str:run_id>/stream", SSEStreamView.as_view(), name="run-stream"),
]
