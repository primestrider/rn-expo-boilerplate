import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
  type CameraType,
  type FlashMode,
} from "expo-camera";
import { Image } from "expo-image";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";

import { PermissionGate, Section } from "@/features/example/components";
import { AppText, BottomSheet, Screen } from "@/shared/components";
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

type Mode = "photo" | "scan";

/**
 * expo-camera: one `CameraView` switched between taking photos and scanning
 * QR codes (the "scan to pay" entry point of most super apps). Every control
 * around the preview is `@expo/ui`.
 */
export default function CameraExample() {
  const styles = useStyles();
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);

  const [mode, setMode] = useState<Mode>("scan");
  const [facing, setFacing] = useState<CameraType>("back");
  const [flash, setFlash] = useState<FlashMode>("off");
  const [torch, setTorch] = useState(false);
  const [zoom, setZoom] = useState(0);
  const [ready, setReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [scanned, setScanned] = useState<BarcodeScanningResult | null>(null);

  const takePicture = async () => {
    const result = await camera.current?.takePictureAsync({ quality: 0.7 });
    if (result) setPhoto(result.uri);
  };

  return (
    <>
      <Stack.Screen options={{ title: "Camera & QR Scanner" }} />
      <Screen>
        <PermissionGate
          permission={permission}
          onRequest={requestPermission}
          reason="Camera access is needed to scan QR codes and take photos."
        >
          <Section
            title="Preview"
            description={
              mode === "scan"
                ? "Point at a QR code — the result opens in a sheet"
                : "Tap Capture to take a photo"
            }
            utilities={["CameraView", "facing", "flash", "enableTorch", "zoom"]}
          >
            <View
              style={view(styles.roundedXl, styles.overflowHidden, {
                height: 380,
              })}
            >
              <CameraView
                ref={camera}
                style={styles.flex1}
                facing={facing}
                flash={flash}
                enableTorch={torch}
                zoom={zoom}
                onCameraReady={() => setReady(true)}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
                // Unset while a result is showing, so one code fires once.
                onBarcodeScanned={
                  mode === "scan" && !scanned ? setScanned : undefined
                }
              />
            </View>
          </Section>

          <Section
            title="Controls"
            description="Native Picker, Switch, Slider and Button drive the camera"
            utilities={["mode", "takePictureAsync", "onBarcodeScanned"]}
          >
            <NativeHost matchContents={{ vertical: true }}>
              <Column spacing={12}>
                <Picker
                  selectedValue={mode}
                  onValueChange={(value) => setMode(value as Mode)}
                >
                  <Picker.Item label="Scan QR" value="scan" />
                  <Picker.Item label="Photo" value="photo" />
                </Picker>
                <Picker
                  selectedValue={flash}
                  onValueChange={(value) => setFlash(value as FlashMode)}
                >
                  <Picker.Item label="Flash off" value="off" />
                  <Picker.Item label="Flash on" value="on" />
                  <Picker.Item label="Flash auto" value="auto" />
                </Picker>
                <Switch value={torch} onValueChange={setTorch} label="Torch" />
                <Slider value={zoom} onValueChange={setZoom} min={0} max={1} />
                <Row spacing={8}>
                  <Button
                    label="Flip"
                    variant="outlined"
                    onPress={() =>
                      setFacing((f) => (f === "back" ? "front" : "back"))
                    }
                  />
                  {mode === "photo" ? (
                    <Button
                      label="Capture"
                      disabled={!ready}
                      onPress={takePicture}
                    />
                  ) : null}
                </Row>
              </Column>
            </NativeHost>
          </Section>

          {photo ? (
            <Section title="Last photo" utilities={["CameraCapturedPicture.uri"]}>
              <Image
                source={photo}
                style={{ height: 240, borderRadius: radii.xl }}
                contentFit="cover"
              />
            </Section>
          ) : null}

          <BottomSheet
            visible={scanned !== null}
            onClose={() => setScanned(null)}
            title="QR code scanned"
          >
            <View style={styles.gap2}>
              <AppText variant="mono" selectable>
                {scanned?.data}
              </AppText>
              <AppText variant="caption" color="muted">
                Close the sheet to scan again.
              </AppText>
            </View>
          </BottomSheet>
        </PermissionGate>
      </Screen>
    </>
  );
}
