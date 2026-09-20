# Android → Firebase App Distribution Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Setiap merge ke `main` menghasilkan APK release yang tersigning dengan keystore asli dan otomatis terdistribusi ke grup tester di Firebase App Distribution.

**Architecture:** Signing dimasukkan lewat config plugin Expo (`configs/signing.config.ts`) karena `android/` di-gitignore dan di-regenerate `expo prebuild` setiap run CI, sehingga `build.gradle` tidak bisa ditambal permanen. Plugin diterapkan langsung di `app.config.ts`, bukan lewat array `plugins`, karena tipe `ExpoConfig["plugins"]` tidak menerima fungsi. GitHub Actions menjalankan prebuild → `assembleRelease` → upload via Firebase CLI resmi.

**Tech Stack:** Expo SDK 57, `@expo/config-plugins` (via `expo/config-plugins`), Gradle 9.3.1 + JDK 17, GitHub Actions, `firebase-tools` CLI, Jest + `jest-expo`.

**Spec:** `docs/superpowers/specs/2026-09-20-android-firebase-app-distribution-design.md`

## Global Constraints

- Package name Android: `com.primestrider.rnexpoboilerplate` (case-sensitive, permanen di Firebase).
- Node 20, JDK 17 Temurin (Gradle 9.3.1 minimal butuh JDK 17).
- Arsitektur build CI: `arm64-v8a,armeabi-v7a` saja — bukan empat seperti `scripts/build-android-release.mjs`.
- Environment GitHub: `app-distribution`. Job **wajib** mendeklarasikan `environment: app-distribution`, tanpa itu environment secrets tidak terlihat.
- Environment secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `FIREBASE_SERVICE_ACCOUNT_JSON`.
- Repository variables wajib: `FIREBASE_ANDROID_APP_ID`, `FIREBASE_TESTER_GROUPS`. Opsional: `EXPO_PUBLIC_APP_NAME`, `EXPO_PUBLIC_API_URL`.
- `ANDROID_KEYSTORE_PATH` harus **path absolut** — `file()` di `build.gradle` me-resolve path relatif terhadap `android/app`, bukan root repo.
- Tes hidup di `tests/` yang mencerminkan struktur sumber; `jest.config.js` membatasi `roots` ke `<rootDir>/tests`.
- Transformasi gradle harus **gagal berisik**. Kalau anchor tidak ditemukan dan ia diam-diam jadi no-op, CI menghasilkan APK debug-signed sementara kita menyangka release-signed — kegagalan paling berbahaya di seluruh pekerjaan ini.

---

### Task 1: Transformasi signing config di `build.gradle`

Inti pekerjaan. Fungsi transformasi string murni, dipisah dari pembungkus plugin supaya bisa diuji tanpa menjalankan prebuild.

**Files:**
- Create: `configs/signing.config.ts`
- Test: `tests/configs/signing.config.test.ts`

**Interfaces:**
- Consumes: `withAppBuildGradle` dan tipe `ConfigPlugin` dari `expo/config-plugins`. `config.modResults` bertipe `GradleProjectFile` = `{ path: string; language: 'groovy' | 'kt'; contents: string }`.
- Produces:
  - `addReleaseSigningConfig(contents: string): string` — transformasi murni, dipakai tes.
  - `withReleaseSigning: ConfigPlugin` — dipakai Task 2 di `app.config.ts`.

- [ ] **Step 1: Tulis tes yang gagal**

Buat `tests/configs/signing.config.test.ts`. Fixture-nya adalah potongan asli `android/app/build.gradle` hasil prebuild Expo SDK 57 — indentasi persis seperti file aslinya, karena transformasinya berbasis pencocokan string:

```ts
import {
  addReleaseSigningConfig,
} from "../../configs/signing.config";

const BUILD_GRADLE = `android {
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            // Caution! In production, you need to generate your own keystore file.
            // see https://reactnative.dev/docs/signed-apk-android.
            signingConfig signingConfigs.debug
            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'
            shrinkResources enableShrinkResources.toBoolean()
            minifyEnabled enableMinifyInReleaseBuilds
        }
    }
}`;

describe("addReleaseSigningConfig", () => {
  it("menambahkan signingConfig release yang membaca env", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(
      'storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")',
    );
    expect(result).toContain(
      'storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")',
    );
    expect(result).toContain('keyAlias System.getenv("ANDROID_KEY_ALIAS")');
    expect(result).toContain(
      'keyPassword System.getenv("ANDROID_KEY_PASSWORD")',
    );
  });

  it("membuat buildTypes.release memilih signing config secara kondisional", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(
      'signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug',
    );
  });

  it("tidak menyentuh buildTypes.debug", () => {
    const result = addReleaseSigningConfig(BUILD_GRADLE);

    expect(result).toContain(`        debug {
            signingConfig signingConfigs.debug
        }`);
  });

  it("idempoten — transformasi kedua tidak mengubah apa pun", () => {
    const once = addReleaseSigningConfig(BUILD_GRADLE);
    const twice = addReleaseSigningConfig(once);

    expect(twice).toBe(once);
  });

  it("melempar kalau blok signingConfigs.debug tidak ditemukan", () => {
    const withoutDebugBlock = BUILD_GRADLE.replace(
      "storeFile file('debug.keystore')",
      "storeFile file('other.keystore')",
    );

    expect(() => addReleaseSigningConfig(withoutDebugBlock)).toThrow(
      /signingConfigs.*debug.*tidak ditemukan/i,
    );
  });

  it("melempar kalau baris signing di buildTypes.release tidak ditemukan", () => {
    const withoutReleaseAnchor = BUILD_GRADLE.replace(
      "            def enableShrinkResources = findProperty('android.enableShrinkResourcesInReleaseBuilds') ?: 'false'",
      "            def somethingElse = true",
    );

    expect(() => addReleaseSigningConfig(withoutReleaseAnchor)).toThrow(
      /buildTypes.*release.*tidak ditemukan/i,
    );
  });
});
```

Dua tes terakhir adalah yang paling penting: keduanya menjaga sifat "gagal berisik". Tanpa keduanya, perubahan template Expo di SDK berikutnya akan menghasilkan APK debug-signed secara diam-diam.

- [ ] **Step 2: Jalankan tes, pastikan gagal**

Run: `npx jest tests/configs/signing.config.test.ts`
Expected: FAIL — `Cannot find module '../../configs/signing.config'`

- [ ] **Step 3: Tulis implementasinya**

Buat `configs/signing.config.ts`:

```ts
import { withAppBuildGradle, type ConfigPlugin } from "expo/config-plugins";

/**
 * Menyuntikkan signing config release ke `android/app/build.gradle`.
 *
 * `android/` di-gitignore dan di-regenerate `expo prebuild`, jadi signing
 * tidak bisa ditambal langsung di file itu — ia harus disisipkan ulang
 * setiap prebuild.
 */

const DEBUG_SIGNING_CONFIG = `        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }`;

const RELEASE_SIGNING_CONFIG = `
        release {
            storeFile file(System.getenv("ANDROID_KEYSTORE_PATH") ?: "release.keystore")
            storePassword System.getenv("ANDROID_KEYSTORE_PASSWORD")
            keyAlias System.getenv("ANDROID_KEY_ALIAS")
            keyPassword System.getenv("ANDROID_KEY_PASSWORD")
        }`;

/**
 * Teks `signingConfig signingConfigs.debug` muncul dua kali di build.gradle —
 * sekali di `buildTypes.debug`, sekali di `buildTypes.release`. Baris
 * berikutnya adalah satu-satunya pembeda, jadi anchor-nya dua baris.
 */
const RELEASE_BUILD_TYPE_ANCHOR = `            signingConfig signingConfigs.debug
            def enableShrinkResources`;

const RELEASE_BUILD_TYPE_REPLACEMENT = `            signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug
            def enableShrinkResources`;

const TEMPLATE_DRIFT_HINT =
  "Template Expo kemungkinan berubah. Perbarui anchor di configs/signing.config.ts — " +
  "jangan biarkan transformasi ini jadi no-op, karena hasilnya APK debug-signed yang tampak release.";

export function addReleaseSigningConfig(contents: string): string {
  // Sudah tertransformasi (mis. prebuild dijalankan dua kali tanpa --clean).
  if (contents.includes("signingConfigs.release")) {
    return contents;
  }

  if (!contents.includes(DEBUG_SIGNING_CONFIG)) {
    throw new Error(
      `Blok signingConfigs.debug tidak ditemukan di app/build.gradle. ${TEMPLATE_DRIFT_HINT}`,
    );
  }

  if (!contents.includes(RELEASE_BUILD_TYPE_ANCHOR)) {
    throw new Error(
      `Baris signing di buildTypes.release tidak ditemukan di app/build.gradle. ${TEMPLATE_DRIFT_HINT}`,
    );
  }

  return contents
    .replace(
      DEBUG_SIGNING_CONFIG,
      DEBUG_SIGNING_CONFIG + RELEASE_SIGNING_CONFIG,
    )
    .replace(RELEASE_BUILD_TYPE_ANCHOR, RELEASE_BUILD_TYPE_REPLACEMENT);
}

export const withReleaseSigning: ConfigPlugin = (config) =>
  withAppBuildGradle(config, (gradleConfig) => {
    if (gradleConfig.modResults.language !== "groovy") {
      throw new Error(
        `app/build.gradle memakai ${gradleConfig.modResults.language}, bukan groovy. ${TEMPLATE_DRIFT_HINT}`,
      );
    }

    gradleConfig.modResults.contents = addReleaseSigningConfig(
      gradleConfig.modResults.contents,
    );

    return gradleConfig;
  });
```

Kenapa Gradle memilih secara kondisional alih-alih selalu `signingConfigs.release`: tanpa env keystore, `npm run android` dan `npm run android:release` di laptop harus tetap jalan. Kondisional membuat build lokal jatuh ke debug key tanpa perlu keystore sama sekali.

- [ ] **Step 4: Jalankan tes, pastikan lulus**

Run: `npx jest tests/configs/signing.config.test.ts`
Expected: PASS, 6 tes.

- [ ] **Step 5: Jalankan lint dan typecheck**

Run: `npm run lint`
Run: `npx tsc --noEmit`
Expected: keduanya bersih. Kalau `tsc` mengeluh soal `type ConfigPlugin` pada import, pisahkan jadi `import type { ConfigPlugin } from "expo/config-plugins";`.

- [ ] **Step 6: Commit**

```bash
git add configs/signing.config.ts tests/configs/signing.config.test.ts
git commit -m "feat(android): sisipkan signing config release lewat config plugin"
```

---

### Task 2: Pasang plugin di `app.config.ts`

Task 1 membuat plugin-nya; task ini menyalakannya, lalu membuktikan ia benar-benar jalan lewat prebuild sungguhan — bukan cuma lewat unit test.

**Files:**
- Modify: `app.config.ts`

**Interfaces:**
- Consumes: `withReleaseSigning` dari Task 1.
- Produces: `app.config.ts` yang mengekspor config dengan mod gradle terpasang.

- [ ] **Step 1: Ubah `app.config.ts`**

Tambahkan import:

```ts
import { withReleaseSigning } from "./configs/signing.config";
```

Lalu ubah baris ekspor terakhir dari `export default config;` menjadi:

```ts
export default withReleaseSigning(config);
```

Plugin diterapkan langsung ke objek config, **bukan** ditambahkan ke array `plugins` di `configs/plugins.config.ts`. Alasannya tipe: `ExpoConfig["plugins"]` adalah `(string | [] | [string] | [string, any])[]`, yang tidak mencakup fungsi — itu sebabnya `plugins.config.ts` sudah harus menulis `fontPlugin as [string, any]`. Menerapkan langsung menghindari cast dan tetap lolos type-check, karena `ConfigPlugin` bertanda tangan `(config: ExpoConfig) => ExpoConfig`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: bersih, tanpa cast apa pun.

- [ ] **Step 3: Buktikan plugin jalan di prebuild nyata**

Run: `npx expo prebuild --platform android`

Lalu periksa hasilnya:

```bash
grep -n -A6 "signingConfigs" android/app/build.gradle
grep -n "ANDROID_KEYSTORE_PASSWORD" android/app/build.gradle
```

Expected: blok `release { ... }` ada di dalam `signingConfigs`, dan baris `signingConfig System.getenv("ANDROID_KEYSTORE_PASSWORD") ? signingConfigs.release : signingConfigs.debug` muncul di `buildTypes.release`.

Ini langkah yang tidak bisa dilewati. Unit test membuktikan fungsinya benar; hanya prebuild nyata yang membuktikan plugin-nya **terpasang**.

- [ ] **Step 4: Buktikan build lokal tidak rusak**

Run: `npm run android:release`
Expected: build sukses tanpa env keystore apa pun, menghasilkan `android/app/build/outputs/apk/release/app-release.apk` yang tersigning debug key. Ini membuktikan cabang kondisionalnya bekerja.

Kalau build ini gagal, jangan lanjut ke Task 3 — kegagalan di sini berarti sintaks Groovy yang disisipkan salah, dan CI akan gagal dengan cara yang lebih sulit dibaca.

- [ ] **Step 5: Jalankan seluruh test suite**

Run: `npm test`
Expected: seluruh suite lulus, tidak ada regresi dari perubahan `app.config.ts`.

- [ ] **Step 6: Commit**

```bash
git add app.config.ts
git commit -m "feat(android): terapkan plugin signing release di app config"
```

---

### Task 3: Workflow GitHub Actions

**Files:**
- Create: `.github/workflows/deploy-android.yml`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Consumes: env var yang dibaca `configs/signing.config.ts` (`ANDROID_KEYSTORE_PATH`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`).
- Produces: APK di `android/app/build/outputs/apk/release/app-release.apk`, terdistribusi ke App Distribution.

- [ ] **Step 1: Verifikasi nama flag Firebase CLI**

Run: `npx --yes firebase-tools appdistribution:distribute --help`

Konfirmasi flag `--app`, `--groups`, dan `--release-notes` benar-benar ada, lalu catat versi yang terpasang:

Run: `npx --yes firebase-tools --version`

Dokumentasi Firebase mengonfirmasi `--app`, `--release-notes`, dan `--release-notes-file` secara verbatim, tapi `--groups` datang dari ringkasan halaman yang terpotong — **jangan lewati langkah ini.** Kalau nama flag berbeda, sesuaikan di Step 3. Versi yang tercatat dipakai untuk pinning, supaya perubahan besar di upstream tidak mendadak mematahkan pipeline.

- [ ] **Step 2: Tambahkan `*.keystore` ke `.gitignore`**

Di bagian `# Native`, ubah:

```
*.jks
```

menjadi:

```
*.jks
*.keystore
```

`.gitignore` memblokir `*.jks` tapi tidak `*.keystore`, padahal `keytool` lazim dipakai dengan nama `release.keystore`. Tanpa baris ini, keystore yang kebetulan ada di dalam repo bisa ter-commit — dan keystore yang bocor tidak bisa dicabut.

- [ ] **Step 3: Buat workflow-nya**

Buat `.github/workflows/deploy-android.yml`.

Di step terakhir ada `firebase-tools@<MAJOR>`. Ganti `<MAJOR>` dengan angka major version yang Anda catat di Step 1 — misalnya kalau `--version` mencetak `14.2.0`, tulis `firebase-tools@14`. Membiarkannya tidak tergantikan akan membuat step itu gagal dengan error "invalid package name", jadi kegagalannya kelihatan, bukan senyap.

```yaml
name: Distribute Android

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
    timeout-minutes: 45

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: 17

      # Jangan pakai `cache: gradle` di setup-java: ia mencari **/*.gradle*
      # saat checkout, sementara android/ di-gitignore dan baru ada setelah
      # prebuild — hasilnya job gagal sebelum sempat apa pun.
      - name: Cache Gradle
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: gradle-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
          restore-keys: |
            gradle-${{ runner.os }}-

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Decode release keystore
        env:
          ANDROID_KEYSTORE_BASE64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
        run: |
          echo "$ANDROID_KEYSTORE_BASE64" | base64 -d > "$RUNNER_TEMP/release.keystore"
          echo "ANDROID_KEYSTORE_PATH=$RUNNER_TEMP/release.keystore" >> "$GITHUB_ENV"

      - name: Write Firebase service account
        env:
          FIREBASE_SERVICE_ACCOUNT_JSON: ${{ secrets.FIREBASE_SERVICE_ACCOUNT_JSON }}
        run: |
          printf '%s' "$FIREBASE_SERVICE_ACCOUNT_JSON" > "$RUNNER_TEMP/firebase-service-account.json"
          echo "GOOGLE_APPLICATION_CREDENTIALS=$RUNNER_TEMP/firebase-service-account.json" >> "$GITHUB_ENV"

      - name: Prebuild Android project
        env:
          EXPO_PUBLIC_APP_NAME: ${{ vars.EXPO_PUBLIC_APP_NAME }}
          EXPO_PUBLIC_API_URL: ${{ vars.EXPO_PUBLIC_API_URL }}
        run: npx expo prebuild --platform android --no-install

      - name: Build release APK
        working-directory: android
        env:
          NODE_ENV: production
          ANDROID_KEYSTORE_PASSWORD: ${{ secrets.ANDROID_KEYSTORE_PASSWORD }}
          ANDROID_KEY_ALIAS: ${{ secrets.ANDROID_KEY_ALIAS }}
          ANDROID_KEY_PASSWORD: ${{ secrets.ANDROID_KEY_PASSWORD }}
          EXPO_PUBLIC_APP_NAME: ${{ vars.EXPO_PUBLIC_APP_NAME }}
          EXPO_PUBLIC_API_URL: ${{ vars.EXPO_PUBLIC_API_URL }}
        run: ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a,armeabi-v7a

      - name: Verify APK is signed with the release key
        run: |
          APKSIGNER="$(find "$ANDROID_HOME/build-tools" -name apksigner | sort -r | head -1)"
          "$APKSIGNER" verify --print-certs \
            android/app/build/outputs/apk/release/app-release.apk | tee certs.txt
          if grep -qi "CN=Android Debug" certs.txt; then
            echo "::error::APK tersigning debug key, bukan release key."
            exit 1
          fi

      - name: Upload APK artifact
        uses: actions/upload-artifact@v4
        with:
          name: app-release-apk
          path: android/app/build/outputs/apk/release/app-release.apk
          if-no-files-found: error

      - name: Distribute to Firebase App Distribution
        env:
          FIREBASE_ANDROID_APP_ID: ${{ vars.FIREBASE_ANDROID_APP_ID }}
          FIREBASE_TESTER_GROUPS: ${{ vars.FIREBASE_TESTER_GROUPS }}
        run: |
          RELEASE_NOTES="$(git log -1 --pretty=%s) (#${{ github.run_number }} ${GITHUB_SHA::7})"
          npx --yes firebase-tools@<MAJOR> appdistribution:distribute \
            android/app/build/outputs/apk/release/app-release.apk \
            --app "$FIREBASE_ANDROID_APP_ID" \
            --groups "$FIREBASE_TESTER_GROUPS" \
            --release-notes "$RELEASE_NOTES"
```

Empat keputusan yang perlu dipahami, bukan sekadar disalin:

1. **`environment: app-distribution`** — tanpa baris ini environment secrets tidak terlihat dan semua variabel terbaca kosong, dengan gejala yang menyesatkan (bukan error "akses ditolak").
2. **Step "Verify APK is signed with the release key"** melampaui spec, dan sengaja. Ia menutup satu-satunya kegagalan senyap yang tersisa: kalau karena sebab apa pun Gradle memilih debug key, pipeline berhenti alih-alih mengirim APK yang salah ke tester. Keputusan mana yang dipakai Gradle terjadi di runtime, jadi hanya pemeriksaan runtime yang bisa membuktikannya.
3. **Step "Run tests"** juga tambahan di luar spec: build Android makan belasan menit, jadi menjalankan suite lebih dulu lebih murah daripada mendistribusikan build yang tesnya merah.
4. **Upload artifact sebelum step Firebase** supaya APK tetap bisa diambil manual kalau upload Firebase gagal.

- [ ] **Step 4: Validasi sintaks YAML**

Run: `npx --yes js-yaml .github/workflows/deploy-android.yml > /dev/null && echo "YAML valid"`
Expected: `YAML valid`. Sintaks yang salah membuat workflow tidak muncul sama sekali di tab Actions, tanpa pesan error.

- [ ] **Step 5: Dokumentasikan di README**

Tambahkan satu bagian di `README.md`:

````markdown
## Distribusi Android otomatis

Merge ke `main` memicu `.github/workflows/deploy-android.yml`: prebuild →
`assembleRelease` → upload ke Firebase App Distribution. Bisa juga dijalankan
manual lewat **Actions → Distribute Android → Run workflow**.

### Konfigurasi sekali jalan

Environment secrets di environment `app-distribution`:

| Secret | Isi |
| --- | --- |
| `ANDROID_KEYSTORE_BASE64` | keystore release, di-base64 |
| `ANDROID_KEYSTORE_PASSWORD` | password keystore |
| `ANDROID_KEY_ALIAS` | alias key |
| `ANDROID_KEY_PASSWORD` | password key |
| `FIREBASE_SERVICE_ACCOUNT_JSON` | service account dengan role Firebase App Distribution Admin |

Repository variables:

| Variable | Wajib | Isi |
| --- | --- | --- |
| `FIREBASE_ANDROID_APP_ID` | ya | format `1:123:android:abc` |
| `FIREBASE_TESTER_GROUPS` | ya | alias grup tester, dipisah koma |
| `EXPO_PUBLIC_APP_NAME` | tidak | `app.config.ts` punya fallback ke nama di `package.json` |
| `EXPO_PUBLIC_API_URL` | tidak | `baseURL` axios; fitur example jalan tanpa ini |

Deployment branch rules environment dibatasi ke `main`.

### Membuat keystore release

Buat di folder **di luar repo**, lalu backup di luar GitHub — keystore yang
hilang berarti tester harus uninstall sebelum bisa menerima update lagi.

```
keytool -genkeypair -v -keystore release.keystore -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000 -storetype PKCS12
```

Signing di CI masuk lewat `configs/signing.config.ts`, bukan lewat
`android/app/build.gradle` — folder `android/` di-gitignore dan di-regenerate
setiap prebuild, jadi perubahan langsung di sana akan hilang. Tanpa env
keystore, build lokal otomatis jatuh ke debug key.
````

- [ ] **Step 6: Commit**

```bash
git add .github/workflows/deploy-android.yml .gitignore README.md
git commit -m "feat(ci): distribusikan APK release ke Firebase App Distribution"
```

---

### Task 4: Verifikasi end-to-end lalu merge

Tidak ada kode di task ini. Isinya bukti bahwa pipeline-nya benar-benar jalan — dan tanpa bukti ini, merge ke `main` berarti mengandalkan trigger yang belum pernah terbukti.

**Files:** tidak ada.

**Interfaces:**
- Consumes: workflow dari Task 3, plus konfigurasi Firebase/GitHub yang sudah disiapkan pemilik repo.

- [ ] **Step 1: Pastikan branch rule mengizinkan branch ini**

Settings → Environments → `app-distribution` → Deployment branches and tags. Kalau sudah diset ke *Selected branches and tags*, daftarnya harus memuat `main` **dan** `feat/auto-deploy`. Kalau masih pada default *All branches*, biarkan — tidak ada yang perlu diubah sampai merge selesai.

Deployment branches adalah protection rule, dan menurut dokumentasi GitHub "the job won't start until all of the environment's protection rules pass". Jadi branch yang tidak diizinkan membuat job tidak jalan sama sekali — terhalang secara kasat mata, bukan gagal senyap.

Kegagalan senyap yang justru perlu diwaspadai: nama environment di GitHub harus persis `app-distribution`. Salah tulis satu huruf, atau job yang lupa mendeklarasikan `environment:`, membuat setiap secret terbaca sebagai string kosong tanpa peringatan apa pun.

- [ ] **Step 2: Push branch**

```bash
git push -u origin feat/auto-deploy
```

- [ ] **Step 3: Jalankan workflow manual**

Actions → **Distribute Android** → Run workflow → pilih branch `feat/auto-deploy`.

- [ ] **Step 4: Periksa hasilnya**

Yang harus benar semuanya:

- Job selesai hijau.
- Step "Verify APK is signed with the release key" lulus, dan sertifikat yang tercetak **bukan** `CN=Android Debug`.
- Rilis baru muncul di Firebase Console → App Distribution, dengan release notes berisi subject commit + nomor run + SHA pendek.
- Tester di grup menerima notifikasi.

Kalau step signing gagal, jangan tambal dengan melewati pemeriksaannya — ia sedang melaporkan hal yang memang harus menghentikan pipeline.

- [ ] **Step 5: Merge ke `main`**

Buka PR dari `feat/auto-deploy` ke `main`, lalu merge. Push ke `main` akan memicu workflow sekali lagi — ini sekaligus bukti bahwa trigger `push: main` bekerja, bukan cuma `workflow_dispatch`.

- [ ] **Step 6: Perketat branch rule**

Settings → Environments → `app-distribution` → hapus `feat/auto-deploy` dari deployment branches, sehingga tinggal `main`.

Langkah ini mudah terlupa dan menjadi alasan environment itu dibuat sejak awal. Selama `feat/auto-deploy` masih terdaftar, branch mana pun dengan nama itu bisa memakai keystore.

---

## Catatan untuk pelaksana

- Jangan pernah menambal `android/app/build.gradle` langsung. Folder itu di-gitignore dan di-regenerate; satu-satunya tempat yang bertahan adalah `configs/signing.config.ts`.
- Kalau transformasi gradle melempar error setelah upgrade SDK, itu perilaku yang diinginkan. Perbaiki anchor-nya di `configs/signing.config.ts` dan tambahkan tes untuk bentuk template yang baru — jangan melemahkan pemeriksaannya menjadi no-op.
- `scripts/build-android-release.mjs` dibiarkan apa adanya. Ia untuk laptop (deteksi `gradlew.bat`, keempat arsitektur); CI memanggil Gradle langsung supaya log-nya lebih mudah dibaca dan build-nya lebih cepat.
