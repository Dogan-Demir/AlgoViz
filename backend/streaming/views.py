"""
SSE streaming views.
"""

import json
import time
from typing import Generator

from django.http import StreamingHttpResponse
from django.views import View

from runs.services import RunManager


class SSEStreamView(View):
    """Server-Sent Events endpoint for streaming algorithm steps."""

    def get(self, request, run_id: str):
        run_manager = RunManager()
        run = run_manager.get_run(run_id)

        if not run:
            return StreamingHttpResponse(
                self._error_event("RUN_NOT_FOUND", "Run does not exist"),
                content_type="text/event-stream",
                status=404,
            )

        response = StreamingHttpResponse(
            self._stream_steps(run_id, run_manager),
            content_type="text/event-stream",
        )
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"  # Disable nginx buffering
        response["Access-Control-Allow-Origin"] = "*"
        return response

    def _stream_steps(self, run_id: str, run_manager: RunManager) -> Generator[str, None, None]:
        """Generator that yields SSE events."""
        run = run_manager.get_run(run_id)
        if not run:
            yield self._error_event("RUN_NOT_FOUND", "Run does not exist")
            return

        steps = run["steps"]
        current_index = 0

        while current_index < len(steps):
            # Check if paused
            if run_manager.is_paused(run_id):
                # Send heartbeat to keep connection alive
                yield ": heartbeat\n\n"
                time.sleep(1)
                continue

            step = steps[current_index]
            yield self._step_event(run_id, current_index, step)
            current_index += 1

            # Small delay to prevent overwhelming client
            time.sleep(0.05)

        # Send completion event
        final_state = steps[-1]["state"] if steps else {}
        yield self._complete_event(run_id, len(steps), final_state)

    def _step_event(self, run_id: str, index: int, step: dict) -> str:
        """Format a step as an SSE event."""
        return f"event: step\nid: {run_id}:{index}\ndata: {json.dumps(step)}\n\n"

    def _complete_event(self, run_id: str, total_steps: int, final_state: dict) -> str:
        """Format completion event."""
        data = {"totalSteps": total_steps, "finalState": final_state}
        return f"event: complete\nid: {run_id}:complete\ndata: {json.dumps(data)}\n\n"

    def _error_event(self, code: str, message: str) -> str:
        """Format error event."""
        data = {"code": code, "message": message}
        return f"event: error\ndata: {json.dumps(data)}\n\n"
