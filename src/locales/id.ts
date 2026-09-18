import type { en } from "./en";

/** Indonesian translations — typed against `en` so missing keys fail the build. */
export const id: typeof en = {
  common: {
    appName: "RN Expo Boilerplate",
    language: "Bahasa",

    action: {
      save: "Simpan",
      cancel: "Batal",
      submit: "Kirim",
      clear: "Bersihkan",
      retry: "Coba lagi",
      delete: "Hapus",
      close: "Tutup",
    },

    state: {
      loading: "Memuat…",
      empty: "Belum ada data",
      offline: "Anda sedang offline",
    },

    form: {
      required: "{{field}} wajib diisi",
      invalidEmail: "Masukkan alamat email yang valid",
      minLength: "{{field}} minimal {{count}} karakter",
      maxLength: "{{field}} maksimal {{count}} karakter",
    },

    error: {
      generic: "Terjadi kesalahan. Silakan coba lagi.",
      network: "Tidak dapat menghubungi server. Periksa koneksi Anda.",
      unauthorized: "Sesi Anda telah berakhir. Silakan masuk kembali.",
    },
  },
};
