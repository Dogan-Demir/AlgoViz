import { API_BASE_URL } from './constants';
import { tokenStorage } from './auth';
import type {
  AlgorithmMetadata,
  AlgorithmsListResponse,
  AuthTokens,
  CreateRunRequest,
  RunMetadata,
  User,
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
  const token = tokenStorage.getAccess();

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

  // Auth
  async register(data: { email: string; password: string }): Promise<AuthTokens> {
    return fetchApi<AuthTokens>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: { email: string; password: string }): Promise<AuthTokens> {
    return fetchApi<AuthTokens>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async googleAuth(credential: string): Promise<AuthTokens> {
    return fetchApi<AuthTokens>('/api/users/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
  },

  async getMe(): Promise<User> {
    return fetchApi<User>('/api/users/me');
  },

  async updateMe(data: Partial<User>): Promise<User> {
    return fetchApi<User>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async refreshToken(refresh: string): Promise<{ access: string; refresh: string }> {
    return fetchApi('/api/users/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refresh }),
    });
  },
};

export { ApiError };
