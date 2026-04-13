const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `API error: ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  getState: () => request('/state'),
  health: () => request('/health'),

  createCategory: (payload: unknown) => request('/categories', { method: 'POST', body: JSON.stringify(payload) }),
  updateCategory: (id: string, payload: unknown) => request(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteCategory: (id: string) => request(`/categories/${id}`, { method: 'DELETE' }),

  createTopic: (payload: unknown) => request('/topics', { method: 'POST', body: JSON.stringify(payload) }),
  updateTopic: (id: string, payload: unknown) => request(`/topics/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteTopic: (id: string) => request(`/topics/${id}`, { method: 'DELETE' }),

  createNote: (payload: unknown) => request('/notes', { method: 'POST', body: JSON.stringify(payload) }),
  updateNote: (id: string, payload: unknown) => request(`/notes/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  deleteNote: (id: string) => request(`/notes/${id}`, { method: 'DELETE' }),
  toggleFavorite: (id: string) => request(`/notes/${id}/toggle-favorite`, { method: 'POST' }),
  togglePin: (id: string) => request(`/notes/${id}/toggle-pin`, { method: 'POST' }),
  viewNote: (id: string) => request(`/notes/${id}/view`, { method: 'POST' }),

  createTag: (payload: unknown) => request('/tags', { method: 'POST', body: JSON.stringify(payload) }),
  deleteTag: (id: string) => request(`/tags/${id}`, { method: 'DELETE' }),

  startLearningSession: (payload: unknown) => request('/learning-sessions', { method: 'POST', body: JSON.stringify(payload) }),
  pauseLearningSession: (id: string) => request(`/learning-sessions/${id}/pause`, { method: 'POST' }),
  resumeLearningSession: (id: string) => request(`/learning-sessions/${id}/resume`, { method: 'POST' }),
  completeLearningSession: (id: string) => request(`/learning-sessions/${id}/complete`, { method: 'POST' }),
  updateLearningProgress: (payload: unknown) => request('/learning-progress', { method: 'POST', body: JSON.stringify(payload) }),

  upsertTimeTracking: (payload: unknown) => request('/time-tracking/upsert', { method: 'POST', body: JSON.stringify(payload) }),
};
