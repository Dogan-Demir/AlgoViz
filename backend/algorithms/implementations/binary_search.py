"""
Binary Search algorithm implementation.
"""

from typing import Generator

from ..base import (
    AlgorithmCategory,
    AlgorithmMetadata,
    AlgorithmSpec,
    Annotation,
    Complexity,
    Highlights,
    Operation,
    PseudocodeLine,
    StateSnapshot,
    Step,
)
from ..registry import register_algorithm


@register_algorithm
class BinarySearch(AlgorithmSpec):
    @property
    def metadata(self) -> AlgorithmMetadata:
        return AlgorithmMetadata(
            id="binary-search",
            name="Binary Search",
            category=AlgorithmCategory.SEARCHING,
            description=(
                "An efficient search algorithm that finds a target value in a sorted array "
                "by repeatedly dividing the search interval in half."
            ),
            complexity=Complexity(
                time_best="O(1)",
                time_average="O(log n)",
                time_worst="O(log n)",
                space="O(1)",
            ),
            pseudocode=[
                PseudocodeLine(1, "procedure binarySearch(A: sorted list, target)"),
                PseudocodeLine(2, "low = 0", indent=1),
                PseudocodeLine(3, "high = length(A) - 1", indent=1),
                PseudocodeLine(4, "while low <= high do", indent=1),
                PseudocodeLine(5, "mid = (low + high) / 2", indent=2),
                PseudocodeLine(6, "if A[mid] == target then", indent=2),
                PseudocodeLine(7, "return mid", indent=3),
                PseudocodeLine(8, "else if A[mid] < target then", indent=2),
                PseudocodeLine(9, "low = mid + 1", indent=3),
                PseudocodeLine(10, "else", indent=2),
                PseudocodeLine(11, "high = mid - 1", indent=3),
                PseudocodeLine(12, "end while", indent=1),
                PseudocodeLine(13, "return -1 (not found)"),
            ],
        )

    def validate_input(self, input_data: dict) -> tuple[bool, str | None]:
        if "array" not in input_data:
            return False, "Missing 'array' field"
        if "target" not in input_data:
            return False, "Missing 'target' field"
        arr = input_data["array"]
        if not isinstance(arr, list):
            return False, "'array' must be a list"
        if len(arr) < 1:
            return False, "Array must have at least 1 element"
        if len(arr) > 50:
            return False, "Array must have at most 50 elements"
        if not all(isinstance(x, (int, float)) for x in arr):
            return False, "Array must contain only numbers"
        if arr != sorted(arr):
            return False, "Array must be sorted for binary search"
        if not isinstance(input_data["target"], (int, float)):
            return False, "'target' must be a number"
        return True, None

    def execute(self, input_data: dict) -> Generator[Step, None, None]:
        arr = input_data["array"]
        target = input_data["target"]
        n = len(arr)
        low, high = 0, n - 1
        step_index = 0
        eliminated: list[int] = []

        # Initial state
        yield Step(
            step_index=step_index,
            state=StateSnapshot(
                array=arr, variables={"low": low, "high": high, "target": target}
            ),
            operations=[],
            highlights=Highlights(secondary=list(range(n))),
            annotation=Annotation(
                short=f"Search for {target} in sorted array",
                detailed=f"Binary search will find {target} in O(log n) time.",
                insight="The array must be sorted for binary search to work.",
            ),
            pseudocode_lines=[1, 2, 3],
        )
        step_index += 1

        while low <= high:
            mid = (low + high) // 2

            # Show mid calculation
            yield Step(
                step_index=step_index,
                state=StateSnapshot(
                    array=arr,
                    variables={"low": low, "high": high, "mid": mid, "target": target},
                ),
                operations=[Operation(type="set", values=["mid", mid])],
                highlights=Highlights(
                    primary=[mid],
                    secondary=[i for i in range(low, high + 1) if i != mid],
                    inactive=eliminated.copy(),
                ),
                annotation=Annotation(
                    short=f"Calculate mid = {mid}",
                    detailed=f"mid = ({low} + {high}) / 2 = {mid}",
                    insight="We always check the middle element first.",
                ),
                pseudocode_lines=[4, 5],
            )
            step_index += 1

            # Compare
            if arr[mid] == target:
                yield Step(
                    step_index=step_index,
                    state=StateSnapshot(
                        array=arr,
                        variables={
                            "low": low,
                            "high": high,
                            "mid": mid,
                            "target": target,
                            "found": True,
                        },
                    ),
                    operations=[
                        Operation(
                            type="compare", indices=[mid], values=[arr[mid], target], result=True
                        ),
                        Operation(type="found", indices=[mid], values=[target]),
                    ],
                    highlights=Highlights(success=[mid], inactive=eliminated.copy()),
                    annotation=Annotation(
                        short=f"Found {target} at index {mid}!",
                        detailed=f"A[{mid}] = {arr[mid]} equals target {target}.",
                        insight="Binary search found the target efficiently.",
                    ),
                    pseudocode_lines=[6, 7],
                )
                return

            elif arr[mid] < target:
                eliminated.extend(range(low, mid + 1))
                yield Step(
                    step_index=step_index,
                    state=StateSnapshot(
                        array=arr,
                        variables={"low": mid + 1, "high": high, "mid": mid, "target": target},
                    ),
                    operations=[
                        Operation(
                            type="compare", indices=[mid], values=[arr[mid], target], result=False
                        )
                    ],
                    highlights=Highlights(
                        primary=[mid],
                        secondary=list(range(mid + 1, high + 1)),
                        inactive=eliminated.copy(),
                    ),
                    annotation=Annotation(
                        short=f"{arr[mid]} < {target}, search right half",
                        detailed=f"Since {arr[mid]} < {target}, the target must be in the right half.",
                        insight="We eliminate the left half including mid.",
                    ),
                    pseudocode_lines=[8, 9],
                )
                low = mid + 1
            else:
                eliminated.extend(range(mid, high + 1))
                yield Step(
                    step_index=step_index,
                    state=StateSnapshot(
                        array=arr,
                        variables={"low": low, "high": mid - 1, "mid": mid, "target": target},
                    ),
                    operations=[
                        Operation(
                            type="compare", indices=[mid], values=[arr[mid], target], result=False
                        )
                    ],
                    highlights=Highlights(
                        primary=[mid],
                        secondary=list(range(low, mid)),
                        inactive=eliminated.copy(),
                    ),
                    annotation=Annotation(
                        short=f"{arr[mid]} > {target}, search left half",
                        detailed=f"Since {arr[mid]} > {target}, the target must be in the left half.",
                        insight="We eliminate the right half including mid.",
                    ),
                    pseudocode_lines=[10, 11],
                )
                high = mid - 1

            step_index += 1

        # Not found
        yield Step(
            step_index=step_index,
            state=StateSnapshot(
                array=arr, variables={"low": low, "high": high, "target": target, "found": False}
            ),
            operations=[Operation(type="not_found", values=[target])],
            highlights=Highlights(inactive=list(range(n))),
            annotation=Annotation(
                short=f"{target} not found in array",
                detailed="Search space exhausted. Target does not exist in array.",
                insight="Binary search confirms absence in O(log n) time.",
            ),
            pseudocode_lines=[12, 13],
        )
