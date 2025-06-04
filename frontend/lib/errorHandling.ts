export enum ErrorCategory {
  Network = 'network',
  Client = 'client',
  Server = 'server',
  Unknown = 'unknown',
}

export interface AppError extends Error {
  category: ErrorCategory;
  status?: number;
}

/**
 * Simple exponential backoff retry wrapper around fetch. Retries are only
 * triggered for network errors or 5xx server responses.
 */
export async function fetchWithRetry(
  input: RequestInfo | URL,
  init?: RequestInit,
  retries = 3,
  backoffMs = 500,
): Promise<Response> {
  let attempt = 0;
  while (true) {
    try {
      const response = await fetch(input, init);
      if (response.ok) {
        return response;
      }
      if (response.status >= 500 && attempt < retries) {
        await delay(backoffMs * Math.pow(2, attempt));
        attempt++;
        continue;
      }
      const err: AppError = new Error(`Request failed with status ${response.status}`) as AppError;
      err.category = response.status >= 500 ? ErrorCategory.Server : ErrorCategory.Client;
      err.status = response.status;
      throw err;
    } catch (e: any) {
      if (e instanceof Error && (e.name === 'TypeError' || e.message.includes('Failed to fetch'))) {
        if (attempt < retries) {
          await delay(backoffMs * Math.pow(2, attempt));
          attempt++;
          continue;
        }
        const err: AppError = new Error(e.message) as AppError;
        err.category = ErrorCategory.Network;
        throw err;
      }
      const err: AppError = e instanceof Error ? e as AppError : new Error(String(e)) as AppError;
      err.category = ErrorCategory.Unknown;
      throw err;
    }
  }
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
