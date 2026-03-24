"""
Views for algorithm endpoints.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .registry import AlgorithmRegistry
from .serializers import AlgorithmDetailSerializer, AlgorithmListSerializer


def metadata_to_dict(metadata):
    """Convert AlgorithmMetadata to serializable dict."""
    return {
        "id": metadata.id,
        "name": metadata.name,
        "category": metadata.category.value,
        "description": metadata.description,
        "complexity": {
            "time": {
                "best": metadata.complexity.time_best,
                "average": metadata.complexity.time_average,
                "worst": metadata.complexity.time_worst,
            },
            "space": metadata.complexity.space,
        },
        "pseudocode": [
            {"line": p.line, "code": p.code, "indent": p.indent} for p in metadata.pseudocode
        ],
    }


class AlgorithmListView(APIView):
    """List all available algorithms."""

    def get(self, request):
        algorithms = AlgorithmRegistry.list_all()
        data = [metadata_to_dict(a) for a in algorithms]
        serializer = AlgorithmListSerializer(data, many=True)
        return Response({"algorithms": serializer.data})


class AlgorithmDetailView(APIView):
    """Get details for a specific algorithm."""

    def get(self, request, algorithm_id):
        algorithm = AlgorithmRegistry.get(algorithm_id)
        if not algorithm:
            return Response(
                {"error": "Algorithm not found", "algorithmId": algorithm_id},
                status=status.HTTP_404_NOT_FOUND,
            )
        data = metadata_to_dict(algorithm.metadata)
        serializer = AlgorithmDetailSerializer(data)
        return Response(serializer.data)
