"""
Base classes and types for algorithm implementations.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Generator


class AlgorithmCategory(str, Enum):
    SORTING = "sorting"
    SEARCHING = "searching"
    GRAPH = "graph"
    STACK = "stack"
    QUEUE = "queue"
    TREE = "tree"


@dataclass
class Complexity:
    time_best: str
    time_average: str
    time_worst: str
    space: str


@dataclass
class PseudocodeLine:
    line: int
    code: str
    indent: int = 0


@dataclass
class Operation:
    type: str  # compare, swap, visit, etc.
    indices: list[int] = field(default_factory=list)
    node_ids: list[str] = field(default_factory=list)
    edge_ids: list[dict] = field(default_factory=list)
    values: list[Any] = field(default_factory=list)
    result: Any = None


@dataclass
class Highlights:
    primary: list[int | str] = field(default_factory=list)
    secondary: list[int | str] = field(default_factory=list)
    success: list[int | str] = field(default_factory=list)
    inactive: list[int | str] = field(default_factory=list)


@dataclass
class Annotation:
    short: str
    detailed: str = ""
    insight: str = ""


@dataclass
class StateSnapshot:
    array: list[int | float] | None = None
    graph: dict | None = None
    stack: list[Any] | None = None
    queue: list[Any] | None = None
    variables: dict[str, Any] = field(default_factory=dict)


@dataclass
class Step:
    step_index: int
    state: StateSnapshot
    operations: list[Operation]
    highlights: Highlights
    annotation: Annotation
    pseudocode_lines: list[int]
    metadata: dict = field(default_factory=dict)


@dataclass
class AlgorithmMetadata:
    id: str
    name: str
    category: AlgorithmCategory
    description: str
    complexity: Complexity
    pseudocode: list[PseudocodeLine]


class AlgorithmSpec(ABC):
    """Base class for all algorithm implementations."""

    @property
    @abstractmethod
    def metadata(self) -> AlgorithmMetadata:
        """Return algorithm metadata."""
        pass

    @abstractmethod
    def validate_input(self, input_data: dict) -> tuple[bool, str | None]:
        """
        Validate input data.
        Returns (is_valid, error_message).
        """
        pass

    @abstractmethod
    def execute(self, input_data: dict) -> Generator[Step, None, None]:
        """
        Execute algorithm and yield steps.
        This is a generator that yields Step objects.
        """
        pass

    def get_initial_state(self, input_data: dict) -> StateSnapshot:
        """Return the initial state before any steps."""
        return StateSnapshot()
