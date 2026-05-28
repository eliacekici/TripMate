import { getApiBaseUrls } from './apiBaseUrl';

export const apiFetch = async (path: string, init?: RequestInit): Promise<Response> => {
  const urls = getApiBaseUrls();
  const timeoutMs = 12000;

  const attempts = urls.map(async (baseUrl) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(`${baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }
  });

  const results = await Promise.allSettled(attempts);
  const successfulResponse = results.find(
    (result): result is PromiseFulfilledResult<Response> =>
      result.status === 'fulfilled' && result.value.ok
  );

  if (successfulResponse) {
    return successfulResponse.value;
  }

  const firstFulfilled = results.find(
    (result): result is PromiseFulfilledResult<Response> => result.status === 'fulfilled'
  );

  if (firstFulfilled) {
    return firstFulfilled.value;
  }

  const firstRejected = results.find(
    (result): result is PromiseRejectedResult => result.status === 'rejected'
  );

  throw new Error(
    `Network request failed for all backend hosts: ${urls.join(', ')}. Last error: ${
      firstRejected ? String(firstRejected.reason) : 'unknown'
    }`
  );
};
