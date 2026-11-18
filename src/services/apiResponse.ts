export interface JsonResult<T> {
  ok: boolean;
  status: number;
  data: T | null;
  error?: string;
}

/**
 * Reads an API response without ever throwing on a non-JSON body.
 * Static hosts (e.g. a Vercel static build) answer missing /api routes with an
 * HTML or plain-text 404 page; parsing that as JSON produced confusing errors
 * like "Unexpected token 'T', \"The page c\" ...".
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<JsonResult<T>> {
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (err) {
    return {
      ok: false,
      status: 0,
      data: null,
      error: err instanceof Error ? err.message : 'Network request failed.',
    };
  }

  const contentType = response.headers.get('content-type') ?? '';
  let data: T | null = null;

  if (contentType.includes('application/json')) {
    try {
      data = (await response.json()) as T;
    } catch {
      data = null;
    }
  } else {
    try {
      await response.text();
    } catch {
      // Ignore unreadable error bodies.
    }
  }

  if (!response.ok) {
    const upstreamError =
      data && typeof data === 'object' && 'error' in data
        ? String((data as { error?: unknown }).error ?? '')
        : '';
    return {
      ok: false,
      status: response.status,
      data,
      error: upstreamError || `Request failed (${response.status}).`,
    };
  }

  if (data === null) {
    return {
      ok: false,
      status: response.status,
      data: null,
      error: 'Backend API is not available on this deployment.',
    };
  }

  return { ok: true, status: response.status, data };
}
