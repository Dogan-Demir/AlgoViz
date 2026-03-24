from django.apps import AppConfig


class AlgorithmsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "algorithms"

    def ready(self):
        # Import implementations to register them
        from . import implementations  # noqa: F401
