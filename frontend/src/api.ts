// Base URL (dev): http://127.0.0.1:8000
export const BASE = 'http://127.0.0.1:8000';

export type JobStatus = 'pending' | 'running' | 'success' | 'failed';

export interface ScratchpadEntry {
  step: number;
  node: string;
  event: string;
  ts: string;
  payload: Record<string, unknown>;
}

export interface JobStatusResponse {
  job_id: string;
  status: JobStatus;
  sdk_url: string | null;
  scratchpad: ScratchpadEntry[];
}

export interface GenerateResponse {
  job_id: string;
}

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(status: number, message: string, data?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

/**
 * Submit API Docs URL to initiate SDK generation
 * POST /generate
 */
export async function generateSdk(url: string): Promise<GenerateResponse> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Is the backend running?");
  }

  if (response.status === 422) {
    throw new ApiError(422, 'Please enter a valid URL.');
  }

  if (!response.ok) {
    let errMessage = 'Failed to submit generation job.';
    try {
      const errJson = await response.json();
      if (errJson?.detail) {
        errMessage = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail);
      }
    } catch {
      // ignore
    }
    throw new ApiError(response.status, errMessage);
  }

  return response.json();
}

/**
 * Fetch Job status
 * GET /jobs/{job_id}
 */
export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  let response: Response;
  try {
    response = await fetch(`${BASE}/jobs/${jobId}`);
  } catch {
    throw new ApiError(0, "Couldn't reach the server. Is the backend running?");
  }

  if (response.status === 404) {
    throw new ApiError(404, 'Job not found.');
  }

  if (response.status >= 500) {
    throw new ApiError(response.status, 'Server error. Try again.');
  }

  if (!response.ok) {
    throw new ApiError(response.status, `Unexpected error: ${response.status}`);
  }

  return response.json();
}
