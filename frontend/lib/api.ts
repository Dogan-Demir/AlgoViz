import { API_BASE_URL } from './constants';
import type {
  AlgorithmMetadata,
  AlgorithmsListResponse,
  CreateRunRequest,
  RunMetadata,
} from './types';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      errorData.error || `HTTP error ${response.status}`,
      response.status,
      errorData
    );
  }

  return response.json();
}

export const api = {
  // List all algorithms
  async listAlgorithms(): Promise<AlgorithmsListResponse> {
    return fetchApi<AlgorithmsListResponse>('/api/algorithms');
  },

  // Get algorithm details
  async getAlgorithm(id: string): Promise<AlgorithmMetadata> {
    return fetchApi<AlgorithmMetadata>(`/api/algorithms/${id}`);
  },

  // Create a new run
  async createRun(data: CreateRunRequest): Promise<RunMetadata> {
    return fetchApi<RunMetadata>('/api/runs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get run metadata
  async getRun(runId: string): Promise<RunMetadata> {
    return fetchApi<RunMetadata>(`/api/runs/${runId}`);
  },

  // Control run (pause/resume)
  async controlRun(
    runId: string,
    action: 'pause' | 'resume'
  ): Promise<{ runId: string; status: string; currentStep: number }> {
    return fetchApi(`/api/runs/${runId}/control`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },
};

export { ApiError };
