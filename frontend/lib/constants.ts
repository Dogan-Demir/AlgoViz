export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const SPEED_OPTIONS = [0.5, 1, 2, 4] as const;

export const DEFAULT_SPEED = 1;

export const ARRAY_INPUT_LIMITS = {
  minLength: 2,
  maxLength: 50,
  minValue: -1000000,
  maxValue: 1000000,
};

export const GRAPH_INPUT_LIMITS = {
  maxNodes: 30,
  maxEdges: 100,
};

export const CATEGORY_LABELS: Record<string, string> = {
  sorting: 'Sorting',
  searching: 'Searching',
  graph: 'Graph',
  stack: 'Stack',
  queue: 'Queue',
  tree: 'Tree',
};

export const CATEGORY_COLORS: Record<string, string> = {
  sorting: 'bg-blue-100 text-blue-800',
  searching: 'bg-green-100 text-green-800',
  graph: 'bg-purple-100 text-purple-800',
  stack: 'bg-orange-100 text-orange-800',
  queue: 'bg-yellow-100 text-yellow-800',
  tree: 'bg-pink-100 text-pink-800',
};
