import { withAppBuildGradle } from "expo/config-plugins";
import type { ConfigPlugin } from "expo/config-plugins";

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
