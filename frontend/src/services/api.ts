const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://buzzspy-backend.yourname.repl.co';

export const API_ENDPOINTS = {
  STREAM: `${API_BASE_URL}/api/stream`,
  START: `${API_BASE_URL}/api/stream/start`,
  STOP: `${API_BASE_URL}/api/stream/stop`,
  STATUS: `${API_BASE_URL}/api/stream/status`,
  HEALTH: `${API_BASE_URL}/health`,
};

export async function startStream(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.START, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to start stream');
  }

  return response.json();
}

export async function stopStream(): Promise<void> {
  const response = await fetch(API_ENDPOINTS.STOP, {
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Failed to stop stream');
  }

  return response.json();
}

export async function getStreamStatus(): Promise<any> {
  const response = await fetch(API_ENDPOINTS.STATUS);

  if (!response.ok) {
    throw new Error('Failed to get stream status');
  }

  return response.json();
}

export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINTS.HEALTH);
    return response.ok;
  } catch {
    return false;
  }
}