import { login, refreshSession } from "@/plugins/auth/dummyjson.api";
import axiosInstance from "@/plugins/axios";
import type { CustomAxiosRequestConfig } from "@/shared/models";

jest.mock("@/plugins/axios", () => ({
  __esModule: true,
  default: { request: jest.fn() },
}));

const request = axiosInstance.request as jest.MockedFunction<
  typeof axiosInstance.request
>;

/** The config the service handed to Axios. */
function sentConfig(): CustomAxiosRequestConfig {
  return request.mock.calls[0][0] as CustomAxiosRequestConfig;
}

function resolveWith(data: unknown) {
  request.mockResolvedValueOnce({ data } as never);
}

beforeEach(() => {
  request.mockReset();
});

describe("login", () => {
  it("posts the credentials", async () => {
    resolveWith({ id: 1, username: "emilys", accessToken: "t" });

    await login({ username: "emilys", password: "emilyspass" });

    expect(sentConfig()).toEqual(
      expect.objectContaining({
        url: "https://dummyjson.com/auth/login",
        method: "POST",
        data: { username: "emilys", password: "emilyspass" },
      }),
    );
  });

  it("opts out of auth, so a stale token cannot break a valid password", async () => {
    resolveWith({ id: 1, username: "emilys", accessToken: "t" });

    await login({ username: "emilys", password: "emilyspass" });

    expect(sentConfig().meta).toEqual({ requiresAuth: false });
  });

  it("lets an API error reach the caller", async () => {
    request.mockRejectedValueOnce({
      message: "Invalid credentials",
      status: 400,
      isNetworkError: false,
    });

    await expect(
      login({ username: "emilys", password: "wrong" }),
    ).rejects.toEqual(
      expect.objectContaining({ message: "Invalid credentials", status: 400 }),
    );
  });
});

describe("refreshSession", () => {
  it("posts the refresh token without the expired access token", async () => {
    resolveWith({ accessToken: "a-2", refreshToken: "r-2" });

    await expect(refreshSession("r-1")).resolves.toEqual({
      accessToken: "a-2",
      refreshToken: "r-2",
    });
    expect(sentConfig()).toEqual(
      expect.objectContaining({
        url: "https://dummyjson.com/auth/refresh",
        method: "POST",
        data: { refreshToken: "r-1" },
        meta: { requiresAuth: false },
      }),
    );
  });
});
