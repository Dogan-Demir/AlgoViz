"""
Views for run endpoints.
"""

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import CreateRunSerializer, RunControlSerializer, RunMetadataSerializer
from .services import RunManager


class CreateRunView(APIView):
    """Create a new algorithm run."""

    def post(self, request):
        serializer = CreateRunSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        algorithm_id = serializer.validated_data["algorithmId"]
        input_data = serializer.validated_data["input"]

        run_manager = RunManager()

        try:
            run = run_manager.create_run(algorithm_id, input_data)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

        if not run:
            return Response(
                {"error": "Algorithm not found", "algorithmId": algorithm_id},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Return run metadata (without steps)
        response_data = {
            "runId": run["runId"],
            "algorithmId": run["algorithmId"],
            "input": run["input"],
            "totalSteps": run["totalSteps"],
            "createdAt": run["createdAt"],
            "algorithm": run["algorithm"],
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class RunDetailView(APIView):
    """Get run metadata."""

    def get(self, request, run_id):
        run_manager = RunManager()
        run = run_manager.get_run(run_id)

        if not run:
            return Response(
                {"error": "Run not found", "runId": run_id},
                status=status.HTTP_404_NOT_FOUND,
            )

        response_data = {
            "runId": run["runId"],
            "algorithmId": run["algorithmId"],
            "input": run["input"],
            "totalSteps": run["totalSteps"],
            "createdAt": run["createdAt"],
            "status": "paused" if run["paused"] else "streaming",
            "algorithm": run["algorithm"],
        }

        serializer = RunMetadataSerializer(response_data)
        return Response(serializer.data)


class RunControlView(APIView):
    """Pause or resume a run."""

    def post(self, request, run_id):
        serializer = RunControlSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        action = serializer.validated_data["action"]
        run_manager = RunManager()

        run = run_manager.get_run(run_id)
        if not run:
            return Response(
                {"error": "Run not found", "runId": run_id},
                status=status.HTTP_404_NOT_FOUND,
            )

        if action == "pause":
            if run["paused"]:
                return Response(
                    {"error": "Run is already paused"},
                    status=status.HTTP_409_CONFLICT,
                )
            run_manager.pause_run(run_id)
            new_status = "paused"
        else:  # resume
            if not run["paused"]:
                return Response(
                    {"error": "Run is not paused"},
                    status=status.HTTP_409_CONFLICT,
                )
            run_manager.resume_run(run_id)
            new_status = "streaming"

        return Response(
            {
                "runId": run_id,
                "status": new_status,
                "currentStep": run["currentStep"],
            }
        )


class RunStepsView(APIView):
    """Get steps for a run (optional replay endpoint)."""

    def get(self, request, run_id):
        run_manager = RunManager()
        run = run_manager.get_run(run_id)

        if not run:
            return Response(
                {"error": "Run not found", "runId": run_id},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Get range parameters
        from_idx = int(request.query_params.get("from", 0))
        to_idx = int(request.query_params.get("to", run["totalSteps"] - 1))

        # Validate range
        if from_idx > to_idx:
            return Response(
                {"error": "from must be less than or equal to to"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if to_idx >= run["totalSteps"]:
            return Response(
                {"error": "Requested range exceeds totalSteps"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        steps = run["steps"][from_idx : to_idx + 1]

        return Response(
            {
                "runId": run_id,
                "from": from_idx,
                "to": to_idx,
                "steps": steps,
            }
        )
