"""
URL configuration for runs app.
"""

from django.urls import path

from .views import CreateRunView, RunControlView, RunDetailView, RunStepsView

urlpatterns = [
    path("runs", CreateRunView.as_view(), name="run-create"),
    path("runs/<str:run_id>", RunDetailView.as_view(), name="run-detail"),
    path("runs/<str:run_id>/control", RunControlView.as_view(), name="run-control"),
    path("runs/<str:run_id>/steps", RunStepsView.as_view(), name="run-steps"),
]
