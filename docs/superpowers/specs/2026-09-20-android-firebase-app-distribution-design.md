# Desain: Deploy otomatis Android ke Firebase App Distribution saat merge ke `main`

Tanggal: 2026-09-20
Status: disetujui, siap dijadikan rencana implementasi

## Masalah

Build release Android saat ini dijalankan manual di laptop lewat
`npm run android:release`. Tidak ada jalur otomatis dari kode yang sudah
di-merge ke APK yang diterima tester.

Tujuan: setiap merge ke `main` menghasilkan APK release yang tersigning
dengan benar dan otomatis terdistribusi ke grup tester di Firebase App
Distribution.

## Keputusan yang diambil

| Keputusan | Pilihan | Alasan |
| --- | --- | --- |
| Tempat build | GitHub Actions + Gradle | Repo sudah di GitHub, tidak menambah biaya build credits, cocok dengan `scripts/build-android-release.mjs` yang sudah ada |
| Signing | Keystore release baru | Debug keystore memaksa tester uninstall-install ulang saat nanti pindah ke keystore asli |
| Platform | Android saja | Tidak ada script build iOS, dan iOS butuh Apple Developer account + runner macOS |
| Versioning | Suffix run number + SHA di release notes | `versionCode` tetap diturunkan dari `package.json`, tapi tester bisa membedakan tiap build |

## Kondisi repo yang membentuk desain

- `/android` dan `/ios` di-gitignore (`.gitignore`), jadi native project
  di-regenerate `expo prebuild` setiap run CI. **Mengedit
  `android/app/build.gradle` secara permanen tidak mungkin** — akan selalu
  tertimpa.
- `android/app/build.gradle:116` saat ini berisi
  `signingConfig signingConfigs.debug` di dalam `buildTypes.release`, yaitu
  default template Expo. Tanpa perubahan, APK release tersigning debug key.
- `android/gradle/wrapper/gradle-wrapper.properties` memakai Gradle 9.3.1,
  yang minimal butuh JDK 17.
- `.env*` di-gitignore kecuali `.env.example`, jadi `EXPO_PUBLIC_*` harus
  datang dari konfigurasi GitHub saat build.
- `configs/android.config.ts:5` menurunkan `versionCode` dari versi di
  `package.json`, sehingga dua merge tanpa bump versi menghasilkan
  `versionCode` identik.
- `configs/font.config.ts` dan `configs/locales.config.ts` bukan custom
  config plugin — keduanya hanya tuple `[nama-paket, opsi]`. Plugin signing
  ini akan menjadi custom config plugin pertama di repo ini.

## Arsitektur

Empat komponen, saling lepas:

```
configs/signing.config.ts   →  menyisipkan signingConfigs.release ke build.gradle
        ↑ dipakai oleh
app.config.ts               →  withReleaseSigning(config)
        ↑ dibaca oleh
.github/workflows/deploy-android.yml
        │  prebuild → assembleRelease → upload
        ↓
Firebase App Distribution
```

### Komponen 1 — `configs/signing.config.ts`

Sebuah config plugin yang memodifikasi `android/app/build.gradle` saat
prebuild. Dipecah jadi dua bagian supaya bisa diuji:

- `addReleaseSigningConfig(contents: string): string` — transformasi string
  murni, tanpa dependensi ke Expo. Ini yang diuji jest.
- `withReleaseSigning: ConfigPlugin` — pembungkus tipis memakai
  `withAppBuildGradle` dari `expo/config-plugins`.

Transformasi melakukan dua hal.

**(a) Menambahkan `release` ke dalam blok `signingConfigs`**, tepat setelah
blok `debug`:

```groovy
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }
```

**(b) Mengubah pemilihan signing config di `buildTypes.release`** menjadi
kondisional. Anchor yang dipakai adalah dua baris berurutan, karena teks
`signingConfig signingConfigs.debug` sendiri muncul dua kali di file
(sekali di `buildTypes.debug`, sekali di `buildTypes.release`):

```
            signingConfig signingConfigs.debug
            def enableShrinkResources
```

menjadi

```
            signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug
            def enableShrinkResources
```

Dua properti penting dari transformasi ini:

- **Build lokal tidak rusak.** Tanpa env `ANDROID_KEYSTORE_PASSWORD`,
  Gradle jatuh ke `signingConfigs.debug`, jadi `npm run android` dan
  `npm run android:release` di laptop tetap jalan tanpa keystore.
- **Gagal berisik, bukan diam.** Kalau anchor tidak ditemukan (misalnya
  karena template Expo berubah di SDK berikutnya), fungsi ini melempar
  error. Kalau ia diam-diam jadi no-op, CI akan menghasilkan APK
  debug-signed sementara kita menyangka sudah release-signed — kegagalan
  paling berbahaya di seluruh desain ini.
- **Idempoten.** Kalau `signingConfigs.release` sudah ada di contents,
  transformasi dilewati.

### Komponen 2 — `app.config.ts`

Plugin diterapkan langsung ke objek config, bukan lewat array `plugins`:

```ts
export default withReleaseSigning(config);
```

Alasannya tipe: `ExpoConfig["plugins"]` adalah
`(string | [] | [string] | [string, any])[]`, yang tidak mencakup fungsi —
itu sebabnya `plugins.config.ts` sekarang harus menulis
`fontPlugin as [string, any]`. Menerapkan plugin langsung menghindari cast
dan tetap lolos type-check, karena `ConfigPlugin` bertanda tangan
`(config: ExpoConfig, props) => ExpoConfig`.

### Komponen 3 — `.github/workflows/deploy-android.yml`

```yaml
on:
  push:
    branches: [main]
  workflow_dispatch:

concurrency:
  group: android-distribution
  cancel-in-progress: false

jobs:
  distribute:
    runs-on: ubuntu-latest
    environment: app-distribution
```

`workflow_dispatch` ada supaya workflow bisa diuji dari branch sebelum
apa pun di-merge ke `main`. `cancel-in-progress: false` karena distribusi
yang sudah separuh jalan tidak boleh dibatalkan oleh merge berikutnya.

Urutan step:

1. `actions/checkout`
2. `actions/setup-node` v20, `cache: npm`
3. `actions/setup-java` v17 distribusi `temurin`, `cache: gradle`
4. `npm ci`
5. Decode `ANDROID_KEYSTORE_BASE64` ke file keystore di `$RUNNER_TEMP`
   (di luar workspace, tidak pernah masuk git), lalu set
   `ANDROID_KEYSTORE_PATH` ke path **absolut** file itu. Absolut karena
   `file()` di `build.gradle` me-resolve path relatif terhadap `android/app`,
   bukan terhadap root repo
6. Decode `FIREBASE_SERVICE_ACCOUNT_JSON` ke file, set
   `GOOGLE_APPLICATION_CREDENTIALS`
7. `npx expo prebuild --platform android --no-install` — flag `--no-install`
   dipakai karena `npm ci` di step 4 sudah memasang dependensi; tanpa flag
   ini prebuild menjalankan install kedua yang sia-sia
8. `./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a`
   dengan env keystore dan `EXPO_PUBLIC_*` ter-set
9. `actions/upload-artifact` untuk APK-nya
10. `npx firebase-tools appdistribution:distribute` ke App Distribution

Dua penyimpangan dari `scripts/build-android-release.mjs`:

- **Arsitektur dipersempit** ke `arm64-v8a,armeabi-v7a` saja, dari empat
  arsitektur. `x86` dan `x86_64` hanya dipakai emulator; tester memakai HP
  asli. Ini memotong waktu build hampir separuh.
- **Gradle dipanggil langsung**, bukan lewat script `.mjs`. Script itu
  dirancang untuk laptop (deteksi `gradlew.bat` untuk Windows) dan tidak
  memberi nilai tambah di runner Linux, sementara memanggil Gradle langsung
  membuat log CI lebih mudah dibaca. Script lokal dibiarkan apa adanya.

Upload memakai CLI resmi `firebase-tools`, bukan GitHub Action pihak ketiga,
supaya kredensial distribusi tidak melewati kode pihak ketiga:

```
npx firebase-tools appdistribution:distribute <apk> \
  --app "$FIREBASE_ANDROID_APP_ID" \
  --groups "$FIREBASE_TESTER_GROUPS" \
  --release-notes "<subject commit> (#<run_number> <sha pendek>)"
```

APK diunggah sebagai artifact Actions **sebelum** step Firebase, supaya
kalau upload Firebase gagal, hasil build tetap bisa diambil manual.

### Komponen 4 — Konfigurasi GitHub

Secrets disimpan sebagai **environment secrets** di environment bernama
`app-distribution`, bukan repository secrets. Repo ini public, jadi
protection rules environment tersedia tanpa biaya.

Alasannya keystore: ia secret paling bernilai di repo ini dan kebocorannya
tidak bisa dicabut — semua tester harus uninstall. Environment memberi
**deployment branch rules** (hanya branch tertentu boleh memakainya) plus
riwayat di tab Deployments. Repository secrets bisa dibaca workflow dari
branch mana pun yang punya akses push. Risiko dari fork sudah tertutup
secara default, karena GitHub tidak memberikan secrets ke workflow yang
dipicu `pull_request` dari fork; environment menutup risiko yang berbeda,
yaitu akses push ke repo ini sendiri.

Konsekuensinya di workflow: job wajib mendeklarasikan
`environment: app-distribution`. Tanpa baris itu, environment secrets tidak
terlihat sama sekali oleh job.

Environment secrets di `app-distribution`:

| Nama | Isi |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | keystore release, di-base64 |
| `ANDROID_KEYSTORE_PASSWORD` | password keystore |
| `ANDROID_KEY_ALIAS` | alias key |
| `ANDROID_KEY_PASSWORD` | password key |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | service account dengan role Firebase App Distribution Admin |

Deployment branch rules environment: *Selected branches and tags*. Selama
masa setup berisi `main` **dan** `feat/auto-deploy`; setelah merge,
`feat/auto-deploy` dihapus sehingga tinggal `main`. Alasannya ada di bagian
Strategi verifikasi.

Repository variables (bukan secrets, tidak perlu digerbangi environment):

| Nama | Isi |
| --- | --- |
| `FIREBASE_ANDROID_APP_ID` | app ID Firebase, format `1:123:android:abc` — wajib |
| `FIREBASE_TESTER_GROUPS` | alias grup tester, dipisah koma — wajib |
| `EXPO_PUBLIC_APP_NAME` | opsional; `app.config.ts:11` sudah punya fallback `?? packageJson.name` |
| `EXPO_PUBLIC_API_URL` | opsional; mengisi `baseURL` di `src/plugins/axios/index.ts:10`. Fitur example sengaja menulis host per request (lihat `src/features/example/services/api.ts:14`) sehingga build dan app tetap jalan tanpa ini |

`EXPO_PUBLIC_APP_SCHEME` ada di `.env.example` tapi **tidak dibaca kode mana
pun** — `app.config.ts:16` menulis `scheme: "rnexpoboilerplate"` hardcoded.
Karena itu ia tidak dimasukkan sebagai variable di sini. Ketidaksesuaian
`.env.example` itu masalah tersendiri, di luar lingkup pekerjaan ini.

`EXPO_PUBLIC_*` sengaja ditaruh sebagai Variables, bukan Secrets. Prefix
`EXPO_PUBLIC_` berarti nilainya di-inline ke dalam JS bundle dan bisa dibaca
siapa pun yang membongkar APK; menyimpannya sebagai Secret hanya memberi
rasa aman yang palsu. Nilai yang benar-benar rahasia tidak boleh memakai
prefix itu sama sekali.

README ditambah satu bagian yang mendokumentasikan tabel di atas plus
perintah pembuatan keystore.

## Strategi verifikasi

Tiga lapis, dari murah ke mahal:

1. **Unit test jest** atas `addReleaseSigningConfig`, memakai fixture berisi
   potongan `signingConfigs` + `buildTypes` asli dari
   `android/app/build.gradle`. Yang diuji: blok `release` tersisip, baris
   pemilihan signing berubah jadi kondisional, `buildTypes.debug` tidak
   tersentuh, transformasi idempoten, dan **melempar error saat anchor tidak
   ada**.
2. **Prebuild lokal** — jalankan `npx expo prebuild --platform android` lalu
   periksa `android/app/build.gradle` benar-benar memuat hasil transformasi.
   Ini membuktikan plugin terpasang, bukan cuma fungsinya benar.
3. **`workflow_dispatch` di branch `feat/auto-deploy`** — bukti end-to-end
   bahwa APK mendarat di App Distribution. Dijalankan sebelum merge ke
   `main`, karena trigger `push: main` tidak bisa diuji tanpa merge.

Bukti dari lapis 3 adalah syarat sebelum branch ini di-merge.

Lapis 3 punya prasyarat: selama pengujian, deployment branch rules environment
`app-distribution` harus mengizinkan `feat/auto-deploy` — atau dibiarkan pada
default "All branches" sampai merge selesai. Deployment branches adalah
*protection rule*, dan dokumentasi GitHub menyatakan "the job won't start until
all of the environment's protection rules pass", jadi branch yang tidak
diizinkan membuat job-nya tidak jalan — terhalang secara kasat mata, bukan
gagal senyap. Setelah merge, rule diperketat ke `main` saja.

Kegagalan senyap yang sebenarnya perlu diwaspadai berbeda: job yang lupa
menulis `environment: app-distribution`, nama environment yang salah tulis,
atau secret yang belum dibuat. Ketiganya menghasilkan string kosong tanpa
peringatan apa pun — "If a secret has not been set, the return value of an
expression referencing the secret will be an empty string." Karena itu nama
environment di GitHub harus persis `app-distribution`.

## Di luar lingkup

- iOS. Butuh Apple Developer account, signing cert, dan runner macOS.
- AAB / submission ke Play Store. App Distribution menerima APK, dan AAB
  akan menarik ketergantungan ke integrasi Play.
- Firebase SDK di dalam app (`google-services.json`). Upload ke App
  Distribution tidak memerlukannya; ia baru perlu kalau nanti mau in-app
  update atau feedback tester.
- Auto-bump versi di `package.json`. Ditolak karena membuat CI menulis ke
  `main`, yang berbenturan dengan branch protection.

## Risiko

| Risiko | Penanganan |
| --- | --- |
| Template Expo berubah di SDK berikutnya, anchor tidak ketemu | Transformasi melempar error, jadi build gagal keras alih-alih menghasilkan APK debug-signed secara diam-diam |
| Keystore hilang | Keystore adalah satu-satunya jalan update app di device tester (dan nanti di Play Store). Harus di-backup di luar GitHub |
| Keystore ter-commit tidak sengaja | `.gitignore` memblokir `*.jks` tapi **tidak** `*.keystore`, padahal `keytool` lazim dipakai dengan nama `release.keystore`. Implementasi harus menambahkan `*.keystore` ke `.gitignore` |
| Waktu build CI lama karena prebuild dari nol tiap run | Cache npm dan Gradle diaktifkan; arsitektur dipersempit ke dua |

## Yang perlu dikerjakan manual oleh pemilik repo

Tidak bisa diotomatiskan dari sisi kode:

1. Buat project Firebase, lalu daftarkan app Android dengan package name
   **persis** `com.primestrider.rnexpoboilerplate` (nilai ini
   case-sensitive dan tidak bisa diubah setelah app terdaftar). Catat App
   ID-nya dari General Settings. Tawaran download `google-services.json` dan
   pemasangan SDK bisa dilewati — upload ke App Distribution tidak
   memerlukan keduanya.
2. Aktifkan App Distribution di konsol. Enable "Firebase App Distribution
   API" di Google APIs console **tidak** perlu dilakukan untuk app yang
   dibuat setelah 20 September 2019.
3. Buat service account dengan role Firebase App Distribution Admin, unduh
   JSON-nya. Role menempel pada service account, bukan pada file kunci, jadi
   role yang ditambahkan setelah kunci dibuat tetap berlaku tanpa perlu
   generate kunci baru.
4. Buat grup tester di App Distribution, catat aliasnya.
5. Generate keystore release **di folder di luar repo** — `.gitignore` saat
   ini memblokir `*.jks` tapi tidak `*.keystore`, jadi menyimpannya di luar
   repo menghilangkan risiko ter-commit sepenuhnya:

   ```
   keytool -genkeypair -v -keystore release.keystore -alias upload \
     -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12
   ```

   lalu base64-kan langsung ke clipboard (PowerShell, karena pemilik repo di
   Windows) sehingga tidak ada file perantara yang tertinggal di disk:

   ```powershell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes("$HOME\keystores\release.keystore")) |
     Set-Clipboard
   ```

6. Buat environment `app-distribution` di GitHub, isi environment secrets dan
   repository variables sesuai tabel Komponen 4, dan set deployment branch
   rules ke `main` + `feat/auto-deploy`.
