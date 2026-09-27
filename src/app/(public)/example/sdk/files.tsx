import { Directory, File, Paths } from "expo-file-system";
import { Image } from "expo-image";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, AppText, Screen } from "@/shared/components";
import { formatFileSize } from "@/shared/helpers";
import {
  Button,
  Column,
  NativeHost,
  Row,
  Slider,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";
import { radii } from "@/styles/tokens";

// A small public PDF, stand-in for a statement or ticket download.
const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

type Photo = { uri: string; width: number; height: number; size: number | null };

const sizeOf = (uri: string) => {
  try {
    return new File(uri).size;
  } catch {
    return null;
  }
};

/**
 * expo-image-manipulator shrinks a KYC photo before upload (most APIs cap at
 * 1–2 MB); expo-file-system downloads files into the cache and manages them.
 */
export default function FilesExample() {
  const styles = useStyles();
  const downloads = new Directory(Paths.cache, "downloads");

  const [original, setOriginal] = useState<Photo | null>(null);
  const [compressed, setCompressed] = useState<Photo | null>(null);
  const [maxWidth, setMaxWidth] = useState(1080);
  const [quality, setQuality] = useState(0.6);
  const [files, setFiles] = useState<{ name: string; size: number | null }[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refreshFiles = () =>
    setFiles(
      downloads.exists
        ? downloads.list().map((entry) => ({
            name: entry.name,
            size: entry instanceof File ? entry.size : null,
          }))
        : [],
    );

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      quality: 1,
    });
    if (result.canceled) return;
    const [asset] = result.assets;
    setOriginal({
      uri: asset.uri,
      width: asset.width,
      height: asset.height,
      size: asset.fileSize ?? sizeOf(asset.uri),
    });
    setCompressed(null);
  };

  const compress = async () => {
    if (!original) return;
    const context = ImageManipulator.manipulate(original.uri);
    // Only ever scale down; a small photo keeps its size.
    if (original.width > maxWidth) context.resize({ width: maxWidth });
    const rendered = await context.renderAsync();
    const saved = await rendered.saveAsync({
      compress: quality,
      format: SaveFormat.JPEG,
    });
    setCompressed({ ...saved, size: sizeOf(saved.uri) });
  };

  const download = async () => {
    setError(null);
    try {
      downloads.create({ idempotent: true, intermediates: true });
      await File.downloadFileAsync(SAMPLE_PDF, downloads, { idempotent: true });
      refreshFiles();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Download failed.");
    }
  };

  const clearDownloads = () => {
    if (downloads.exists) downloads.delete();
    refreshFiles();
  };

  const saving =
    original?.size && compressed?.size
      ? `${Math.round((1 - compressed.size / original.size) * 100)}% smaller`
      : null;

  return (
    <>
      <Stack.Screen options={{ title: "Image Manipulator & Files" }} />
      <Screen>
        <Section
          title="Compress before upload"
          description="Resize to a max width and re-encode as JPEG"
          utilities={["ImageManipulator.manipulate", "resize", "saveAsync"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Slider
                value={maxWidth}
                onValueChange={setMaxWidth}
                min={480}
                max={1920}
                step={120}
              />
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={0.1}
                max={1}
                step={0.1}
              />
              <Row spacing={8}>
                <Button label="Pick photo" variant="outlined" onPress={pickPhoto} />
                <Button label="Compress" disabled={!original} onPress={compress} />
              </Row>
            </Column>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            Max width {Math.round(maxWidth)}px · Quality {quality.toFixed(1)}
          </AppText>

          {compressed ? (
            <Image
              source={compressed.uri}
              style={{ height: 200, borderRadius: radii.xl, marginTop: 12 }}
              contentFit="contain"
            />
          ) : null}

          {original ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  ["Original", `${original.width} × ${original.height}`],
                  ["Original size", original.size && formatFileSize(original.size)],
                  ["Compressed", compressed && `${compressed.width} × ${compressed.height}`],
                  ["Compressed size", compressed?.size && formatFileSize(compressed.size)],
                  ["Saving", saving],
                ]}
              />
            </View>
          ) : null}
        </Section>

        <Section
          title="Downloads"
          description="Saved under the cache directory, which the OS may purge"
          utilities={["File.downloadFileAsync", "Directory", "Paths.cache"]}
        >
          <NativeHost matchContents>
            <Row spacing={8}>
              <Button label="Download PDF" onPress={download} />
              <Button label="Clear" variant="text" onPress={clearDownloads} />
            </Row>
          </NativeHost>
          {error ? (
            <Alert variant="error" title={error} style={styles.mt3} />
          ) : null}
          <View style={styles.mt3}>
            {files.length === 0 ? (
              <AppText color="muted">No downloaded files.</AppText>
            ) : (
              <InfoRows
                rows={files.map((file) => [
                  file.name,
                  file.size === null ? null : formatFileSize(file.size),
                ])}
              />
            )}
          </View>
        </Section>
      </Screen>
    </>
  );
}
