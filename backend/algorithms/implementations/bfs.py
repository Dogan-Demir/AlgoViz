"""
Breadth-First Search (BFS) algorithm implementation.
"""

from collections import deque
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
class BFS(AlgorithmSpec):
    @property
    def metadata(self) -> AlgorithmMetadata:
        return AlgorithmMetadata(
            id="bfs",
            name="Breadth-First Search",
            category=AlgorithmCategory.GRAPH,
            description=(
                "A graph traversal algorithm that explores all neighbors at the present depth "
                "before moving to nodes at the next depth level."
            ),
            complexity=Complexity(
                time_best="O(V + E)",
                time_average="O(V + E)",
                time_worst="O(V + E)",
                space="O(V)",
            ),
            pseudocode=[
                PseudocodeLine(1, "procedure BFS(G: graph, start: node)"),
                PseudocodeLine(2, "create queue Q", indent=1),
                PseudocodeLine(3, "mark start as visited", indent=1),
                PseudocodeLine(4, "enqueue start to Q", indent=1),
                PseudocodeLine(5, "while Q is not empty do", indent=1),
                PseudocodeLine(6, "current = dequeue from Q", indent=2),
                PseudocodeLine(7, "process current", indent=2),
                PseudocodeLine(8, "for each neighbor of current do", indent=2),
                PseudocodeLine(9, "if neighbor not visited then", indent=3),
                PseudocodeLine(10, "mark neighbor as visited", indent=4),
                PseudocodeLine(11, "enqueue neighbor to Q", indent=4),
                PseudocodeLine(12, "end for", indent=2),
                PseudocodeLine(13, "end while", indent=1),
                PseudocodeLine(14, "end procedure"),
            ],
        )

    def validate_input(self, input_data: dict) -> tuple[bool, str | None]:
        if "nodes" not in input_data:
            return False, "Missing 'nodes' field"
        if "edges" not in input_data:
            return False, "Missing 'edges' field"
        if "start" not in input_data:
            return False, "Missing 'start' field"

        nodes = input_data["nodes"]
        if not isinstance(nodes, list) or len(nodes) < 1:
            return False, "'nodes' must be a non-empty list"
        if len(nodes) > 30:
            return False, "Graph must have at most 30 nodes"

        node_ids = set()
        for node in nodes:
            if "id" not in node:
                return False, "Each node must have an 'id'"
            node_ids.add(node["id"])

        edges = input_data["edges"]
        if not isinstance(edges, list):
            return False, "'edges' must be a list"
        for edge in edges:
            if "from" not in edge or "to" not in edge:
                return False, "Each edge must have 'from' and 'to'"
            if edge["from"] not in node_ids or edge["to"] not in node_ids:
                return False, "Edge references non-existent node"

        if input_data["start"] not in node_ids:
            return False, "Start node does not exist"

        return True, None

    def execute(self, input_data: dict) -> Generator[Step, None, None]:
        nodes = {n["id"]: n for n in input_data["nodes"]}
        edges = input_data["edges"]
        start = input_data["start"]
        step_index = 0

        # Build adjacency list
        adj: dict[str, list[str]] = {nid: [] for nid in nodes}
        for edge in edges:
            adj[edge["from"]].append(edge["to"])
            # Assume undirected for simplicity
            if edge.get("undirected", True):
                adj[edge["to"]].append(edge["from"])

        # State tracking
        node_states: dict[str, str] = {nid: "unvisited" for nid in nodes}
        edge_states: dict[tuple[str, str], str] = {
            (e["from"], e["to"]): "default" for e in edges
        }
        visited: set[str] = set()
        queue: deque[str] = deque()

        def build_graph_state() -> dict:
            return {
                "nodes": [
                    {
                        "id": nid,
                        "value": nodes[nid].get("value", nid),
                        "x": nodes[nid].get("x", 0),
                        "y": nodes[nid].get("y", 0),
                        "state": node_states[nid],
                    }
                    for nid in nodes
                ],
                "edges": [
                    {
                        "from": e["from"],
                        "to": e["to"],
                        "weight": e.get("weight"),
                        "state": edge_states.get((e["from"], e["to"]), "default"),
                    }
                    for e in edges
                ],
            }

        # Initial state
        yield Step(
            step_index=step_index,
            state=StateSnapshot(
                graph=build_graph_state(),
                queue=[],
                variables={"start": start, "visited": []},
            ),
            operations=[],
            highlights=Highlights(primary=[start]),
            annotation=Annotation(
                short=f"Start BFS from node {start}",
                detailed="Initialize empty queue and visited set.",
                insight="BFS uses a queue to ensure level-by-level traversal.",
            ),
            pseudocode_lines=[1, 2],
        )
        step_index += 1

        # Enqueue start
        queue.append(start)
        visited.add(start)
        node_states[start] = "visiting"

        yield Step(
            step_index=step_index,
            state=StateSnapshot(
                graph=build_graph_state(),
                queue=list(queue),
                variables={"current": None, "visited": list(visited)},
            ),
            operations=[
                Operation(type="enqueue", node_ids=[start]),
                Operation(type="mark", node_ids=[start], values=["visiting"]),
            ],
            highlights=Highlights(primary=[start]),
            annotation=Annotation(
                short=f"Enqueue start node {start}",
                detailed=f"Mark {start} as visiting and add to queue.",
                insight="We mark nodes when enqueuing to avoid duplicates.",
            ),
            pseudocode_lines=[3, 4],
        )
        step_index += 1

        while queue:
            current = queue.popleft()
            node_states[current] = "visited"

            yield Step(
                step_index=step_index,
                state=StateSnapshot(
                    graph=build_graph_state(),
                    queue=list(queue),
                    variables={"current": current, "visited": list(visited)},
                ),
                operations=[
                    Operation(type="dequeue", node_ids=[current]),
                    Operation(type="visit", node_ids=[current]),
                ],
                highlights=Highlights(
                    primary=[current],
                    success=[nid for nid, s in node_states.items() if s == "visited"],
                ),
                annotation=Annotation(
                    short=f"Dequeue and visit node {current}",
                    detailed=f"Process node {current}, will check its neighbors.",
                    insight="All nodes at current depth are processed before going deeper.",
                ),
                pseudocode_lines=[5, 6, 7],
            )
            step_index += 1

            # Check neighbors
            for neighbor in adj[current]:
                edge_key = (current, neighbor)
                reverse_key = (neighbor, current)

                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
                    node_states[neighbor] = "visiting"
                    if edge_key in edge_states:
                        edge_states[edge_key] = "relaxed"
                    if reverse_key in edge_states:
                        edge_states[reverse_key] = "relaxed"

                    yield Step(
                        step_index=step_index,
                        state=StateSnapshot(
                            graph=build_graph_state(),
                            queue=list(queue),
                            variables={
                                "current": current,
                                "neighbor": neighbor,
                                "visited": list(visited),
                            },
                        ),
                        operations=[
                            Operation(type="enqueue", node_ids=[neighbor]),
                            Operation(type="mark", node_ids=[neighbor], values=["visiting"]),
                        ],
                        highlights=Highlights(
                            primary=[current],
                            secondary=[neighbor],
                            success=[nid for nid, s in node_states.items() if s == "visited"],
                        ),
                        annotation=Annotation(
                            short=f"Enqueue unvisited neighbor {neighbor}",
                            detailed=f"Node {neighbor} hasn't been visited, add to queue.",
                            insight="The queue ensures we visit nodes in order of distance.",
                        ),
                        pseudocode_lines=[8, 9, 10, 11],
                    )
                    step_index += 1

        # Complete
        yield Step(
            step_index=step_index,
            state=StateSnapshot(
                graph=build_graph_state(),
                queue=[],
                variables={"visited": list(visited), "complete": True},
            ),
            operations=[],
            highlights=Highlights(success=list(visited)),
            annotation=Annotation(
                short="BFS traversal complete!",
                detailed=f"Visited all {len(visited)} reachable nodes.",
                insight="BFS guarantees shortest path in unweighted graphs.",
            ),
            pseudocode_lines=[13, 14],
        )
