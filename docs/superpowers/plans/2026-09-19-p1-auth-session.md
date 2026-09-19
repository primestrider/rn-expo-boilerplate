# P1 Auth Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Angkat auth dari folder demo menjadi `src/features/auth` dengan rute terlindungi, refresh token single-flight pada 401, dan fallback error yang bertema.

**Architecture:** Store Zustand menjadi satu-satunya sumber kebenaran sesi dan dibaca di luar React lewat `getState()`. Backend dipasang lewat adapter yang didaftarkan saat boot. Axios tidak pernah meng-import feature auth — ia mengekspos seam handler yang diisi feature auth, sehingga arah ketergantungan tetap `features → plugins`. Perpindahan antar rute murni akibat `Stack.Protected` bereaksi terhadap store, tanpa satu pun `router.replace()`.

**Tech Stack:** Expo SDK 57, Expo Router 57 (`Stack.Protected`), Zustand 5 + `persist`, MMKV 4, Axios 1.18, i18next 26, Jest + `@testing-library/react-native`.

**Spec:** `docs/superpowers/specs/2026-09-19-p1-auth-session-design.md`

## Global Constraints

- Branch kerja: `feat/p1-auth-session`. Sudah dibuat; jangan commit ke `main`.
- Semua berkas baru memakai alias `@/` (dipetakan di `tsconfig.json` dan `jest.config.js`).
- Komentar dan JSDoc berbahasa Inggris, mengikuti seluruh berkas sumber yang ada. Copy untuk pengguna masuk ke berkas locale, tidak pernah di-hardcode di komponen.
- Setiap teks yang dilihat pengguna harus punya kunci di `en` **dan** `id`. `utils.id.ts` diketik `typeof utils` dari `utils.en.ts`, jadi kunci yang terlupa gagal di `tsc`, bukan di runtime.
- Verifikasi setiap task: `npx tsc --noEmit` harus 0 error, dan `npx jest` harus hijau.
- `ErrorBoundary` dilarang memakai `useTranslation` atau `useToast` (alasan di Task 9).
- Jangan sentuh CI, script `typecheck`, atau temuan P2/P3 lain. Di luar cakupan.

## Penyimpangan dari spec yang disengaja

Dua hal ditemukan saat menyusun rencana ini dan diputuskan di sini:

1. **`AuthAdapter.signIn` memakai tipe konkret `SignInCredentials`**, bukan `unknown` seperti tertulis di spec. Layar sign-in boilerplate ini memang username/password, dan `unknown` memaksa setiap adapter melakukan cast.
2. **Axios mendapat seam `registerSessionHandlers`** alih-alih meng-import `features/auth` langsung. Spec menulis "request interceptor hanya berubah sumber token"; itu akan membuat `plugins → features`, arah yang ditolak di spec untuk kasus toast. Seam ini juga memperbaiki masalah urutan: interceptor normalisasi error terdaftar lebih dulu, sehingga handler 401 yang dipasang belakangan akan menerima `ApiError` yang sudah kehilangan `config` dan mustahil di-retry.

## Struktur berkas

| Berkas | Tanggung jawab |
|---|---|
| `src/features/auth/models/session.model.ts` | Tipe: `AuthUser`, `AuthTokens`, `SignInCredentials`, `SignOutReason`, `AuthAdapter` |
| `src/features/auth/stores/session.store.ts` | Store sesi + selector. Satu-satunya sumber kebenaran |
| `src/features/auth/services/adapter.ts` | Registry adapter backend |
| `src/features/auth/services/refresh.ts` | `ensureFreshToken()` — single-flight |
| `src/features/auth/components/SessionExpiryToast.tsx` | Memunculkan toast saat sesi kedaluwarsa |
| `src/features/auth/index.ts` | Permukaan publik feature |
| `src/plugins/axios/session.ts` | Seam handler sesi (registry callback) |
| `src/plugins/axios/interceptor.ts` | Normalisasi error + token + retry 401 |
| `src/plugins/auth/index.ts` | Satu titik tukar backend: daftarkan adapter + handler |
| `src/features/example/services/auth.adapter.ts` | Implementasi adapter untuk DummyJSON |
| `src/app/_layout.tsx` | Guard, `ErrorBoundary`, `<SessionExpiryToast />` |
| `src/app/+not-found.tsx` | Fallback rute tak dikenal |
| `src/app/sign-in.tsx` | Layar masuk, dijaga `!isAuthenticated` |
| `src/app/(protected)/account.tsx` | Kartu sesi, dijaga `isAuthenticated` |
| `src/app/(public)/**` | Beranda + showcase, selalu tersedia |

---

### Task 1: Model dan store sesi

**Files:**
- Create: `src/features/auth/models/session.model.ts`
- Create: `src/features/auth/stores/session.store.ts`
- Test: `tests/features/auth/stores/session.store.test.ts`

**Interfaces:**
- Consumes: `zustandStorage` dari `@/plugins/mmkv/zustand` (sudah ada).
- Produces: `useSessionStore`, `selectIsAuthenticated`, `selectFullName`, dan tipe `AuthUser`, `AuthTokens`, `SignInCredentials`, `SignOutReason`, `AuthAdapter`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/features/auth/stores/session.store.test.ts`:

```ts
import { act } from "@testing-library/react-native";

import type { AuthTokens, AuthUser } from "@/features/auth/models/session.model";
import {
  selectFullName,
  selectIsAuthenticated,
  useSessionStore,
} from "@/features/auth/stores/session.store";
import { mmkvStorage } from "@/plugins/mmkv";

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
};

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() =>
    useSessionStore.setState({ user: null, tokens: null, signOutReason: null }),
  );
});

describe("useSessionStore", () => {
  it("starts signed out", () => {
    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(false);
    expect(useSessionStore.getState().tokens).toBeNull();
  });

  it("holds the tokens itself rather than a side channel", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    expect(useSessionStore.getState().tokens).toEqual(tokens);
    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(true);
  });

  it("treats the tokens, not the profile, as what makes a session", () => {
    act(() => useSessionStore.setState({ user, tokens: null }));

    expect(selectIsAuthenticated(useSessionStore.getState())).toBe(false);
  });

  it("replaces only the tokens on refresh", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));
    act(() =>
      useSessionStore.getState().setTokens({
        accessToken: "access-2",
        refreshToken: "refresh-2",
      }),
    );

    expect(useSessionStore.getState().tokens?.accessToken).toBe("access-2");
    expect(useSessionStore.getState().user).toEqual(user);
  });

  it("records why the session ended", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));
    act(() => useSessionStore.getState().signOut("expired"));

    expect(useSessionStore.getState().user).toBeNull();
    expect(useSessionStore.getState().tokens).toBeNull();
    expect(useSessionStore.getState().signOutReason).toBe("expired");
  });

  it("clears the reason once it has been shown", () => {
    act(() => useSessionStore.getState().signOut("expired"));
    act(() => useSessionStore.getState().clearSignOutReason());

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("drops a stale reason when a new session starts", () => {
    act(() => useSessionStore.getState().signOut("expired"));
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("persists the session so a restart stays signed in", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    const persisted = mmkvStorage.getString("auth.session");

    expect(persisted).toBeDefined();
    expect(persisted).toContain("access-1");
  });

  it("never persists the sign-out reason, so a restart raises no toast", () => {
    act(() => useSessionStore.getState().signOut("expired"));

    expect(mmkvStorage.getString("auth.session")).not.toContain("expired");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/auth/stores/session.store.test.ts`
Expected: FAIL — `Cannot find module '@/features/auth/stores/session.store'`

- [ ] **Step 3: Tulis modelnya**

Buat `src/features/auth/models/session.model.ts`:

```ts
/** The signed-in person, as every screen in the app sees them. */
export type AuthUser = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  image: string;
};

/** What the backend hands back in exchange for credentials. */
export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export type SignInCredentials = {
  username: string;
  password: string;
};

/**
 * Why a session ended. `expired` is the only one the app announces — a
 * deliberate sign-out needs no explanation.
 */
export type SignOutReason = "user" | "expired";

/**
 * The seam between this feature and whatever backend the app talks to.
 *
 * Register one at boot with `registerAuthAdapter()`. Swapping backends means
 * writing a new adapter; the guard, the store, and the interceptor never
 * learn that anything changed.
 */
export type AuthAdapter = {
  signIn: (
    credentials: SignInCredentials,
  ) => Promise<{ user: AuthUser; tokens: AuthTokens }>;
  refresh: (refreshToken: string) => Promise<AuthTokens>;
};
```

- [ ] **Step 4: Tulis store-nya**

Buat `src/features/auth/stores/session.store.ts`:

```ts
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { zustandStorage } from "@/plugins/mmkv/zustand";

import type {
  AuthTokens,
  AuthUser,
  SignOutReason,
} from "../models/session.model";

type SessionState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  /** Set when a session ends; cleared once the app has announced it. */
  signOutReason: SignOutReason | null;
  signIn: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  setTokens: (tokens: AuthTokens) => void;
  signOut: (reason: SignOutReason) => void;
  clearSignOutReason: () => void;
};

/**
 * The session, and the only place it lives.
 *
 * Tokens are held here rather than in a separate storage key so the store and
 * the request layer can never disagree about whether a session exists. Axios
 * reads this through `useSessionStore.getState()`, which works outside React.
 *
 * MMKV is synchronous, so the persisted session is rehydrated before the first
 * render and the guard never flashes the sign-in screen on a cold start.
 *
 * @example
 * const user = useSessionStore((state) => state.user);
 */
export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      signOutReason: null,

      signIn: ({ user, tokens }) => set({ user, tokens, signOutReason: null }),

      setTokens: (tokens) => set({ tokens }),

      signOut: (reason) =>
        set({ user: null, tokens: null, signOutReason: reason }),

      clearSignOutReason: () => set({ signOutReason: null }),
    }),
    {
      name: "auth.session",
      storage: createJSONStorage(() => zustandStorage),
      // The reason is a one-shot announcement, not session state. Persisting it
      // would re-raise the "session expired" toast on every cold start.
      partialize: (state) => ({ user: state.user, tokens: state.tokens }),
    },
  ),
);

/**
 * True once a session exists.
 *
 * Deliberately keyed on the tokens rather than the profile: the token is what
 * decides whether a request can succeed.
 */
export const selectIsAuthenticated = (state: SessionState): boolean =>
  state.tokens !== null;

/** The signed-in user's display name, or an empty string when signed out. */
export const selectFullName = (state: SessionState): string =>
  state.user ? `${state.user.firstName} ${state.user.lastName}` : "";
```

- [ ] **Step 5: Jalankan tes, pastikan lulus**

Run: `npx jest tests/features/auth/stores/session.store.test.ts`
Expected: PASS, 9 tes

- [ ] **Step 6: Commit**

```bash
git add src/features/auth tests/features/auth
git commit -m "feat(auth): session store as the single source of truth"
```

---

### Task 2: Registry adapter

**Files:**
- Create: `src/features/auth/services/adapter.ts`
- Test: `tests/features/auth/services/adapter.test.ts`

**Interfaces:**
- Consumes: tipe `AuthAdapter` dari Task 1.
- Produces: `registerAuthAdapter(adapter: AuthAdapter): void`, `getAuthAdapter(): AuthAdapter`, `resetAuthAdapter(): void`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/features/auth/services/adapter.test.ts`:

```ts
import type { AuthAdapter } from "@/features/auth/models/session.model";
import {
  getAuthAdapter,
  registerAuthAdapter,
  resetAuthAdapter,
} from "@/features/auth/services/adapter";

const adapter: AuthAdapter = {
  signIn: jest.fn(),
  refresh: jest.fn(),
};

beforeEach(() => {
  resetAuthAdapter();
});

describe("auth adapter registry", () => {
  it("hands back the adapter that was registered", () => {
    registerAuthAdapter(adapter);

    expect(getAuthAdapter()).toBe(adapter);
  });

  it("explains itself when nothing was registered", () => {
    expect(() => getAuthAdapter()).toThrow(/registerAuthAdapter/);
  });

  it("lets a later registration replace an earlier one", () => {
    const replacement: AuthAdapter = { signIn: jest.fn(), refresh: jest.fn() };

    registerAuthAdapter(adapter);
    registerAuthAdapter(replacement);

    expect(getAuthAdapter()).toBe(replacement);
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/auth/services/adapter.test.ts`
Expected: FAIL — `Cannot find module '@/features/auth/services/adapter'`

- [ ] **Step 3: Tulis implementasinya**

Buat `src/features/auth/services/adapter.ts`:

```ts
import type { AuthAdapter } from "../models/session.model";

let registered: AuthAdapter | null = null;

/**
 * Points this feature at a backend. Call once at boot.
 *
 * @example
 * registerAuthAdapter(dummyJsonAuthAdapter);
 */
export function registerAuthAdapter(adapter: AuthAdapter): void {
  registered = adapter;
}

/**
 * The adapter in force.
 *
 * Throws rather than returning null: a missing adapter is a wiring mistake,
 * and it should surface at the first call with an instruction attached, not as
 * a confusing null somewhere deep in a request.
 */
export function getAuthAdapter(): AuthAdapter {
  if (!registered) {
    throw new Error(
      "No auth adapter registered. Call registerAuthAdapter() at boot — see src/plugins/auth.",
    );
  }

  return registered;
}

/** Clears the registration. Exists for tests, which must not leak into each other. */
export function resetAuthAdapter(): void {
  registered = null;
}
```

- [ ] **Step 4: Jalankan tes, pastikan lulus**

Run: `npx jest tests/features/auth/services/adapter.test.ts`
Expected: PASS, 3 tes

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/services/adapter.ts tests/features/auth/services/adapter.test.ts
git commit -m "feat(auth): adapter registry as the backend seam"
```

---

### Task 3: Refresh single-flight

**Files:**
- Create: `src/features/auth/services/refresh.ts`
- Test: `tests/features/auth/services/refresh.test.ts`

**Interfaces:**
- Consumes: `useSessionStore` (Task 1), `getAuthAdapter` (Task 2).
- Produces: `ensureFreshToken(): Promise<AuthTokens | null>` — `null` berarti sesi tidak bisa diperbarui.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/features/auth/services/refresh.test.ts`:

```ts
import { act } from "@testing-library/react-native";

import type { AuthAdapter, AuthTokens, AuthUser } from "@/features/auth/models/session.model";
import { registerAuthAdapter, resetAuthAdapter } from "@/features/auth/services/adapter";
import { ensureFreshToken } from "@/features/auth/services/refresh";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { mmkvStorage } from "@/plugins/mmkv";

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = { accessToken: "access-1", refreshToken: "refresh-1" };
const renewed: AuthTokens = { accessToken: "access-2", refreshToken: "refresh-2" };

/** Resolves only when the test says so, so overlap can be observed. */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function adapterWith(refresh: AuthAdapter["refresh"]): AuthAdapter {
  return { signIn: jest.fn(), refresh };
}

beforeEach(() => {
  mmkvStorage.clearAll();
  resetAuthAdapter();
  act(() =>
    useSessionStore.setState({ user, tokens, signOutReason: null }),
  );
});

describe("ensureFreshToken", () => {
  it("stores the renewed tokens", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await expect(ensureFreshToken()).resolves.toEqual(renewed);
    expect(useSessionStore.getState().tokens).toEqual(renewed);
  });

  it("passes the stored refresh token to the adapter", async () => {
    const refresh = jest.fn().mockResolvedValue(renewed);
    registerAuthAdapter(adapterWith(refresh));

    await ensureFreshToken();

    expect(refresh).toHaveBeenCalledWith("refresh-1");
  });

  it("refreshes once for ten overlapping callers", async () => {
    const gate = deferred<AuthTokens>();
    const refresh = jest.fn().mockReturnValue(gate.promise);
    registerAuthAdapter(adapterWith(refresh));

    const callers = Array.from({ length: 10 }, () => ensureFreshToken());
    gate.resolve(renewed);

    const results = await Promise.all(callers);

    expect(refresh).toHaveBeenCalledTimes(1);
    expect(results.every((result) => result === results[0])).toBe(true);
    expect(results[0]).toEqual(renewed);
  });

  it("allows a fresh attempt after the first one settled", async () => {
    const refresh = jest.fn().mockResolvedValue(renewed);
    registerAuthAdapter(adapterWith(refresh));

    await ensureFreshToken();
    await ensureFreshToken();

    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it("answers null when the backend rejects the refresh", async () => {
    registerAuthAdapter(
      adapterWith(jest.fn().mockRejectedValue(new Error("nope"))),
    );

    await expect(ensureFreshToken()).resolves.toBeNull();
  });

  it("leaves the session untouched — signing out is the caller's decision", async () => {
    registerAuthAdapter(
      adapterWith(jest.fn().mockRejectedValue(new Error("nope"))),
    );

    await ensureFreshToken();

    expect(useSessionStore.getState().tokens).toEqual(tokens);
  });

  it("never calls the backend when no refresh token is stored", async () => {
    const refresh = jest.fn();
    registerAuthAdapter(adapterWith(refresh));
    act(() => useSessionStore.setState({ tokens: null }));

    await expect(ensureFreshToken()).resolves.toBeNull();
    expect(refresh).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/auth/services/refresh.test.ts`
Expected: FAIL — `Cannot find module '@/features/auth/services/refresh'`

- [ ] **Step 3: Tulis implementasinya**

Buat `src/features/auth/services/refresh.ts`:

```ts
import type { AuthTokens } from "../models/session.model";
import { useSessionStore } from "../stores/session.store";
import { getAuthAdapter } from "./adapter";

/**
 * The refresh currently in progress, if any.
 *
 * Module state rather than store state: nothing re-renders when a refresh
 * starts, and React must not be able to observe it mid-flight.
 */
let inFlight: Promise<AuthTokens | null> | null = null;

async function runRefresh(): Promise<AuthTokens | null> {
  const { tokens, setTokens } = useSessionStore.getState();

  // Nothing to exchange — there is no session to save.
  if (!tokens?.refreshToken) return null;

  try {
    const next = await getAuthAdapter().refresh(tokens.refreshToken);
    setTokens(next);
    return next;
  } catch {
    // Why it failed does not change what the caller can do about it.
    return null;
  }
}

/**
 * Renews the session, at most once at a time.
 *
 * Ten requests that all meet a 401 together await the same refresh and then
 * each retry themselves. Without this, ten refreshes would race and the last
 * one to land would overwrite tokens the others are already using.
 *
 * Answers `null` when the session cannot be renewed. Deciding what that means
 * — signing out, announcing it — belongs to the caller, so this stays usable
 * from anywhere.
 *
 * @example
 * const tokens = await ensureFreshToken();
 * if (!tokens) useSessionStore.getState().signOut("expired");
 */
export function ensureFreshToken(): Promise<AuthTokens | null> {
  if (inFlight) return inFlight;

  inFlight = runRefresh().finally(() => {
    inFlight = null;
  });

  return inFlight;
}
```

- [ ] **Step 4: Jalankan tes, pastikan lulus**

Run: `npx jest tests/features/auth/services/refresh.test.ts`
Expected: PASS, 7 tes

- [ ] **Step 5: Commit**

```bash
git add src/features/auth/services/refresh.ts tests/features/auth/services/refresh.test.ts
git commit -m "feat(auth): single-flight token refresh"
```

---

### Task 4: Seam sesi pada Axios dan retry 401

**Files:**
- Create: `src/plugins/axios/session.ts`
- Modify: `src/plugins/axios/interceptor.ts`
- Modify: `src/shared/models/api.ts` (tambah `_retried` ke `meta`)
- Test: `tests/plugins/axios/interceptor.test.ts` (tambah blok describe baru)

**Interfaces:**
- Consumes: tidak ada dari task sebelumnya. Modul ini sengaja tidak tahu-menahu soal `features/auth`.
- Produces: `registerSessionHandlers(handlers: SessionHandlers): void`, `resetSessionHandlers(): void`, dan tipe `SessionHandlers = { getAccessToken: () => string | undefined; refreshSession: () => Promise<string | null> }`.

**Kenapa seam, bukan import langsung:** `plugins/**` di repo ini hanya meng-import dari `plugins/**` dan `shared/**`, tidak pernah dari `features/**`. Memasang handler dari luar lewat `instance.interceptors` juga akan terlambat — interceptor normalisasi error sudah terdaftar duluan, jadi handler yang menyusul menerima `ApiError` yang sudah kehilangan `config` dan tidak bisa mengulang request.

- [ ] **Step 1: Tulis tes yang gagal**

Tambahkan di akhir `tests/plugins/axios/interceptor.test.ts`:

```ts
import {
  registerSessionHandlers,
  resetSessionHandlers,
} from "@/plugins/axios/session";

/** An adapter that answers 401 once, then succeeds. */
function unauthorizedThenOk(): AxiosAdapter {
  let served = 0;

  return (config) => {
    served += 1;
    seenConfig = config;

    if (served === 1) {
      return Promise.reject(
        new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
          data: { message: "Token expired" },
          status: 401,
          statusText: "Unauthorized",
          headers: {},
          config,
        }),
      );
    }

    return Promise.resolve({
      data: { ok: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    });
  };
}

/** An adapter that answers 401 every single time. */
const alwaysUnauthorized: AxiosAdapter = (config) =>
  Promise.reject(
    new AxiosError("Unauthorized", "ERR_BAD_REQUEST", config, {}, {
      data: { message: "Token expired" },
      status: 401,
      statusText: "Unauthorized",
      headers: {},
      config,
    }),
  );

describe("axios session handling", () => {
  afterEach(() => {
    resetSessionHandlers();
  });

  it("attaches the token the handlers provide", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-from-session",
      refreshSession: jest.fn(),
    });

    await instanceWith(okAdapter).request({ url: "/me" });

    expect(authorizationHeader()).toBe("Bearer token-from-session");
  });

  it("refreshes once and retries the request on 401", async () => {
    const refreshSession = jest.fn().mockResolvedValue("token-2");
    registerSessionHandlers({
      getAccessToken: () => "token-1",
      refreshSession,
    });

    const response = await instanceWith(unauthorizedThenOk()).request({ url: "/me" });

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(response.data).toEqual({ ok: true });
  });

  it("does not refresh a request that opted out of auth", async () => {
    const refreshSession = jest.fn();
    registerSessionHandlers({ getAccessToken: () => "token-1", refreshSession });

    const config: CustomAxiosRequestConfig = {
      url: "/auth/login",
      method: "POST",
      meta: { requiresAuth: false },
    };

    await instanceWith(alwaysUnauthorized)
      .request(config)
      .catch((rejected) => rejected);

    expect(refreshSession).not.toHaveBeenCalled();
  });

  it("gives up after one retry rather than looping", async () => {
    const refreshSession = jest.fn().mockResolvedValue("token-2");
    registerSessionHandlers({ getAccessToken: () => "token-1", refreshSession });

    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(error.status).toBe(401);
  });

  it("rejects with the normalized error when the refresh fails", async () => {
    registerSessionHandlers({
      getAccessToken: () => "token-1",
      refreshSession: jest.fn().mockResolvedValue(null),
    });

    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(error).toEqual({
      message: "Token expired",
      status: 401,
      data: { message: "Token expired" },
      isNetworkError: false,
    });
  });

  it("behaves exactly as before when no handlers are registered", async () => {
    const error: ApiError = await instanceWith(alwaysUnauthorized)
      .request({ url: "/me" })
      .catch((rejected) => rejected);

    expect(error.status).toBe(401);
    expect(authorizationHeader()).toBeUndefined();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/plugins/axios/interceptor.test.ts`
Expected: FAIL — `Cannot find module '@/plugins/axios/session'`

- [ ] **Step 3: Tulis seam-nya**

Buat `src/plugins/axios/session.ts`:

```ts
/**
 * How the request layer reaches the session without knowing what a session is.
 *
 * `plugins/**` never imports from `features/**`; the auth feature fills these
 * in at boot instead. Keeping it a seam also fixes an ordering problem: the
 * error-normalizing interceptor is installed when the instance is created, so
 * anything registered afterwards would receive an `ApiError` that has already
 * lost the `config` needed to retry.
 */
export type SessionHandlers = {
  /** The token to attach, or undefined when signed out. */
  getAccessToken: () => string | undefined;
  /**
   * Renews the session. Answers the new access token, or null when the session
   * is gone for good — the auth feature decides what that means.
   */
  refreshSession: () => Promise<string | null>;
};

let handlers: SessionHandlers | null = null;

/** Wires the session into the request layer. Call once at boot. */
export function registerSessionHandlers(next: SessionHandlers): void {
  handlers = next;
}

/** The handlers in force, or null when the app ships without auth. */
export function getSessionHandlers(): SessionHandlers | null {
  return handlers;
}

/** Clears the registration. Exists for tests. */
export function resetSessionHandlers(): void {
  handlers = null;
}
```

- [ ] **Step 4: Tambahkan `_retried` ke tipe meta**

Di `src/shared/models/api.ts`, ganti blok `meta` pada `CustomAxiosRequestConfig`:

```ts
export type CustomAxiosRequestConfig<Data = unknown> = AxiosRequestConfig<Data> & {
  meta?: {
    requiresAuth?: boolean;
    /**
     * Internal. Set by the response interceptor on a request it has already
     * retried after refreshing, so a still-401 retry stops instead of looping.
     * Callers never set this.
     */
    _retried?: boolean;
  };
};
```

- [ ] **Step 5: Ganti interceptor-nya**

Di `src/plugins/axios/interceptor.ts`, ganti `readAccessToken` dan tambahkan penanganan 401. Ganti seluruh isi berkas mulai dari `import` sampai akhir dengan:

```ts
import type { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from "axios";

import { getSessionHandlers } from "@/plugins/axios/session";
import type { ApiError, CustomAxiosRequestConfig } from "@/shared/models";

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

/** Whether a 401 on this request is worth trying to recover from. */
function isRecoverable(error: AxiosError): boolean {
  if (error.response?.status !== 401) return false;

  const config = error.config as CustomAxiosRequestConfig | undefined;
  if (!config) return false;

  // An anonymous endpoint's 401 is about the request, not the session — and
  // this is also what stops the refresh call itself from recursing.
  if (config.meta?.requiresAuth === false) return false;

  // Already retried once. A second 401 means refreshing did not help.
  return config.meta?._retried !== true;
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

      const token = getSessionHandlers()?.getAccessToken();
      if (token) config.headers.set("Authorization", `Bearer ${token}`);

      return config;
    },
    (error) => Promise.reject(error),
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const handlers = getSessionHandlers();

      if (!handlers || !isRecoverable(error)) {
        return Promise.reject(toApiError(error));
      }

      const token = await handlers.refreshSession();

      // The session is gone. `refreshSession` has already dealt with that;
      // the caller still gets the failure it was waiting for.
      if (!token) return Promise.reject(toApiError(error));

      const config = error.config as CustomAxiosRequestConfig;

      // Annotated rather than passed as a literal: `request()` takes a plain
      // `AxiosRequestConfig`, and excess-property checking would reject `meta`
      // on a fresh object literal.
      const retried: CustomAxiosRequestConfig = {
        ...config,
        meta: { ...config.meta, _retried: true },
      };

      return axiosInstance.request(retried);
    },
  );
}
```

- [ ] **Step 6: Jalankan seluruh tes interceptor**

Run: `npx jest tests/plugins/axios/interceptor.test.ts`
Expected: PASS — tes lama tetap hijau kecuali tiga tes token yang memakai `mmkvStorage.set(storageKeys.auth.accessToken, ...)`.

- [ ] **Step 7: Perbaiki tiga tes token yang lama**

Tes lama `"attaches the stored access token"`, `"treats a request as authenticated when meta is absent"`, `"skips the token when the caller opts out"`, dan `"attaches the token when the caller opts in explicitly"` menaruh token lewat `mmkvStorage`. Ganti setiap `mmkvStorage.set(storageKeys.auth.accessToken, "token-123");` menjadi:

```ts
registerSessionHandlers({
  getAccessToken: () => "token-123",
  refreshSession: jest.fn(),
});
```

Tambahkan `resetSessionHandlers()` ke `beforeEach` teratas berkas, dan hapus import `storageKeys` bila sudah tak terpakai.

- [ ] **Step 8: Jalankan tes dan typecheck**

Run: `npx jest tests/plugins/axios/interceptor.test.ts && npx tsc --noEmit`
Expected: PASS, 0 error

- [ ] **Step 9: Commit**

```bash
git add src/plugins/axios src/shared/models/api.ts tests/plugins/axios/interceptor.test.ts
git commit -m "feat(axios): refresh and retry once on 401 through a session seam"
```

---

### Task 5: Adapter DummyJSON dan titik tukar backend

**Files:**
- Create: `src/features/example/services/auth.adapter.ts`
- Create: `src/features/auth/services/sessionHandlers.ts`
- Create: `src/plugins/auth/index.ts`
- Create: `src/features/auth/index.ts`
- Test: `tests/features/example/services/auth.adapter.test.ts`
- Test: `tests/features/auth/services/sessionHandlers.test.ts`

**Interfaces:**
- Consumes: `AuthAdapter` (Task 1), `registerAuthAdapter` (Task 2), `ensureFreshToken` (Task 3), tipe `SessionHandlers` dari `@/plugins/axios/session` (Task 4), `login` dari `@/features/example/services/api`.
- Produces: `dummyJsonAuthAdapter: AuthAdapter`, `sessionHandlers: SessionHandlers`, dan `src/features/auth/index.ts` yang mengekspor ulang `useSessionStore`, `selectIsAuthenticated`, `selectFullName`, `registerAuthAdapter`, `getAuthAdapter`, `ensureFreshToken`, `sessionHandlers`, dan seluruh tipe di `session.model.ts`.

**Kenapa `sessionHandlers` berdiri sendiri:** `plugins/auth/index.ts` bekerja lewat efek saat di-import, sehingga praktis tidak bisa diuji. Menaruh keputusan "refresh gagal berarti sign out dengan alasan expired" di sana akan membuat perilaku terpenting fitur ini tidak tertutup tes. Modul ini memisahkan keputusannya dari pemasangannya; `plugins/auth` tinggal mendaftarkan.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/features/example/services/auth.adapter.test.ts`:

```ts
import { dummyJsonAuthAdapter } from "@/features/example/services/auth.adapter";
import { login, refreshSession } from "@/features/example/services/api";

jest.mock("@/features/example/services/api", () => ({
  login: jest.fn(),
  refreshSession: jest.fn(),
}));

const loginMock = login as jest.MockedFunction<typeof login>;
const refreshMock = refreshSession as jest.MockedFunction<typeof refreshSession>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe("dummyJsonAuthAdapter", () => {
  it("splits the login response into a profile and a token pair", async () => {
    loginMock.mockResolvedValue({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      gender: "female",
      image: "https://example.com/emily.png",
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const result = await dummyJsonAuthAdapter.signIn({
      username: "emilys",
      password: "emilyspass",
    });

    expect(result.user).toEqual({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      image: "https://example.com/emily.png",
    });
    expect(result.tokens).toEqual({
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });
  });

  it("keeps no token on the profile", async () => {
    loginMock.mockResolvedValue({
      id: 1,
      username: "emilys",
      email: "emily@example.com",
      firstName: "Emily",
      lastName: "Johnson",
      gender: "female",
      image: "https://example.com/emily.png",
      accessToken: "access-1",
      refreshToken: "refresh-1",
    });

    const { user } = await dummyJsonAuthAdapter.signIn({
      username: "emilys",
      password: "emilyspass",
    });

    expect(user).not.toHaveProperty("accessToken");
    expect(user).not.toHaveProperty("refreshToken");
  });

  it("exchanges a refresh token for a new pair", async () => {
    refreshMock.mockResolvedValue({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });

    await expect(dummyJsonAuthAdapter.refresh("refresh-1")).resolves.toEqual({
      accessToken: "access-2",
      refreshToken: "refresh-2",
    });
    expect(refreshMock).toHaveBeenCalledWith("refresh-1");
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/example/services/auth.adapter.test.ts`
Expected: FAIL — `Cannot find module '@/features/example/services/auth.adapter'`

- [ ] **Step 3: Tambahkan endpoint refresh ke service DummyJSON**

Di `src/features/example/models/api.model.ts`, tambahkan di akhir berkas:

```ts
/** What DummyJSON answers when a refresh token is exchanged. */
export type DummyRefreshResponse = {
  accessToken: string;
  refreshToken: string;
};
```

Di `src/features/example/services/api.ts`, tambahkan di akhir berkas:

```ts
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
    meta: anonymous,
  };

  const { data } = await axiosInstance.request<DummyRefreshResponse>(config);
  return data;
};
```

Tambahkan `DummyRefreshResponse` ke daftar import tipe di bagian atas berkas itu.

- [ ] **Step 4: Tulis adapter-nya**

Buat `src/features/example/services/auth.adapter.ts`:

```ts
import type { AuthAdapter } from "@/features/auth/models/session.model";

import { login, refreshSession } from "./api";

/**
 * Teaches the auth feature how to talk to DummyJSON.
 *
 * This is the whole surface a backend has to satisfy. Pointing the app at a
 * real API means writing a file like this one and registering it instead — the
 * guard, the store, and the interceptor stay exactly as they are.
 */
export const dummyJsonAuthAdapter: AuthAdapter = {
  signIn: async (credentials) => {
    const response = await login(credentials);

    return {
      user: {
        id: response.id,
        username: response.username,
        email: response.email,
        firstName: response.firstName,
        lastName: response.lastName,
        image: response.image,
      },
      tokens: {
        accessToken: response.accessToken,
        refreshToken: response.refreshToken,
      },
    };
  },

  refresh: (refreshToken) => refreshSession(refreshToken),
};
```

- [ ] **Step 5: Tulis tes handler sesi yang gagal**

Buat `tests/features/auth/services/sessionHandlers.test.ts`:

```ts
import { act } from "@testing-library/react-native";

import type { AuthAdapter, AuthTokens, AuthUser } from "@/features/auth/models/session.model";
import { registerAuthAdapter, resetAuthAdapter } from "@/features/auth/services/adapter";
import { sessionHandlers } from "@/features/auth/services/sessionHandlers";
import { useSessionStore } from "@/features/auth/stores/session.store";
import { mmkvStorage } from "@/plugins/mmkv";

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = { accessToken: "access-1", refreshToken: "refresh-1" };
const renewed: AuthTokens = { accessToken: "access-2", refreshToken: "refresh-2" };

function adapterWith(refresh: AuthAdapter["refresh"]): AuthAdapter {
  return { signIn: jest.fn(), refresh };
}

beforeEach(() => {
  mmkvStorage.clearAll();
  resetAuthAdapter();
  act(() => useSessionStore.setState({ user, tokens, signOutReason: null }));
});

describe("sessionHandlers.getAccessToken", () => {
  it("reads the token straight off the session", () => {
    expect(sessionHandlers.getAccessToken()).toBe("access-1");
  });

  it("answers undefined when signed out", () => {
    act(() => useSessionStore.setState({ tokens: null }));

    expect(sessionHandlers.getAccessToken()).toBeUndefined();
  });
});

describe("sessionHandlers.refreshSession", () => {
  it("hands back the renewed access token", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await expect(sessionHandlers.refreshSession()).resolves.toBe("access-2");
  });

  it("keeps the session alive on a successful refresh", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockResolvedValue(renewed)));

    await sessionHandlers.refreshSession();

    expect(useSessionStore.getState().user).toEqual(user);
    expect(useSessionStore.getState().signOutReason).toBeNull();
  });

  it("ends the session when the refresh is refused", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));

    await expect(sessionHandlers.refreshSession()).resolves.toBeNull();

    expect(useSessionStore.getState().tokens).toBeNull();
    expect(useSessionStore.getState().user).toBeNull();
  });

  it("records that the session expired rather than was left", async () => {
    registerAuthAdapter(adapterWith(jest.fn().mockRejectedValue(new Error("no"))));

    await sessionHandlers.refreshSession();

    expect(useSessionStore.getState().signOutReason).toBe("expired");
  });
});
```

- [ ] **Step 6: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/auth/services/sessionHandlers.test.ts`
Expected: FAIL — `Cannot find module '@/features/auth/services/sessionHandlers'`

- [ ] **Step 7: Tulis handler sesi**

Buat `src/features/auth/services/sessionHandlers.ts`:

```ts
import type { SessionHandlers } from "@/plugins/axios/session";

import { useSessionStore } from "../stores/session.store";
import { ensureFreshToken } from "./refresh";

/**
 * What the request layer is allowed to know about the session.
 *
 * This is kept apart from `@/plugins/auth`, which only registers it: that
 * module runs its wiring as an import side effect and cannot be tested, and
 * the decision below — that a refusal to refresh ends the session as *expired*
 * rather than as a deliberate sign-out — is the behaviour this whole feature
 * turns on.
 *
 * Nothing here navigates. Clearing the session is what moves the guard.
 */
export const sessionHandlers: SessionHandlers = {
  getAccessToken: () => useSessionStore.getState().tokens?.accessToken,

  refreshSession: async () => {
    const tokens = await ensureFreshToken();

    if (!tokens) {
      useSessionStore.getState().signOut("expired");
      return null;
    }

    return tokens.accessToken;
  },
};
```

- [ ] **Step 8: Tulis permukaan publik feature**

Buat `src/features/auth/index.ts`:

```ts
export type {
  AuthAdapter,
  AuthTokens,
  AuthUser,
  SignInCredentials,
  SignOutReason,
} from "./models/session.model";

export { getAuthAdapter, registerAuthAdapter } from "./services/adapter";
export { ensureFreshToken } from "./services/refresh";
export { sessionHandlers } from "./services/sessionHandlers";
export {
  selectFullName,
  selectIsAuthenticated,
  useSessionStore,
} from "./stores/session.store";
```

- [ ] **Step 9: Tulis titik tukar backend**

Buat `src/plugins/auth/index.ts`:

```ts
import { registerAuthAdapter, sessionHandlers } from "@/features/auth";
import { dummyJsonAuthAdapter } from "@/features/example/services/auth.adapter";
import { registerSessionHandlers } from "@/plugins/axios/session";

/**
 * Where the app is wired to a backend. Importing this module performs the
 * wiring, the same way `@/plugins/i18n` initializes i18next on import.
 *
 * To point the app at your own API, write an adapter like
 * `dummyJsonAuthAdapter` and register it here. Nothing else changes — not the
 * guard, not the store, not the interceptor.
 */
registerAuthAdapter(dummyJsonAuthAdapter);
registerSessionHandlers(sessionHandlers);
```

- [ ] **Step 10: Jalankan tes dan typecheck**

Run: `npx jest tests/features/auth tests/features/example/services/auth.adapter.test.ts && npx tsc --noEmit`
Expected: PASS — 3 tes adapter, 6 tes handler, 0 error

- [ ] **Step 11: Commit**

```bash
git add src/features/auth src/features/example src/plugins/auth tests/features
git commit -m "feat(auth): DummyJSON adapter and the single backend wiring point"
```

---

### Task 6: Pindahkan rute ke grup, tanpa perubahan logika

Task ini **hanya memindahkan berkas**. Tidak ada satu baris logika pun yang berubah, supaya diff perpindahan yang besar bisa direview terpisah dari perubahan perilaku.

**Files:**
- Move: `src/app/index.tsx` → `src/app/(public)/index.tsx`
- Move: `src/app/example/` → `src/app/(public)/example/`
- Modify: `tests/app/showcase.test.tsx`, `tests/app/features.test.tsx` (path import)

**Interfaces:**
- Consumes: tidak ada.
- Produces: URL tidak berubah sama sekali — grup berkurung tidak muncul di URL, jadi seluruh nilai di `examplePaths` tetap valid.

- [ ] **Step 1: Pindahkan berkasnya**

```bash
mkdir -p "src/app/(public)"
git mv src/app/index.tsx "src/app/(public)/index.tsx"
git mv src/app/example "src/app/(public)/example"
```

- [ ] **Step 2: Perbarui import di tes showcase**

Di `tests/app/showcase.test.tsx`, ganti keenam import layar:

```ts
import FormExample from "@/app/(public)/example/form";
import ComponentsIndex from "@/app/(public)/example/components/index";
import DisplayComponents from "@/app/(public)/example/components/display";
import FormComponents from "@/app/(public)/example/components/form";
import LayoutComponents from "@/app/(public)/example/components/layout";
import OverlayComponents from "@/app/(public)/example/components/overlay";
import Index from "@/app/(public)/index";
```

- [ ] **Step 3: Perbarui import di tes features**

Di `tests/app/features.test.tsx`, ganti keenam import layar:

```ts
import FeaturesIndex from "@/app/(public)/example/features/index";
import ProductDetailScreen from "@/app/(public)/example/features/products/[id]";
import ProductsScreen from "@/app/(public)/example/features/products/index";
import SettingsScreen from "@/app/(public)/example/features/settings";
import SignInScreen from "@/app/(public)/example/features/sign-in";
import TodosScreen from "@/app/(public)/example/features/todos";
```

- [ ] **Step 4: Jalankan seluruh tes dan typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS semua, 0 error. Bila ada kegagalan, itu murni soal path import — perbaiki, jangan ubah logika apa pun di task ini.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "refactor(router): move home and showcase into the (public) group"
```

---

### Task 7: Guard, layar sign-in, dan layar account

**Files:**
- Create: `src/app/sign-in.tsx`
- Create: `src/app/(protected)/account.tsx`
- Delete: `src/app/(public)/example/features/sign-in.tsx`
- Modify: `src/app/_layout.tsx`
- Modify: `src/features/example/routes/index.ts`
- Modify: `src/features/example/languages/example.en.ts`, `example.id.ts`
- Test: `tests/app/guard.test.tsx`
- Modify: `tests/app/features.test.tsx` (hapus `SignInScreen`)

**Interfaces:**
- Consumes: `useSessionStore`, `selectIsAuthenticated`, `selectFullName` dari `@/features/auth`; `dummyJsonAuthAdapter` lewat `@/plugins/auth`.
- Produces: rute `/sign-in` dan `/account`; `examplePaths.signIn` sekarang menunjuk `/sign-in`, dan `examplePaths.account` menunjuk `/account`.

- [ ] **Step 1: Tulis tes guard yang gagal**

Buat `tests/app/guard.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import type { AuthTokens, AuthUser } from "@/features/auth";
import { useSessionStore } from "@/features/auth";
import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";
import { ToastProvider } from "@/shared/components";

import AccountScreen from "@/app/(protected)/account";
import HomeScreen from "@/app/(public)/index";
import SignInScreen from "@/app/sign-in";

/**
 * `Stack.Protected` removes guarded routes from the navigator rather than
 * redirecting, so what this proves is narrower and more useful than a
 * navigation assertion: each screen renders the right thing for the session it
 * is handed, and the guard expression itself flips with the store.
 */
jest.mock("expo-router", () => ({
  Stack: { Screen: () => null, Protected: ({ children }: { children: ReactNode }) => children },
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/plugins/auth", () => ({}));

const user: AuthUser = {
  id: 1,
  username: "emilys",
  email: "emily@example.com",
  firstName: "Emily",
  lastName: "Johnson",
  image: "https://example.com/emily.png",
};

const tokens: AuthTokens = { accessToken: "access-1", refreshToken: "refresh-1" };

function renderScreen(Component: () => ReactNode) {
  return render(
    <ToastProvider>
      <Component />
    </ToastProvider>,
  );
}

beforeEach(() => {
  mmkvStorage.clearAll();
  act(() =>
    useSessionStore.setState({ user: null, tokens: null, signOutReason: null }),
  );
});

describe("session guard", () => {
  it("treats an empty store as signed out", () => {
    expect(useSessionStore.getState().tokens).toBeNull();
  });

  it("flips to signed in once a session is stored", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    expect(useSessionStore.getState().tokens).not.toBeNull();
  });

  it("flips back on sign out", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));
    act(() => useSessionStore.getState().signOut("user"));

    expect(useSessionStore.getState().tokens).toBeNull();
  });
});

describe("sign-in screen", () => {
  it("renders the form when signed out", () => {
    renderScreen(SignInScreen);

    expect(screen.getByTestId("sign-in-form")).toBeOnTheScreen();
  });
});

describe("account screen", () => {
  it("shows the signed-in profile", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    renderScreen(AccountScreen);

    expect(screen.getByText("Emily Johnson")).toBeOnTheScreen();
  });

  it("renders nothing to identify when there is no session", () => {
    renderScreen(AccountScreen);

    expect(screen.queryByText("Emily Johnson")).not.toBeOnTheScreen();
  });
});

describe("the public group", () => {
  /**
   * The showcase is documentation, so it must survive both states. Guarding
   * the `(public)` group would have made it vanish the moment someone signed
   * in — the mistake this pair of assertions exists to catch.
   */
  it("renders while signed out", () => {
    renderScreen(HomeScreen);

    expect(screen.getByText("RN Expo Boilerplate")).toBeOnTheScreen();
  });

  it("still renders while signed in", () => {
    act(() => useSessionStore.getState().signIn({ user, tokens }));

    renderScreen(HomeScreen);

    expect(screen.getByText("RN Expo Boilerplate")).toBeOnTheScreen();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/app/guard.test.tsx`
Expected: FAIL — `Cannot find module '@/app/sign-in'`

- [ ] **Step 3: Tambahkan kunci locale**

Di `src/features/example/languages/example.en.ts`, di dalam blok `signIn`, tambahkan setelah `session`:

```ts
    account: {
      title: "Account",
      subtitle: "A screen only a signed-in session can reach",
    },
```

Di `src/features/example/languages/example.id.ts`, di dalam blok `signIn` yang sama:

```ts
    account: {
      title: "Akun",
      subtitle: "Layar yang hanya bisa dibuka oleh sesi yang sudah masuk",
    },
```

- [ ] **Step 4: Tulis layar sign-in**

Buat `src/app/sign-in.tsx`. Ini adalah `src/app/(public)/example/features/sign-in.tsx` yang lama, dengan tiga perubahan: kartu sesi dihapus (pindah ke `account.tsx`), store diganti `useSessionStore`, dan sign-in lewat adapter.

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { getAuthAdapter, useSessionStore } from "@/features/auth";
import {
  signInSchema,
  type SignInFormValues,
} from "@/features/example/models/form.schema";
import { Alert, AppText, Button, Card, Input, Screen } from "@/shared/components";
import { useFieldError } from "@/shared/hooks";
import type { ApiError } from "@/shared/models";
import { useStyles, view } from "@/styles";

/** DummyJSON publishes these; they are the only way to see the happy path. */
const DEMO = { username: "emilys", password: "emilyspass" } as const;

export default function SignInScreen() {
  const styles = useStyles();
  const { t } = useTranslation();
  const fieldError = useFieldError();

  const signIn = useSessionStore((state) => state.signIn);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const {
    mutate: submitSignIn,
    error: signInError,
    isPending: isSigningIn,
  } = useMutation({
    mutationFn: (values: SignInFormValues) => getAuthAdapter().signIn(values),
    // Nothing navigates here: storing the session removes this route from the
    // navigator, and that is what moves the user.
    onSuccess: signIn,
  });

  const apiError = signInError as ApiError | null;

  return (
    <>
      <Stack.Screen options={{ title: t("features.example.signIn.title") }} />
      <Screen keyboardAvoiding>
        <AppText variant="h2">{t("features.example.signIn.title")}</AppText>
        <AppText variant="caption" color="muted" style={styles.mb6}>
          {t("features.example.signIn.subtitle")}
        </AppText>

        <View testID="sign-in-form" style={view(styles.gap4)}>
          <Card variant="filled">
            <Card.Header
              title={t("features.example.signIn.demo.title")}
              subtitle={t("features.example.signIn.demo.description")}
            />
            <Card.Body>
              <AppText variant="mono" color="muted">
                {DEMO.username} / {DEMO.password}
              </AppText>
            </Card.Body>
            <Card.Footer style={styles.mt3}>
              <Button
                title={t("features.example.signIn.demo.fill")}
                variant="ghost"
                size="sm"
                onPress={() => {
                  setValue("username", DEMO.username);
                  setValue("password", DEMO.password);
                }}
              />
            </Card.Footer>
          </Card>

          {apiError ? (
            <Alert
              variant="error"
              title={t("features.example.signIn.error.title")}
              description={
                apiError.isNetworkError
                  ? t("utils.error.network")
                  : apiError.message
              }
            />
          ) : null}

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.example.signIn.field.username.label")}
                placeholder={t("features.example.signIn.field.username.placeholder")}
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.username?.message)}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label={t("features.example.signIn.field.password.label")}
                placeholder={t("features.example.signIn.field.password.placeholder")}
                type="password"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={fieldError(errors.password?.message)}
              />
            )}
          />

          <Button
            title={t("features.example.signIn.action.signIn")}
            size="lg"
            block
            loading={isSigningIn}
            disabled={isSigningIn}
            onPress={handleSubmit((values) => submitSignIn(values))}
          />
        </View>
      </Screen>
    </>
  );
}
```

- [ ] **Step 5: Tulis layar account**

Buat `src/app/(protected)/account.tsx`:

```tsx
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { selectFullName, useSessionStore } from "@/features/auth";
import { AppText, Avatar, Button, Card, Screen } from "@/shared/components";
import { useStyles, view } from "@/styles";

/**
 * The one screen behind the guard.
 *
 * Signing out does not navigate: clearing the session removes this route from
 * the navigator, and the user is carried out by the guard.
 */
export default function AccountScreen() {
  const styles = useStyles();
  const { t } = useTranslation();

  const user = useSessionStore((state) => state.user);
  const fullName = useSessionStore(selectFullName);
  const signOut = useSessionStore((state) => state.signOut);

  return (
    <>
      <Stack.Screen
        options={{ title: t("features.example.signIn.account.title") }}
      />
      <Screen>
        <AppText variant="h2">
          {t("features.example.signIn.account.title")}
        </AppText>
        <AppText variant="caption" color="muted" style={styles.mb6}>
          {t("features.example.signIn.account.subtitle")}
        </AppText>

        {user ? (
          <Card variant="outlined">
            <View style={view(styles.flexRow, styles.itemsCenter, styles.gap3)}>
              <Avatar source={user.image} name={fullName} size="lg" status="online" />
              <View style={view(styles.flex1, styles.gap1, { minWidth: 0 })}>
                <AppText variant="caption" color="muted">
                  {t("features.example.signIn.session.title")}
                </AppText>
                <AppText variant="title" numberOfLines={1}>
                  {fullName}
                </AppText>
                <AppText variant="caption" color="muted" numberOfLines={1}>
                  {user.email}
                </AppText>
              </View>
            </View>

            <Card.Footer style={styles.mt4}>
              <Button
                title={t("features.example.signIn.action.signOut")}
                variant="outline"
                onPress={() => signOut("user")}
              />
            </Card.Footer>

            <AppText variant="caption" color="muted" style={styles.mt3}>
              {t("features.example.signIn.session.tokenNote")}
            </AppText>
          </Card>
        ) : null}
      </Screen>
    </>
  );
}
```

- [ ] **Step 6: Hapus layar sign-in yang lama**

```bash
git rm "src/app/(public)/example/features/sign-in.tsx"
```

- [ ] **Step 7: Perbarui path rute**

Di `src/features/example/routes/index.ts`, di dalam `examplePaths`, ganti baris `signIn` dan tambahkan `account`:

```ts
  signIn: href("/sign-in"),
  account: href("/account"),
```

- [ ] **Step 8: Pasang guard di root layout**

Di `src/app/_layout.tsx`, tambahkan import berikut:

```tsx
import { selectIsAuthenticated, useSessionStore } from "@/features/auth";
import "@/plugins/auth";
```

Lalu ganti elemen `<Stack ...>` dengan:

```tsx
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.foreground,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        {/* Never guarded: the showcase is documentation, readable in either state. */}
        <Stack.Screen name="(public)" options={{ headerShown: false }} />

        {/* Signing in removes this route, and that is what moves the user on. */}
        <Stack.Protected guard={!isAuthenticated}>
          <Stack.Screen name="sign-in" />
        </Stack.Protected>

        {/* Signing out removes this one, carrying the user back out. */}
        <Stack.Protected guard={isAuthenticated}>
          <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        </Stack.Protected>
      </Stack>
```

Dan di dalam komponen, sebelum `return`:

```tsx
  const isAuthenticated = useSessionStore(selectIsAuthenticated);
```

- [ ] **Step 9: Hapus sign-in dari tes features**

Di `tests/app/features.test.tsx`, hapus baris import `SignInScreen` dan setiap blok tes yang me-render-nya. Layar itu sekarang punya tes sendiri di `tests/app/guard.test.tsx`.

- [ ] **Step 10: Jalankan seluruh tes dan typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS semua, 0 error

- [ ] **Step 11: Verifikasi target pendaratan di perangkat**

Spec menandai satu hal yang harus dipastikan, bukan diasumsikan: ke mana pengguna mendarat setelah rute yang dipijaknya dihapus.

```bash
npm start
```

Buka aplikasi, masuk ke `/sign-in`, tekan "Fill the form" lalu "Sign in". Pastikan aplikasi benar-benar berpindah ke `/account`, bukan diam di layar sign-in atau mendarat di beranda. Bila tidak deterministik, tambahkan `anchor` pada `<Stack>` untuk memaksa target, lalu catat hasilnya di pesan commit.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat(router): guard the session with Stack.Protected"
```

---

### Task 8: Toast sesi kedaluwarsa

**Files:**
- Create: `src/features/auth/components/SessionExpiryToast.tsx`
- Modify: `src/features/auth/index.ts` (ekspor komponen)
- Modify: `src/app/_layout.tsx` (render komponen)
- Test: `tests/features/auth/components/SessionExpiryToast.test.tsx`

**Interfaces:**
- Consumes: `useSessionStore` (Task 1), `useToast` dari `@/shared/components`, kunci `utils.error.unauthorized` yang **sudah ada** di kedua berkas locale.
- Produces: `<SessionExpiryToast />` — tanpa props, tanpa keluaran visual sendiri.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/features/auth/components/SessionExpiryToast.test.tsx`:

```tsx
import { act, render, screen } from "@testing-library/react-native";

import { SessionExpiryToast } from "@/features/auth/components/SessionExpiryToast";
import { useSessionStore } from "@/features/auth";
import "@/plugins/i18n";
import { mmkvStorage } from "@/plugins/mmkv";
import { ToastProvider } from "@/shared/components";

function renderWatcher() {
  return render(
    <ToastProvider>
      <SessionExpiryToast />
    </ToastProvider>,
  );
}

beforeEach(() => {
  jest.useFakeTimers();
  mmkvStorage.clearAll();
  act(() =>
    useSessionStore.setState({ user: null, tokens: null, signOutReason: null }),
  );
});

afterEach(() => {
  jest.useRealTimers();
});

describe("SessionExpiryToast", () => {
  it("stays quiet while the session is fine", () => {
    renderWatcher();

    expect(screen.queryByTestId("toast-container")).not.toBeOnTheScreen();
  });

  it("announces a session that expired", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("expired"));

    expect(screen.getByTestId("toast-container")).toBeOnTheScreen();
    expect(
      screen.getByText("Your session has expired. Please sign in again."),
    ).toBeOnTheScreen();
  });

  it("says nothing when the user signed out deliberately", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("user"));

    expect(screen.queryByTestId("toast-container")).not.toBeOnTheScreen();
  });

  it("clears the reason so it is announced only once", () => {
    renderWatcher();

    act(() => useSessionStore.getState().signOut("expired"));

    expect(useSessionStore.getState().signOutReason).toBeNull();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/features/auth/components/SessionExpiryToast.test.tsx`
Expected: FAIL — `Cannot find module '@/features/auth/components/SessionExpiryToast'`

- [ ] **Step 3: Tulis komponennya**

Buat `src/features/auth/components/SessionExpiryToast.tsx`:

```tsx
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

import { useToast } from "@/shared/components";

import { useSessionStore } from "../stores/session.store";

/**
 * Announces a session that ended on its own.
 *
 * This exists so the request layer never has to touch React. The interceptor
 * records *why* the session ended; this reads that and says it out loud. A
 * deliberate sign-out is not announced — the user already knows.
 *
 * Renders nothing. Mount it once, inside the toast provider.
 */
export function SessionExpiryToast() {
  const toast = useToast();
  const { t } = useTranslation();

  const reason = useSessionStore((state) => state.signOutReason);
  const clearSignOutReason = useSessionStore(
    (state) => state.clearSignOutReason,
  );

  useEffect(() => {
    if (reason !== "expired") return;

    toast.error(t("utils.error.unauthorized"));
    clearSignOutReason();
  }, [reason, toast, t, clearSignOutReason]);

  return null;
}
```

- [ ] **Step 4: Ekspor dari feature**

Di `src/features/auth/index.ts`, tambahkan:

```ts
export { SessionExpiryToast } from "./components/SessionExpiryToast";
```

- [ ] **Step 5: Render di root layout**

Di `src/app/_layout.tsx`, tambahkan `SessionExpiryToast` ke import dari `@/features/auth`, lalu sisipkan tepat setelah `<StatusBar ... />`:

```tsx
        <SessionExpiryToast />
```

- [ ] **Step 6: Jalankan tes dan typecheck**

Run: `npx jest tests/features/auth && npx tsc --noEmit`
Expected: PASS, 0 error

- [ ] **Step 7: Commit**

```bash
git add src/features/auth src/app/_layout.tsx tests/features/auth
git commit -m "feat(auth): announce an expired session without touching the router"
```

---

### Task 9: ErrorBoundary dan +not-found

**Files:**
- Create: `src/app/+not-found.tsx`
- Modify: `src/app/_layout.tsx` (tambah export `ErrorBoundary`)
- Modify: `src/shared/languages/utils.en.ts`, `utils.id.ts`
- Test: `tests/app/fallbacks.test.tsx`

**Interfaces:**
- Consumes: `useTheme`, `useStyles` dari `@/styles`; instance `i18n` dari `@/plugins/i18n`; `EmptyState`, `Button`, `Screen`, `AppText` dari `@/shared/components`.
- Produces: `export function ErrorBoundary(props: ErrorBoundaryProps)` di `src/app/_layout.tsx`, dan default export di `src/app/+not-found.tsx`.

**Kenapa tanpa hook terjemahan:** `Try` membungkus komponen rute itu sendiri (`expo-router/build/useScreens.js:164`), dan sebuah layout mewariskan `ErrorBoundary`-nya ke layar di bawahnya (baris 169). Layar yang crash menghasilkan fallback **di dalam** layout, provider lengkap. Tapi kalau layout root sendiri yang crash, fallback **menggantikan** layout — dirender di luar `AppProvider`, tanpa `I18nextProvider` dan tanpa `ToastProvider`. `i18n.t` bekerja tanpa React provider; `useTranslation` tidak.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/app/fallbacks.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react-native";
import type { ReactNode } from "react";

import NotFoundScreen from "@/app/+not-found";
import { ErrorBoundary } from "@/app/_layout";
import "@/plugins/i18n";

jest.mock("expo-router", () => ({
  Stack: Object.assign(() => null, {
    Screen: () => null,
    Protected: ({ children }: { children: ReactNode }) => children,
  }),
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("@/plugins/auth", () => ({}));

describe("+not-found", () => {
  it("explains that the route does not exist", () => {
    render(<NotFoundScreen />);

    expect(screen.getByText("This screen does not exist")).toBeOnTheScreen();
  });

  it("offers a way back", () => {
    render(<NotFoundScreen />);

    expect(screen.getByText("Go to home")).toBeOnTheScreen();
  });
});

describe("ErrorBoundary", () => {
  /**
   * Rendered bare, with no providers around it. That is not a shortcut — it is
   * the situation this component exists for: when the root layout itself
   * throws, the fallback replaces it and every provider the layout mounts is
   * gone with it.
   */
  it("renders without any provider in scope", () => {
    render(<ErrorBoundary error={new Error("boom")} retry={jest.fn()} />);

    expect(screen.getByText("Something went wrong")).toBeOnTheScreen();
  });

  it("offers a retry", () => {
    const retry = jest.fn();

    render(<ErrorBoundary error={new Error("boom")} retry={retry} />);

    expect(screen.getByText("Try again")).toBeOnTheScreen();
  });

  it("shows the real message while developing", () => {
    render(<ErrorBoundary error={new Error("boom")} retry={jest.fn()} />);

    // __DEV__ is true under Jest, which is exactly the case being asserted.
    expect(screen.getByText("boom")).toBeOnTheScreen();
  });
});
```

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/app/fallbacks.test.tsx`
Expected: FAIL — `Cannot find module '@/app/+not-found'`

- [ ] **Step 3: Tambahkan kunci locale**

Dua suntingan per berkas.

Di `src/shared/languages/utils.en.ts`, di dalam blok `action` yang sudah ada, tambahkan satu baris setelah `close: "Close",`:

```ts
    goHome: "Go to home",
```

Lalu tambahkan blok baru setelah blok `error` yang sudah ada, sebagai properti terakhir objek:

```ts
  fallback: {
    notFoundTitle: "This screen does not exist",
    notFoundDescription: "The link may be broken, or the screen may have moved.",
    errorTitle: "Something went wrong",
    errorDescription: "The screen could not be displayed.",
  },
```

Di `src/shared/languages/utils.id.ts`, di dalam blok `action`, setelah `close: "Tutup",`:

```ts
    goHome: "Ke beranda",
```

Dan setelah blok `error`:

```ts
  fallback: {
    notFoundTitle: "Halaman ini tidak ada",
    notFoundDescription: "Tautannya mungkin rusak, atau layarnya sudah dipindah.",
    errorTitle: "Terjadi kesalahan",
    errorDescription: "Layar ini tidak dapat ditampilkan.",
  },
```

`utils.id.ts` diketik `typeof utils` dari `utils.en.ts`, jadi kunci yang terlewat akan gagal di `tsc` pada Step 6 — bukan diam-diam jatuh ke bahasa Inggris saat runtime.

- [ ] **Step 4: Tulis layar not-found**

Buat `src/app/+not-found.tsx`:

```tsx
import { Stack, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";

import { Button, Card, EmptyState, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

/**
 * Where an unknown deep link lands.
 *
 * Unlike `ErrorBoundary`, this renders inside the layout, so the providers are
 * all present and `useTranslation` is safe here.
 */
export default function NotFoundScreen() {
  const styles = useStyles();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <>
      <Stack.Screen options={{ title: t("utils.fallback.notFoundTitle") }} />
      <Screen>
        <Card variant="outlined" style={styles.mt6}>
          <EmptyState
            title={t("utils.fallback.notFoundTitle")}
            description={t("utils.fallback.notFoundDescription")}
            action={
              <Button
                title={t("utils.action.goHome")}
                onPress={() => router.replace("/")}
              />
            }
          />
        </Card>
      </Screen>
    </>
  );
}
```

`EmptyState` sudah menerima `action?: ReactNode` (`src/shared/components/EmptyState.tsx:12`), jadi kode di atas dipakai apa adanya.

- [ ] **Step 5: Tulis ErrorBoundary**

Di `src/app/_layout.tsx`, tambahkan import:

```tsx
import type { ErrorBoundaryProps } from "expo-router";
import { ScrollView, View } from "react-native";

import i18n from "@/plugins/i18n";
import { AppText, Button } from "@/shared/components";
import { text, useStyles, view } from "@/styles";
```

Lalu tambahkan di akhir berkas:

```tsx
/**
 * What replaces a screen that threw.
 *
 * Expo Router wraps the route component itself, and a layout passes its
 * boundary down to the screens beneath it. A screen that throws renders this
 * inside the layout, with every provider in place — but when the root layout
 * itself throws, this replaces the layout, and `AppProvider` is gone with it.
 *
 * That is why nothing here may call `useTranslation` or `useToast`. `i18n.t`
 * reads the same bundle without needing a React provider, and `useStyles`
 * comes from Zustand, which needs none either.
 */
export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const styles = useStyles();

  return (
    <View
      style={view(
        styles.flex1,
        styles.bgBackground,
        styles.p6,
        styles.justifyCenter,
        styles.gap4,
      )}
    >
      <AppText variant="h2">{i18n.t("utils.fallback.errorTitle")}</AppText>
      <AppText variant="caption" color="muted">
        {i18n.t("utils.fallback.errorDescription")}
      </AppText>

      {__DEV__ ? (
        <ScrollView style={view(styles.maxH40, styles.bgSecondary, styles.roundedLg, styles.p3)}>
          <AppText variant="mono" color="muted">
            {error.message}
          </AppText>
        </ScrollView>
      ) : null}

      <Button title={i18n.t("utils.action.retry")} onPress={retry} block />
    </View>
  );
}
```

`maxH40` ada dan bernilai `maxHeight: 160` — utilitas `maxH*` digenerate dari token spacing (`src/styles/utils/sizing.ts:52`, token `40` = 160 di `src/styles/tokens/spacing.ts:27`).

- [ ] **Step 6: Jalankan tes dan typecheck**

Run: `npx jest tests/app/fallbacks.test.tsx && npx tsc --noEmit`
Expected: PASS, 5 tes, 0 error

- [ ] **Step 7: Commit**

```bash
git add src/app src/shared/languages tests/app/fallbacks.test.tsx
git commit -m "feat(app): themed error boundary and not-found screen"
```

---

### Task 10: Buang auth lama

**Files:**
- Delete: `src/features/example/stores/auth.store.ts`
- Delete: `tests/features/example/stores/auth.store.test.ts`
- Modify: `src/plugins/mmkv/keys.ts`
- Modify: `src/features/example/routes/index.ts` (daftar plugin pada kartu sign-in)

**Interfaces:**
- Consumes: tidak ada.
- Produces: tidak ada. Task ini murni membuang yang sudah tidak terpakai.

- [ ] **Step 1: Pastikan benar-benar tidak terpakai**

```bash
grep -rn "auth.store\|useAuthStore\|storageKeys.auth" src/ tests/
```

Expected: tidak ada hasil selain berkas yang akan dihapus di langkah berikutnya. Bila masih ada pemakai, perbaiki dulu — jangan hapus.

- [ ] **Step 2: Hapus store lama dan tesnya**

```bash
git rm src/features/example/stores/auth.store.ts
git rm tests/features/example/stores/auth.store.test.ts
```

- [ ] **Step 3: Buang key MMKV yang sudah mati**

Di `src/plugins/mmkv/keys.ts`, hapus seluruh blok `auth`, sehingga tersisa:

```ts
export const storageKeys = {
  app: {
    theme: "settings.theme",
    language: "settings.language",
  },
} as const;
```

- [ ] **Step 4: Perbarui daftar plugin pada kartu sign-in**

Di `src/features/example/routes/index.ts`, pada entri `featureScreens` dengan `name: ExamplePageName.SIGN_IN`, ganti `plugins`:

```ts
    plugins: ["react-hook-form", "zod", "axios", "mmkv", "zustand", "expo-router"],
```

- [ ] **Step 5: Jalankan seluruh tes dan typecheck**

Run: `npx jest && npx tsc --noEmit`
Expected: PASS semua, 0 error

- [ ] **Step 6: Jalankan lint**

Run: `npx expo lint`
Expected: tanpa error

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore(auth): drop the demo auth store and its dead storage keys"
```

---

## Verifikasi akhir

- [ ] `npx tsc --noEmit` → 0 error
- [ ] `npx jest` → seluruh suite hijau
- [ ] `npx expo lint` → tanpa error
- [ ] Sudah dijalankan di perangkat: sign-in memindahkan ke `/account`, sign-out mengembalikan keluar, `/example` terjangkau di kedua keadaan
- [ ] `grep -rn "router.replace\|router.push" src/app/sign-in.tsx "src/app/(protected)"` → tidak ada hasil, membuktikan perpindahan murni dari guard
