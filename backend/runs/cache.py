"""
In-memory cache for run sessions.
"""

import threading
import time
from typing import Any


class RunCache:
    """Thread-safe in-memory cache for run sessions with TTL."""

    def __init__(self, ttl_seconds: int = 300):  # 5 minute default TTL
        self._cache: dict[str, dict[str, Any]] = {}
        self._timestamps: dict[str, float] = {}
        self._ttl = ttl_seconds
        self._lock = threading.Lock()

    def set(self, key: str, value: dict[str, Any]) -> None:
        """Store a value in the cache."""
        with self._lock:
            self._cache[key] = value
            self._timestamps[key] = time.time()

    def get(self, key: str) -> dict[str, Any] | None:
        """Retrieve a value from the cache."""
        with self._lock:
            if key not in self._cache:
                return None
            # Check TTL
            if time.time() - self._timestamps[key] > self._ttl:
                del self._cache[key]
                del self._timestamps[key]
                return None
            return self._cache[key]

    def delete(self, key: str) -> bool:
        """Delete a value from the cache."""
        with self._lock:
            if key in self._cache:
                del self._cache[key]
                del self._timestamps[key]
                return True
            return False

    def clear(self) -> None:
        """Clear all cached values."""
        with self._lock:
            self._cache.clear()
            self._timestamps.clear()

    def cleanup_expired(self) -> int:
        """Remove expired entries. Returns number of entries removed."""
        with self._lock:
            now = time.time()
            expired = [k for k, t in self._timestamps.items() if now - t > self._ttl]
            for key in expired:
                del self._cache[key]
                del self._timestamps[key]
            return len(expired)


# Global cache instance
run_cache = RunCache()
