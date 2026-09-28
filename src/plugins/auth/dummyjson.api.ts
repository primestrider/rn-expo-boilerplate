import axiosInstance from "@/plugins/axios";
import type { CustomAxiosRequestConfig } from "@/shared/models";

/**
 * The auth endpoints of DummyJSON, the public demo backend the app signs in
 * against until you register your own adapter in `src/plugins/auth`.
 *
 * The host is spelled out per request rather than through `baseURL`, which
 * keeps `EXPO_PUBLIC_API_URL` free for your own backend.
 *
 * @see https://dummyjson.com/docs/auth
 */
const HOST = "https://dummyjson.com";

export type DummyLoginRequest = {
  username: string;
  password: string;
  expiresInMins?: number;
};

export type DummyLoginResponse = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
};

/** What DummyJSON answers when a refresh token is exchanged. */
export type DummyRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};

/**
 * Exchange credentials for a token pair.
 *
 * Endpoint:
 * POST /auth/login
 *
 * Opted out of auth explicitly: sending a stale token to the endpoint that
 * issues tokens is how you get a confusing 401 on a valid password.
 */
export const login = async (
  payload: DummyLoginRequest,
): Promise<DummyLoginResponse> => {
  const config: CustomAxiosRequestConfig<DummyLoginRequest> = {
    url: `${HOST}/auth/login`,
    method: "POST",
    data: payload,
    meta: { requiresAuth: false },
  };

  const { data } = await axiosInstance.request<DummyLoginResponse>(config);
  return data;
};

/**
 * Exchange a refresh token for a new pair.
 *
 * Endpoint:
 * POST /auth/refresh
 *
 * Opted out of auth: the access token this is meant to replace is, by
 * definition, the one that just stopped working. Opting out is also what keeps
 * a failure here from recursing back into the refresh flow.
 */
export const refreshSession = async (
  refreshToken: string,
): Promise<DummyRefreshResponse> => {
  const config: CustomAxiosRequestConfig<{ refreshToken: string }> = {
    url: `${HOST}/auth/refresh`,
    method: "POST",
    data: { refreshToken },
    meta: { requiresAuth: false },
  };

  const { data } = await axiosInstance.request<DummyRefreshResponse>(config);
  return data;
};
