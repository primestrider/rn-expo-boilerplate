import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { mmkvStorage, storageKeys } from "@/plugins/mmkv";
import type { ApiError, CustomAxiosRequestConfig } from "@/shared/models";

/**
 * Reads the stored access token.
 *
 * MMKV is synchronous, so the interceptor can stay synchronous too — no
 * request is ever delayed waiting on storage.
 */
function readAccessToken(): string | undefined {
  return mmkvStorage.getString(storageKeys.auth.accessToken);
}

/**
 * Turns any Axios failure into one predictable shape.
 *
 * Screens get `message` / `status` / `isNetworkError` and never have to guess
 * whether the truth is in `error.response`, `error.request`, or `error.message`.
 */
function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    const data = error.response.data as { message?: string } | undefined;

    return {
      message: data?.message ?? error.message,
      status: error.response.status,
      data: error.response.data,
      isNetworkError: false,
    };
  }

  // The request went out but nothing came back: offline, DNS, or timed out.
  if (error.request) {
    return {
      message: error.message,
      isNetworkError: true,
    };
  }

  // Failed before the request was even sent — a bad config.
  return {
    message: error.message,
    isNetworkError: false,
  };
}

/**
 * Installs the shared request/response behaviour on an Axios instance.
 *
 * Kept apart from the instance itself so the policy is readable and testable
 * on its own, and so a second instance (a different host, say) can opt into
 * the same rules.
 *
 * @example
 * const instance = axios.create({ baseURL });
 * setupInterceptors(instance);
 */
export function setupInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const { meta } = config as CustomAxiosRequestConfig;

      // Authenticated unless the caller opts out, so forgetting `meta` errs
      // toward sending the token rather than silently dropping it.
      if (meta?.requiresAuth === false) return config;

      const token = readAccessToken();
      if (token) config.headers.set("Authorization", `Bearer ${token}`);

      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => Promise.reject(toApiError(error)),
  );
}
