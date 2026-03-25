"""
URL configuration for AlgoViz project.
"""

from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/users/", include("users.urls")),
    path("api/", include("algorithms.urls")),
    path("api/", include("runs.urls")),
    path("api/", include("streaming.urls")),
]
