import { firebaseAuth } from "@/lib/firebase";
import type { ApiError } from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api";

async function buildHeaders(headers?: HeadersInit) {
  const requestHeaders = new Headers(headers);

  if (!requestHeaders.has("Content-Type")) {
    requestHeaders.set("Content-Type", "application/json");
  }

  const token = await firebaseAuth?.currentUser?.getIdToken();

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  return requestHeaders;
}

async function toApiError(response: Response) {
  let message = `Request failed with status ${response.status}`;

  try {
    const payload = (await response.json()) as {
      error?: string;
      message?: string;
    };

    message = payload.message ?? payload.error ?? message;
  } catch {
    // Ignore non-JSON error bodies.
  }

  const error = new Error(message) as ApiError;
  error.status = response.status;

  return error;
}

export async function apiClient<T>(path: string, init: RequestInit = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: await buildHeaders(init.headers),
  });

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function getApiOrigin() {
  return API_BASE_URL.replace(/\/api\/?$/, "");
}
