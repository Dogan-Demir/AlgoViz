"""
URL configuration for algorithms app.
"""

from django.urls import path

from .views import AlgorithmDetailView, AlgorithmListView

urlpatterns = [
    path("algorithms", AlgorithmListView.as_view(), name="algorithm-list"),
    path("algorithms/<str:algorithm_id>", AlgorithmDetailView.as_view(), name="algorithm-detail"),
]
