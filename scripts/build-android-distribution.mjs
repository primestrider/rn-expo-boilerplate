import { execSync } from "node:child_process";
import { rmSync } from "node:fs";

const gradleCommand =
  process.platform === "win32" ? "gradlew.bat" : "./gradlew";

const run = (command, options = {}) => {
  execSync(command, {
    stdio: "inherit",
    ...options,
  });
};

console.log("\nCleaning Reanimated native build cache...\n");

rmSync("node_modules/react-native-reanimated/android/.cxx", {
  recursive: true,
  force: true,
});

rmSync("node_modules/react-native-reanimated/android/build", {
  recursive: true,
  force: true,
});

console.log("\nRegenerating Android native project...\n");

run("npx expo prebuild --clean --platform android");

console.log("\nBuilding Android release APK for arm64-v8a...\n");

run(`${gradleCommand} assembleRelease -PreactNativeArchitectures=arm64-v8a`, {
  cwd: "android",
});

console.log(
  "\nBuild successful!\n" +
    "APK: android/app/build/outputs/apk/release/app-release.apk\n",
);
