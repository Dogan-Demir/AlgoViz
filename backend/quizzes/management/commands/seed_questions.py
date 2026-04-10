"""
Management command to seed quiz questions for all algorithms.
Run with: python manage.py seed_questions
"""

from django.core.management.base import BaseCommand

from quizzes.models import Question

QUESTIONS = [
    # ── Bubble Sort ──────────────────────────────────────────────────────────
    {
        "algorithm_id": "bubble-sort",
        "question_type": "complexity",
        "difficulty": "easy",
        "question_text": "What is the average-case time complexity of Bubble Sort?",
        "options": ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
        "correct_answer": 2,
        "explanation": "Bubble Sort compares adjacent pairs in nested loops, giving O(n²) average-case performance.",
    },
    {
        "algorithm_id": "bubble-sort",
        "question_type": "complexity",
        "difficulty": "easy",
        "question_text": "What is the space complexity of Bubble Sort?",
        "options": ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        "correct_answer": 3,
        "explanation": "Bubble Sort sorts in-place using only a constant amount of extra memory.",
    },
    {
        "algorithm_id": "bubble-sort",
        "question_type": "multiple_choice",
        "difficulty": "easy",
        "question_text": "What does Bubble Sort do in each pass through the array?",
        "options": [
            "Finds the minimum element and moves it to the front",
            "Repeatedly swaps adjacent elements that are in the wrong order",
            "Splits the array in half and sorts each half",
            "Inserts each element into its correct position",
        ],
        "correct_answer": 1,
        "explanation": "Bubble Sort compares each pair of adjacent items and swaps them if they are in the wrong order.",
    },
    {
        "algorithm_id": "bubble-sort",
        "question_type": "step_prediction",
        "difficulty": "medium",
        "question_text": "Given the array [5, 3, 8, 1], what does the array look like after the first complete pass of Bubble Sort?",
        "options": ["[1, 3, 5, 8]", "[3, 5, 1, 8]", "[3, 5, 8, 1]", "[1, 5, 3, 8]"],
        "correct_answer": 1,
        "explanation": "After one pass: compare 5&3 → swap → [3,5,8,1]; compare 5&8 → no swap; compare 8&1 → swap → [3,5,1,8]. The largest element (8) bubbles to the end.",
    },
    {
        "algorithm_id": "bubble-sort",
        "question_type": "scenario",
        "difficulty": "medium",
        "question_text": "When is Bubble Sort most efficient?",
        "options": [
            "When the array is sorted in reverse order",
            "When the array is already nearly sorted",
            "When the array has many duplicates",
            "When the array is very large",
        ],
        "correct_answer": 1,
        "explanation": "With the early-exit optimisation, Bubble Sort runs in O(n) on a nearly sorted array because very few swaps are needed.",
    },
    {
        "algorithm_id": "bubble-sort",
        "question_type": "complexity",
        "difficulty": "hard",
        "question_text": "What is the best-case time complexity of an optimised Bubble Sort (with early exit)?",
        "options": ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
        "correct_answer": 2,
        "explanation": "If no swaps occur in a pass, the array is already sorted. The optimised version exits after one O(n) pass in this case.",
    },

    # ── Binary Search ─────────────────────────────────────────────────────────
    {
        "algorithm_id": "binary-search",
        "question_type": "complexity",
        "difficulty": "easy",
        "question_text": "What is the time complexity of Binary Search?",
        "options": ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        "correct_answer": 2,
        "explanation": "Binary Search halves the search space on every step, giving O(log n) time complexity.",
    },
    {
        "algorithm_id": "binary-search",
        "question_type": "multiple_choice",
        "difficulty": "easy",
        "question_text": "What is a requirement for Binary Search to work correctly?",
        "options": [
            "The array must be sorted",
            "The array must have an even number of elements",
            "The array must contain unique elements",
            "The array must be stored in a hash table",
        ],
        "correct_answer": 0,
        "explanation": "Binary Search relies on the sorted order of the array to decide which half to discard at each step.",
    },
    {
        "algorithm_id": "binary-search",
        "question_type": "step_prediction",
        "difficulty": "medium",
        "question_text": "Searching for 7 in [1, 3, 5, 7, 9, 11]. What is the first mid index checked?",
        "options": ["0", "2", "3", "5"],
        "correct_answer": 2,
        "explanation": "low=0, high=5, mid = (0+5)//2 = 2. array[2] = 5, which is less than 7, so we search the right half next.",
    },
    {
        "algorithm_id": "binary-search",
        "question_type": "scenario",
        "difficulty": "medium",
        "question_text": "Binary Search is searching for a value that does NOT exist in the array. When does it stop?",
        "options": [
            "After checking every element",
            "When low > high",
            "After log n steps exactly",
            "When mid equals the target",
        ],
        "correct_answer": 1,
        "explanation": "Binary Search terminates when low > high, meaning the search space is empty and the element is not present.",
    },
    {
        "algorithm_id": "binary-search",
        "question_type": "complexity",
        "difficulty": "hard",
        "question_text": "How many comparisons does Binary Search need in the worst case for an array of 1024 elements?",
        "options": ["1024", "512", "10", "20"],
        "correct_answer": 2,
        "explanation": "log₂(1024) = 10. Binary Search needs at most 10 comparisons to search 1024 elements.",
    },

    # ── BFS ───────────────────────────────────────────────────────────────────
    {
        "algorithm_id": "bfs",
        "question_type": "multiple_choice",
        "difficulty": "easy",
        "question_text": "What data structure does BFS use to track the next nodes to visit?",
        "options": ["Stack", "Queue", "Priority Queue", "Hash Map"],
        "correct_answer": 1,
        "explanation": "BFS uses a queue (FIFO) so it processes nodes level by level, visiting all neighbours before going deeper.",
    },
    {
        "algorithm_id": "bfs",
        "question_type": "complexity",
        "difficulty": "easy",
        "question_text": "What is the time complexity of BFS on a graph with V vertices and E edges?",
        "options": ["O(V)", "O(E)", "O(V + E)", "O(V × E)"],
        "correct_answer": 2,
        "explanation": "BFS visits every vertex once and traverses every edge once, giving O(V + E) time.",
    },
    {
        "algorithm_id": "bfs",
        "question_type": "scenario",
        "difficulty": "medium",
        "question_text": "What is BFS guaranteed to find when used on an unweighted graph?",
        "options": [
            "The path with the fewest total edge weights",
            "The shortest path in terms of number of edges",
            "The path through the lowest-numbered nodes",
            "A path, but not necessarily the shortest",
        ],
        "correct_answer": 1,
        "explanation": "Because BFS explores nodes level by level, the first time it reaches a node it has taken the fewest possible edges to get there.",
    },
    {
        "algorithm_id": "bfs",
        "question_type": "multiple_choice",
        "difficulty": "medium",
        "question_text": "Why does BFS mark nodes as visited before adding them to the queue?",
        "options": [
            "To save memory",
            "To prevent visiting the same node multiple times and causing infinite loops",
            "Because visited nodes are removed from the graph",
            "It doesn't matter when nodes are marked",
        ],
        "correct_answer": 1,
        "explanation": "Marking a node visited when it is enqueued (not when it is dequeued) prevents it from being added to the queue more than once.",
    },
    {
        "algorithm_id": "bfs",
        "question_type": "complexity",
        "difficulty": "hard",
        "question_text": "What is the space complexity of BFS in the worst case?",
        "options": ["O(1)", "O(log V)", "O(V)", "O(V + E)"],
        "correct_answer": 2,
        "explanation": "In the worst case (e.g. a star graph), BFS may enqueue all V vertices simultaneously, requiring O(V) space.",
    },
]


class Command(BaseCommand):
    help = "Seed the database with quiz questions for all algorithms"

    def handle(self, *args, **options):
        created = 0
        for q in QUESTIONS:
            obj, was_created = Question.objects.get_or_create(
                algorithm_id=q["algorithm_id"],
                question_text=q["question_text"],
                defaults={
                    "question_type": q["question_type"],
                    "difficulty": q["difficulty"],
                    "options": q["options"],
                    "correct_answer": q["correct_answer"],
                    "explanation": q.get("explanation", ""),
                },
            )
            if was_created:
                created += 1

        self.stdout.write(
            self.style.SUCCESS(f"Done — {created} new questions added ({len(QUESTIONS) - created} already existed)")
        )
