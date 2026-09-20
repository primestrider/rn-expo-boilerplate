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
