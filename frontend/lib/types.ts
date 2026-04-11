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

// Auth types
export interface User {
  id: number;
  email: string;
  has_completed_onboarding: boolean;
  avatar_url: string;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

// Quiz types
export interface QuizQuestion {
  id: number;
  algorithm_id: string;
  question_type: 'multiple_choice' | 'step_prediction' | 'complexity' | 'scenario';
  difficulty: 'easy' | 'medium' | 'hard';
  question_text: string;
  options: string[];
  points: number;
}

export interface AnswerResult {
  question_id: number;
  correct: boolean;
  correct_answer: number;
  explanation: string;
  points_earned: number;
}

export interface QuizAttemptResult {
  score: number;
  max_score: number;
  correct_count: number;
  total_questions: number;
  results: AnswerResult[];
  new_total_score: number;
  current_streak: number;
}

export interface UserProgress {
  algorithm_id: string;
  quizzes_passed: number;
  challenges_completed: number;
  is_confident: boolean;
  is_completed: boolean;
  last_activity: string;
}

export interface LeaderboardEntry {
  rank: number;
  email: string;
  total_score: number;
  current_streak: number;
}

// API response types
export interface AlgorithmsListResponse {
  algorithms: AlgorithmListItem[];
}

export interface ErrorResponse {
  error: string;
  details?: Record<string, unknown>;
}
