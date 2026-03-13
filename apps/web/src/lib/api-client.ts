import { auth } from "@/lib/firebase";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5062/api";

/** Structured API error with an optional machine-readable code. */
export class ApiError extends Error {
  code: string;
  constructor(message: string, code = "ApiError") {
    super(message);
    this.name = "ApiError";
    this.code = code;
  }
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) throw new Error("User is not authenticated.");

  const token = await user.getIdToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

interface ApiErrorResponse {
  error: string;
  message?: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body: ApiErrorResponse = await response.json().catch(() => ({
      error: "An unexpected error occurred.",
    }));
    // Structured errors: { error: "ErrorCode", message: "Human-readable text" }
    // Legacy errors:     { error: "Human-readable text" }
    const hasCode = body.message !== undefined;
    const message = hasCode ? body.message! : body.error;
    const code = hasCode ? body.error : "ApiError";
    throw new ApiError(message, code);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export async function apiGet<T>(path: string): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, { headers });
  return handleResponse<T>(response);
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(body),
  });
  return handleResponse<T>(response);
}

export async function apiDelete(path: string): Promise<void> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "DELETE",
    headers,
  });
  return handleResponse<void>(response);
}
