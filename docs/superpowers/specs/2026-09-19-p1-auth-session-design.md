# P1 — Auth Guard, Refresh Session, dan Error Boundary

Tanggal: 2026-09-19
Status: disetujui, siap masuk rencana implementasi

## Konteks

Boilerplate ini sudah punya `auth.store.ts`, token tersimpan di MMKV, dan
interceptor Axios yang menempelkan `Authorization`. Yang belum ada: tidak satu
pun rute dilindungi, `storageKeys.auth.refreshToken` ditulis tapi tidak pernah
dibaca di mana pun, dan tidak ada `+not-found` maupun `ErrorBoundary`. Akibatnya
sesi yang kedaluwarsa membuat pengguna mentok sampai sign-out manual, dan deep
link yang salah berujung layar kosong.

Seluruh pola auth yang ada saat ini hidup di dalam `src/features/example/`, yaitu
folder yang justru diharapkan dihapus saat boilerplate dipakai untuk proyek baru.

## Sasaran

1. Rute terlindungi lewat `Stack.Protected`, digerakkan murni oleh state sesi.
2. Alur refresh token pada 401, dengan single-flight.
3. `ErrorBoundary` dan `+not-found` yang bertema dan aman di semua kondisi.
4. Pola auth menjadi milik boilerplate, bukan milik folder demo.

## Bukan sasaran

- Biometrik, OAuth, atau social login.
- Penyimpanan token di Keychain/Keystore. (Catatan risiko ada di bagian akhir.)
- Penyegaran proaktif sebelum token kedaluwarsa. Reaktif terhadap 401 sudah cukup
  dan tidak menuntut penguraian klaim `exp`.
- CI, script `typecheck`, dan sisa temuan P2/P3. Itu pekerjaan terpisah.

## Keputusan yang diambil

| Keputusan | Pilihan | Alasan |
|---|---|---|
| Lokasi auth | Promote ke `src/features/auth` | Menghapus folder demo tidak lagi menghapus pola auth |
| Sumber endpoint | Seam adapter, didaftarkan saat boot | Ganti backend = satu adapter, guard dan interceptor tidak tersentuh |
| Bentuk router | Grup `(public)` selalu tersedia, `sign-in` dan `(protected)` masing-masing dijaga | Pola kanonik Expo Router; grup berkurung tidak muncul di URL |
| Sesi habis | Sign out + toast, guard yang memindahkan | Tidak ada navigasi imperatif; store tetap satu sumber kebenaran |
| State sesi | Store Zustand sebagai satu-satunya sumber kebenaran | Menghapus kemungkinan store dan MMKV berbeda isi |

Keputusan terakhir membalik komentar yang saat ini ada di `auth.store.ts:30`,
yang menaruh token di key MMKV mentah "karena interceptor tidak tahu-menahu soal
store ini". Batasan itu lenyap begitu auth menjadi feature sungguhan: Zustand
dapat dibaca di luar React lewat `useSessionStore.getState()`.

## Arsitektur

```
src/features/auth/
  models/session.model.ts   AuthUser, AuthTokens, AuthAdapter, SignOutReason
  stores/session.store.ts   useSessionStore + selector
  services/adapter.ts       registerAuthAdapter() / getAuthAdapter()
  services/refresh.ts       ensureFreshToken() — single-flight
  components/SessionExpiryToast.tsx
  index.ts

src/plugins/auth/index.ts                      titik tukar backend (3 baris)
src/features/example/services/auth.adapter.ts  implementasi DummyJSON
```

### Kontrak adapter

```ts
export type AuthTokens = { accessToken: string; refreshToken: string };

export type AuthAdapter = {
  signIn(credentials: unknown): Promise<{ user: AuthUser; tokens: AuthTokens }>;
  refresh(refreshToken: string): Promise<AuthTokens>;
};
```

`getAuthAdapter()` melempar error yang menjelaskan diri sendiri bila belum ada
adapter terdaftar, supaya salah rakit terdeteksi saat boot, bukan saat request
pertama.

Registrasi berjalan sebagai efek modul di `src/plugins/auth/index.ts`, mengikuti
pola yang sudah dipakai `src/plugins/i18n`. Root layout meng-import modul itu
satu kali.

### Bentuk store

```ts
type SessionState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  signOutReason: SignOutReason | null;   // "user" | "expired" | null
  signIn: (payload: { user: AuthUser; tokens: AuthTokens }) => void;
  setTokens: (tokens: AuthTokens) => void;
  signOut: (reason: SignOutReason) => void;
  clearSignOutReason: () => void;
};

export const selectIsAuthenticated = (s: SessionState) => s.tokens !== null;
```

Dipersist ke MMKV lewat `zustandStorage` yang sudah ada. MMKV sinkron, jadi
rehidrasi selesai sebelum render pertama dan guard tidak pernah berkedip ke
layar sign-in saat cold start.

`selectIsAuthenticated` sengaja menguji `tokens`, bukan `user`: token adalah yang
menentukan sebuah request bisa berhasil.

## Alur refresh

```ts
let inFlight: Promise<AuthTokens | null> | null = null;

export function ensureFreshToken(): Promise<AuthTokens | null> {
  if (inFlight) return inFlight;
  inFlight = runRefresh().finally(() => { inFlight = null; });
  return inFlight;
}

async function runRefresh(): Promise<AuthTokens | null> {
  const { tokens, setTokens } = useSessionStore.getState();
  if (!tokens?.refreshToken) return null;

  try {
    const next = await getAuthAdapter().refresh(tokens.refreshToken);
    setTokens(next);
    return next;
  } catch {
    return null;
  }
}
```

Response interceptor, saat menerima 401:

1. Lewati bila `meta.requiresAuth === false`, atau bila `meta._retried` sudah
   ditandai.
2. `const tokens = await ensureFreshToken()`.
3. Bila `null` → `signOut("expired")`, lalu tolak dengan `toApiError(error)`
   seperti biasa.
4. Bila ada → tandai `meta._retried = true`, ulang request aslinya melalui
   instance yang sama.

Sepuluh request yang kena 401 bersamaan menunggu promise `inFlight` yang sama,
lalu masing-masing mengulang request-nya sendiri. Penanda `_retried` mencegah
loop bila request ulangan tetap 401.

Rekursi tertutup oleh desain `meta` yang sudah ada: panggilan `refresh` milik
adapter memakai `meta: { requiresAuth: false }`, sehingga request interceptor
tidak menempelkan token basi padanya dan response interceptor melewatinya saat
gagal. Tidak dibutuhkan flag khusus.

### Matriks kegagalan

| Kejadian | Perilaku |
|---|---|
| Refresh ditolak server | `signOut("expired")` → guard memindahkan → toast |
| Tidak ada refresh token tersimpan | Sign-out langsung, tanpa panggilan jaringan |
| 401 pada request `requiresAuth: false` | Diteruskan apa adanya |
| Error jaringan tanpa response | Tidak tersentuh; jalur `isNetworkError` tetap |
| Request ulangan tetap 401 | `_retried` menghentikannya; sign-out |

Tipe `ApiError` tidak berubah, jadi layar yang sudah ada tidak perlu disesuaikan.
Konsekuensi yang diterima secara sadar: request yang memicu sign-out tetap
menolak dengan error, sehingga layar sempat menampilkan state error-nya sesaat
sebelum guard memindahkan. Ini dipilih ketimbang menelan error diam-diam.

### Toast tanpa navigasi imperatif

`signOut(reason)` menyetel `signOutReason`. Komponen `<SessionExpiryToast />`
membacanya, memunculkan toast bila bernilai `"expired"`, lalu memanggil
`clearSignOutReason()`. Interceptor tidak pernah menyentuh React.

Komponen itu dirender di `src/app/_layout.tsx` di dalam `AppProvider`, bukan di
dalam `AppProvider` itu sendiri: `src/app/**` memang sudah bergantung ke
`features/**`, sedangkan `src/providers/**` belum, dan arah ketergantungan baru
itu tidak perlu dibuka hanya untuk satu toast.

## Restrukturisasi router

```
src/app/
  _layout.tsx           Stack.Protected + export ErrorBoundary + <SessionExpiryToast />
  +not-found.tsx
  (public)/             selalu tersedia, di kedua keadaan sesi
    index.tsx           dari src/app/index.tsx
    example/**          dipindah apa adanya
  sign-in.tsx           dari src/app/example/features/sign-in.tsx — dijaga !isAuthenticated
  (protected)/
    account.tsx         kartu sesi yang sekarang menempel di dalam sign-in.tsx
```

Guard di root layout:

```tsx
const isAuthenticated = useSessionStore(selectIsAuthenticated);

<Stack>
  <Stack.Screen name="(public)" />

  <Stack.Protected guard={!isAuthenticated}>
    <Stack.Screen name="sign-in" />
  </Stack.Protected>

  <Stack.Protected guard={isAuthenticated}>
    <Stack.Screen name="(protected)" />
  </Stack.Protected>
</Stack>
```

Tiga hal yang menentukan bentuk ini, dan ketiganya berasal dari cara
`Stack.Protected` benar-benar bekerja (`withLayoutContext.js:50`: rute dengan
guard `false` dikeluarkan dari daftar screen navigator):

1. **`(public)` tidak dijaga sama sekali.** Membungkusnya dengan
   `guard={!isAuthenticated}` akan melenyapkan seluruh showcase begitu pengguna
   masuk. Showcase adalah dokumentasi, jadi harus hidup di kedua keadaan.
2. **`sign-in` harus dijaga `!isAuthenticated`.** Perpindahan otomatis terjadi
   justru karena rute yang sedang dipijak pengguna dihapus. Tanpa guard ini,
   sign-in yang berhasil hanya membuat pengguna berdiri diam di layar sign-in.
3. **`(protected)` dijaga `isAuthenticated`,** sehingga sign-out melenyapkan
   rute yang sedang dipijak dan pengguna terlempar keluar dengan sendirinya.

Tidak ada satu pun `router.replace()`; perpindahan di kedua arah murni akibat
guard bereaksi terhadap store.

Satu hal yang harus dipastikan saat implementasi, bukan diasumsikan: **ke mana
persisnya pengguna mendarat** setelah rute yang dipijaknya dihapus. Perilaku
fallback navigator perlu dipin secara eksplisit lewat `anchor` pada `Stack` bila
ternyata tidak deterministik. Tes guard dalam rencana pengujian di bawah
ditulis khusus untuk mengunci perilaku ini.

Grup berkurung tidak muncul di URL, sehingga memindahkan `example/**` ke dalam
`(public)/` tidak mengubah satu pun path. Seluruh `examplePaths` tetap valid.
Yang berubah hanya `/example/features/sign-in` menjadi `/sign-in`, ditambah
`/account` yang baru.

## ErrorBoundary dan not-found

`Try` membungkus komponen rute itu sendiri, dan sebuah layout mewariskan
`ErrorBoundary`-nya ke layar di bawahnya (`expo-router/build/useScreens.js:164`
dan `:169`). Ada dua skenario:

- Layar yang crash: fallback dirender di dalam layout, provider lengkap tersedia.
- Layout root yang crash: fallback menggantikan layout, sehingga dirender di
  **luar** `AppProvider`.

Karena itu `ErrorBoundary` tidak boleh bergantung pada provider apa pun. Ia
memakai `i18n.t` langsung dari instance i18next dan `useTheme()` dari Zustand,
keduanya bekerja tanpa React provider. `useTranslation` dan `useToast` dilarang
di dalam komponen ini.

Pesan error mentah hanya ditampilkan saat `__DEV__`; produksi menampilkan pesan
generik plus tombol `retry`.

`+not-found.tsx` memakai `EmptyState` dan `Button` yang sudah ada, dengan tombol
kembali ke beranda.

## Rencana pengujian

Tes ditulis lebih dulu, mengikuti disiplin tes yang sudah ada di repo.

| Yang diuji | Alasan dipilih |
|---|---|
| Sepuluh 401 bersamaan → `refresh` dipanggil tepat sekali, sepuluh request diulang dan sukses | Inti single-flight; menutup bug termahal fitur ini |
| Refresh ditolak → sesi bersih, `signOutReason === "expired"`, error asli tetap `ApiError` | Menjaga kontrak layar tidak berubah |
| 401 pada `requiresAuth: false` → `refresh` tidak dipanggil | Membuktikan rekursi tertutup |
| Tanpa refresh token → sign-out langsung, tanpa panggilan jaringan | Jalur tepi yang mudah terlewat |
| Guard: store kosong → `account` tak terjangkau dan `sign-in` ada; setelah sign-in → `sign-in` lenyap, pengguna mendarat di `account`; setelah sign-out → kembali keluar | Mengunci perpindahan dua arah sekaligus target pendaratannya, yang justru belum pasti |
| Showcase `/example` terjangkau di kedua keadaan sesi | Menjaga keputusan "showcase adalah dokumentasi, bukan area privat" |
| `+not-found` dan `ErrorBoundary` me-render fallback | Keduanya tak terlihat sampai hari buruk tiba |
| `getAuthAdapter()` tanpa adapter terdaftar → error yang menjelaskan diri | Salah rakit terdeteksi saat boot |

Berkas tes yang ikut berubah:

- `tests/app/features.test.tsx` dan `tests/app/showcase.test.tsx` — path import.
- `tests/features/example/stores/auth.store.test.ts` → pindah menjadi
  `tests/features/auth/stores/session.store.test.ts`.
- `tests/plugins/axios/interceptor.test.ts` — bertambah kasus 401.

## Dampak pada berkas yang ada

Dipindah: `src/app/index.tsx`, `src/app/example/**`,
`src/app/example/features/sign-in.tsx`.

Diubah: `src/app/_layout.tsx`, `src/plugins/axios/interceptor.ts`,
`src/features/example/routes/index.ts` (path sign-in dan account),
`src/features/example/services/api.ts` (login lewat adapter),
`src/locales/**` (kunci baru untuk sesi habis, not-found, error boundary).

Dihapus: `src/features/example/stores/auth.store.ts` (digantikan
`session.store.ts`), dan entri `storageKeys.auth` yang tak lagi dipakai.

## Risiko yang diterima

- **Token disimpan di MMKV tanpa enkripsi.** Sama seperti perilaku sekarang, jadi
  bukan kemunduran, tapi tetap perlu dicatat: MMKV mendukung enkripsi dan
  Keychain/Keystore adalah langkah lanjutan yang wajar. Di luar cakupan P1.
- **`meta._retried` menumpang pada objek config Axios.** Sudah sesuai dengan pola
  `meta` yang ada, tapi berarti kontrak `CustomAxiosRequestConfig` bertambah satu
  field internal. Akan ditandai jelas sebagai internal.
- **Memindahkan `example/**` menghasilkan diff yang besar** walau isinya nyaris
  tak berubah. Review akan lebih mudah bila perpindahan berkas dilakukan sebagai
  commit tersendiri, terpisah dari perubahan logika.
