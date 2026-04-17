import type { ApiErrorResponse } from './types';

interface ApiClientErrorOptions {
  code: number;
  status: number;
  waitUntil?: string;
}

export class ApiClientError extends Error {
  readonly code: number;
  readonly status: number;
  readonly waitUntil?: string;

  constructor(message: string, options: ApiClientErrorOptions) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options.code;
    this.status = options.status;
    this.waitUntil = options.waitUntil;
  }
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

function isResponse(value: unknown): value is Response {
  return value instanceof Response;
}

async function normalizeError(response: Response): Promise<ApiClientError> {
  const payload = await parseJson<ApiErrorResponse>(response);

  return new ApiClientError(payload.message, {
    code: payload.code,
    status: response.status,
    waitUntil: payload.waitUntil
  });
}

export async function requestJson<T>(request: Promise<Response>): Promise<T> {
  try {
    const response = await request;

    return await parseJson<T>(response);
  } catch (error) {
    if (isResponse(error)) {
      throw await normalizeError(error);
    }

    throw error;
  }
}
