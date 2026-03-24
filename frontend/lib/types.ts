// Algorithm types
export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'graph'
  | 'stack'
  | 'queue'
  | 'tree';

export interface Complexity {
  time: {
    best: string;
    average: string;
    worst: string;
  };
  space: string;
}

export interface PseudocodeLine {
  line: number;
  code: string;
  indent: number;
}

export interface AlgorithmMetadata {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: Complexity;
  pseudocode: PseudocodeLine[];
}

export interface AlgorithmListItem {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: Complexity;
}

// State types
export interface StateSnapshot {
  array?: number[];
  graph?: {
    nodes: GraphNode[];
    edges: GraphEdge[];
  };
  stack?: (string | number)[];
  queue?: (string | number)[];
  variables: Record<string, unknown>;
}

export interface GraphNode {
  id: string;
  value: string | number;
  x: number;
  y: number;
  state: 'unvisited' | 'visiting' | 'visited';
}

export interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  state: 'default' | 'considering' | 'relaxed' | 'rejected';
}

// Operation types
export interface Operation {
  type: string;
  indices: number[];
  nodeIds: string[];
  edgeIds: { from: string; to: string }[];
  values: (string | number)[];
  result: unknown;
}

export interface Highlights {
  primary: (number | string)[];
  secondary: (number | string)[];
  success: (number | string)[];
  inactive: (number | string)[];
}

export interface Annotation {
  short: string;
  detailed: string;
  insight: string;
}

// Step type
export interface Step {
  stepIndex: number;
  timestamp: string;
  state: StateSnapshot;
  operations: Operation[];
  highlights: Highlights;
  annotation: Annotation;
  pseudocodeLines: number[];
  metadata: Record<string, unknown>;
}

// Run types
export interface RunMetadata {
  runId: string;
  algorithmId: string;
  input: Record<string, unknown>;
  totalSteps: number;
  createdAt: string;
  algorithm: AlgorithmMetadata;
}

export interface CreateRunRequest {
  algorithmId: string;
  input: Record<string, unknown>;
}

// API response types
export interface AlgorithmsListResponse {
  algorithms: AlgorithmListItem[];
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}
