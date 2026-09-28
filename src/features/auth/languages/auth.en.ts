/**
 * Copy for the auth feature: the sign-in and account screens.
 *
 * Validation strings are stored as translation *keys* by `signIn.schema.ts`
 * and translated at render time — see that file for why.
 */
export default {
  signIn: {
    title: "Sign in",
    subtitle: "React Hook Form, Zod, Axios, and a token persisted in MMKV",

    demo: {
      title: "Demo account",
      description: "DummyJSON accepts these credentials.",
      fill: "Fill the form",
    },

    field: {
      username: {
        label: "Username",
        placeholder: "emilys",
      },
      password: {
        label: "Password",
        placeholder: "••••••••",
      },
    },

    validation: {
      usernameMin: "Username must be at least 3 characters",
      passwordMin: "Password must be at least 6 characters",
    },

    action: {
      signIn: "Sign in",
      signOut: "Sign out",
    },

    session: {
      title: "Signed in",
      tokenNote: "The access token is stored in MMKV and attached to every request.",
    },

    account: {
      title: "Account",
      subtitle: "A screen only a signed-in session can reach",
    },

    error: {
      title: "Could not sign in",
    },

    toast: {
      signedIn: "Welcome back",
      signedOut: "Signed out",
    },
  },
};
