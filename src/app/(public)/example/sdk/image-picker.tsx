import * as DocumentPicker from "expo-document-picker";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  Slider,
  Switch,
} from "@/shared/native-ui";
import { useStyles, view } from "@/styles";
import { radii } from "@/styles/tokens";

type Source = "images" | "videos";
type DocType = "*/*" | "application/pdf" | "image/*";

const formatSize = (bytes?: number | null) =>
  bytes ? `${(bytes / 1024).toFixed(1)} KB` : null;

/**
 * expo-image-picker for profile photos and KYC selfies, expo-document-picker
 * for statements and PDFs — the two upload paths a super app needs.
 */
export default function PickerExample() {
  const styles = useStyles();

  const [source, setSource] = useState<Source>("images");
  const [editing, setEditing] = useState(true);
  const [multiple, setMultiple] = useState(false);
  const [quality, setQuality] = useState(0.8);
  const [media, setMedia] = useState<ImagePicker.ImagePickerAsset[]>([]);

  const [docType, setDocType] = useState<DocType>("*/*");
  const [documents, setDocuments] = useState<DocumentPicker.DocumentPickerAsset[]>([]);
  const [error, setError] = useState<string | null>(null);

  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: source,
    // Cropping only applies to a single image.
    allowsEditing: editing && !multiple,
    allowsMultipleSelection: multiple,
    aspect: [1, 1],
    quality,
  };

  const pickFromLibrary = async () => {
    const result = await ImagePicker.launchImageLibraryAsync(options);
    if (!result.canceled) setMedia(result.assets);
  };

  // The library picker needs no permission on modern OSes; the camera does.
  const takeWithCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      setError("Camera permission was denied.");
      return;
    }
    setError(null);
    const result = await ImagePicker.launchCameraAsync(options);
    if (!result.canceled) setMedia(result.assets);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: docType,
      multiple: true,
      copyToCacheDirectory: true,
    });
    if (!result.canceled) setDocuments(result.assets);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Image & Document Picker" }} />
      <Screen>
        <Section
          title="Image Picker"
          description="Photo library or camera, with native crop and compression"
          utilities={[
            "launchImageLibraryAsync",
            "launchCameraAsync",
            "allowsEditing",
            "quality",
          ]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Picker
                selectedValue={source}
                onValueChange={(value) => setSource(value as Source)}
              >
                <Picker.Item label="Images" value="images" />
                <Picker.Item label="Videos" value="videos" />
              </Picker>
              <Switch
                value={editing}
                onValueChange={setEditing}
                label="Crop (square)"
                disabled={multiple}
              />
              <Switch
                value={multiple}
                onValueChange={setMultiple}
                label="Multiple selection"
              />
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={0.1}
                max={1}
                step={0.1}
              />
              <Row spacing={8}>
                <Button label="Library" onPress={pickFromLibrary} />
                <Button
                  label="Camera"
                  variant="outlined"
                  onPress={takeWithCamera}
                />
              </Row>
            </Column>
          </NativeHost>

          {error ? (
            <Alert variant="error" title={error} style={styles.mt3} />
          ) : null}

          {media.length > 0 ? (
            <View
              style={view(styles.flexRow, styles.flexWrap, styles.gap2, styles.mt4)}
            >
              {media.map((asset) => (
                <Image
                  key={asset.uri}
                  source={asset.uri}
                  style={{ width: 104, height: 104, borderRadius: radii.xl }}
                  contentFit="cover"
                />
              ))}
            </View>
          ) : null}

          {media[0] ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  ["Type", media[0].type],
                  ["Size", `${media[0].width} × ${media[0].height}`],
                  ["File", formatSize(media[0].fileSize)],
                  ["MIME", media[0].mimeType],
                ]}
              />
            </View>
          ) : null}
        </Section>

        <Section
          title="Document Picker"
          description="Any file from the system picker, filtered by MIME type"
          utilities={["getDocumentAsync", "type", "multiple"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Picker
                selectedValue={docType}
                onValueChange={(value) => setDocType(value as DocType)}
              >
                <Picker.Item label="Any file" value="*/*" />
                <Picker.Item label="PDF" value="application/pdf" />
                <Picker.Item label="Images" value="image/*" />
              </Picker>
              <Button label="Choose files" onPress={pickDocument} />
            </Column>
          </NativeHost>

          {documents.length > 0 ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={documents.map((doc) => [doc.name, formatSize(doc.size)])}
              />
            </View>
          ) : null}
        </Section>
      </Screen>
    </>
  );
}
