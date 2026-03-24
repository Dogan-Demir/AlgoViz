"""
Algorithm registry for discovery and management.
"""

from typing import Type

from .base import AlgorithmMetadata, AlgorithmSpec


class AlgorithmRegistry:
    """Singleton registry for algorithm discovery."""

    _instance = None
    _algorithms: dict[str, Type[AlgorithmSpec]] = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    @classmethod
    def register(cls, algorithm_class: Type[AlgorithmSpec]) -> Type[AlgorithmSpec]:
        """Decorator to register an algorithm."""
        instance = algorithm_class()
        cls._algorithms[instance.metadata.id] = algorithm_class
        return algorithm_class

    @classmethod
    def get(cls, algorithm_id: str) -> AlgorithmSpec | None:
        """Get an algorithm instance by ID."""
        algorithm_class = cls._algorithms.get(algorithm_id)
        return algorithm_class() if algorithm_class else None

    @classmethod
    def list_all(cls) -> list[AlgorithmMetadata]:
        """List all registered algorithms."""
        return [cls._algorithms[aid]().metadata for aid in cls._algorithms]

    @classmethod
    def get_ids(cls) -> list[str]:
        """Get all registered algorithm IDs."""
        return list(cls._algorithms.keys())

    @classmethod
    def clear(cls):
        """Clear all registered algorithms (for testing)."""
        cls._algorithms = {}


# Convenience decorator
def register_algorithm(cls: Type[AlgorithmSpec]) -> Type[AlgorithmSpec]:
    return AlgorithmRegistry.register(cls)
