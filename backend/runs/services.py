"""
Service layer for run session management.
"""

import uuid
from datetime import datetime
from typing import Any

from algorithms.registry import AlgorithmRegistry

from .cache import run_cache


class RunManager:
    """Service for managing algorithm run sessions."""

    def __init__(self):
        self.cache = run_cache

    def create_run(self, algorithm_id: str, input_data: dict) -> dict | None:
        """Create a new run, execute algorithm, cache steps."""
        algorithm = AlgorithmRegistry.get(algorithm_id)
        if not algorithm:
            return None

        # Validate input
        is_valid, error = algorithm.validate_input(input_data)
        if not is_valid:
            raise ValueError(error)

        # Generate run ID
        run_id = str(uuid.uuid4())

        # Execute algorithm and collect all steps
        steps = []
        for step in algorithm.execute(input_data):
            step_dict = self._step_to_dict(step)
            step_dict["timestamp"] = datetime.utcnow().isoformat() + "Z"
            steps.append(step_dict)

        # Build run object
        run = {
            "runId": run_id,
            "algorithmId": algorithm_id,
            "input": input_data,
            "totalSteps": len(steps),
            "createdAt": datetime.utcnow().isoformat() + "Z",
            "algorithm": self._metadata_to_dict(algorithm.metadata),
            "steps": steps,
            "paused": False,
            "currentStep": 0,
        }

        # Cache the run
        self.cache.set(run_id, run)

        return run

    def get_run(self, run_id: str) -> dict | None:
        """Get a run by ID."""
        return self.cache.get(run_id)

    def pause_run(self, run_id: str) -> bool:
        """Pause a run."""
        run = self.cache.get(run_id)
        if run:
            run["paused"] = True
            self.cache.set(run_id, run)
            return True
        return False

    def resume_run(self, run_id: str) -> bool:
        """Resume a paused run."""
        run = self.cache.get(run_id)
        if run:
            run["paused"] = False
            self.cache.set(run_id, run)
            return True
        return False

    def is_paused(self, run_id: str) -> bool:
        """Check if run is paused."""
        run = self.cache.get(run_id)
        return run.get("paused", False) if run else False

    def _step_to_dict(self, step: Any) -> dict:
        """Convert Step dataclass to dict."""
        return {
            "stepIndex": step.step_index,
            "state": {
                "array": step.state.array,
                "graph": step.state.graph,
                "stack": step.state.stack,
                "queue": step.state.queue,
                "variables": step.state.variables,
            },
            "operations": [
                {
                    "type": op.type,
                    "indices": op.indices,
                    "nodeIds": op.node_ids,
                    "edgeIds": op.edge_ids,
                    "values": op.values,
                    "result": op.result,
                }
                for op in step.operations
            ],
            "highlights": {
                "primary": step.highlights.primary,
                "secondary": step.highlights.secondary,
                "success": step.highlights.success,
                "inactive": step.highlights.inactive,
            },
            "annotation": {
                "short": step.annotation.short,
                "detailed": step.annotation.detailed,
                "insight": step.annotation.insight,
            },
            "pseudocodeLines": step.pseudocode_lines,
            "metadata": step.metadata,
        }

    def _metadata_to_dict(self, metadata: Any) -> dict:
        """Convert AlgorithmMetadata to dict."""
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
