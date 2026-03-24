"""
Bubble Sort algorithm implementation.
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
class BubbleSort(AlgorithmSpec):
    @property
    def metadata(self) -> AlgorithmMetadata:
        return AlgorithmMetadata(
            id="bubble-sort",
            name="Bubble Sort",
            category=AlgorithmCategory.SORTING,
            description=(
                "A simple sorting algorithm that repeatedly steps through the list, "
                "compares adjacent elements, and swaps them if they are in the wrong order."
            ),
            complexity=Complexity(
                time_best="O(n)",
                time_average="O(n²)",
                time_worst="O(n²)",
                space="O(1)",
            ),
            pseudocode=[
                PseudocodeLine(1, "procedure bubbleSort(A: list)"),
                PseudocodeLine(2, "n = length(A)", indent=1),
                PseudocodeLine(3, "for i = 0 to n-1 do", indent=1),
                PseudocodeLine(4, "for j = 0 to n-i-2 do", indent=2),
                PseudocodeLine(5, "if A[j] > A[j+1] then", indent=3),
                PseudocodeLine(6, "swap(A[j], A[j+1])", indent=4),
                PseudocodeLine(7, "end if", indent=3),
                PseudocodeLine(8, "end for", indent=2),
                PseudocodeLine(9, "end for", indent=1),
                PseudocodeLine(10, "end procedure"),
            ],
        )

    def validate_input(self, input_data: dict) -> tuple[bool, str | None]:
        if "array" not in input_data:
            return False, "Missing 'array' field"
        arr = input_data["array"]
        if not isinstance(arr, list):
            return False, "'array' must be a list"
        if len(arr) < 2:
            return False, "Array must have at least 2 elements"
        if len(arr) > 50:
            return False, "Array must have at most 50 elements"
        if not all(isinstance(x, (int, float)) for x in arr):
            return False, "Array must contain only numbers"
        return True, None

    def execute(self, input_data: dict) -> Generator[Step, None, None]:
        arr = input_data["array"].copy()
        n = len(arr)
        step_index = 0

        # Initial state
        yield Step(
            step_index=step_index,
            state=StateSnapshot(array=arr.copy(), variables={"i": 0, "j": 0, "n": n}),
            operations=[],
            highlights=Highlights(),
            annotation=Annotation(
                short="Starting Bubble Sort",
                detailed=f"We will sort an array of {n} elements.",
                insight="Bubble sort compares adjacent pairs and swaps if needed.",
            ),
            pseudocode_lines=[1, 2],
        )
        step_index += 1

        for i in range(n):
            for j in range(n - i - 1):
                # Compare step
                comparing = arr[j] > arr[j + 1]
                yield Step(
                    step_index=step_index,
                    state=StateSnapshot(
                        array=arr.copy(),
                        variables={"i": i, "j": j, "comparing": f"{arr[j]} > {arr[j+1]}"},
                    ),
                    operations=[
                        Operation(
                            type="compare",
                            indices=[j, j + 1],
                            values=[arr[j], arr[j + 1]],
                            result=comparing,
                        )
                    ],
                    highlights=Highlights(
                        primary=[j, j + 1],
                        success=list(range(n - i, n)),  # Already sorted portion
                    ),
                    annotation=Annotation(
                        short=f"Compare {arr[j]} and {arr[j+1]}",
                        detailed=f"Comparing elements at positions {j} and {j+1}.",
                        insight="We check if the left element is greater than the right.",
                    ),
                    pseudocode_lines=[4, 5],
                )
                step_index += 1

                if comparing:
                    # Swap
                    old_left, old_right = arr[j], arr[j + 1]
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
                    yield Step(
                        step_index=step_index,
                        state=StateSnapshot(
                            array=arr.copy(), variables={"i": i, "j": j, "swapped": True}
                        ),
                        operations=[
                            Operation(
                                type="swap",
                                indices=[j, j + 1],
                                values=[old_left, old_right],
                            )
                        ],
                        highlights=Highlights(
                            primary=[j, j + 1],
                            success=list(range(n - i, n)),
                        ),
                        annotation=Annotation(
                            short=f"Swap {old_left} and {old_right}",
                            detailed=f"Since {old_left} > {old_right}, we swap them.",
                            insight="Larger elements 'bubble up' towards the end.",
                        ),
                        pseudocode_lines=[6],
                    )
                    step_index += 1

        # Final state
        yield Step(
            step_index=step_index,
            state=StateSnapshot(array=arr.copy(), variables={"sorted": True}),
            operations=[],
            highlights=Highlights(success=list(range(n))),
            annotation=Annotation(
                short="Array is now sorted!",
                detailed="Bubble sort complete. All elements are in order.",
                insight=f"Total comparisons made: approximately {n*(n-1)//2}",
            ),
            pseudocode_lines=[10],
        )
