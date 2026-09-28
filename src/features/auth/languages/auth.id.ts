import type auth from "./auth.en";

/** Indonesian copy for the auth feature — typed against `auth.en`. */
const authId: typeof auth = {
  signIn: {
    title: "Masuk",
    subtitle: "React Hook Form, Zod, Axios, dan token yang disimpan di MMKV",

    demo: {
      title: "Akun demo",
      description: "DummyJSON menerima kredensial berikut.",
      fill: "Isi formulir",
    },

    field: {
      username: {
        label: "Nama pengguna",
        placeholder: "emilys",
      },
      password: {
        label: "Kata sandi",
        placeholder: "••••••••",
      },
    },

    validation: {
      usernameMin: "Nama pengguna minimal 3 karakter",
      passwordMin: "Kata sandi minimal 6 karakter",
    },

    action: {
      signIn: "Masuk",
      signOut: "Keluar",
    },

    session: {
      title: "Sudah masuk",
      tokenNote: "Token akses tersimpan di MMKV dan disertakan di setiap permintaan.",
    },

    account: {
      title: "Akun",
      subtitle: "Layar yang hanya bisa dibuka oleh sesi yang sudah masuk",
    },

    error: {
      title: "Gagal masuk",
    },

    toast: {
      signedIn: "Selamat datang kembali",
      signedOut: "Berhasil keluar",
    },
  },
};

export default authId;
