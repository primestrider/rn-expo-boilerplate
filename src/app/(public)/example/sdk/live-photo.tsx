import * as ImagePicker from "expo-image-picker";
import {
  LivePhotoView,
  type LivePhotoAsset,
  type LivePhotoViewType,
} from "expo-live-photo";
import { Stack } from "expo-router";
import { useRef, useState } from "react";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import { Button, Column, NativeHost, Row, Switch } from "@/shared/native-ui";
import { useStyles, view } from "@/styles";

/**
 * expo-live-photo plays iOS Live Photos — the still plus its paired video —
 * picked with expo-image-picker's `livePhotos` media type. Live Photos exist
 * only on iOS; elsewhere the page says so.
 */
export default function LivePhotoExample() {
  const styles = useStyles();
  const player = useRef<LivePhotoViewType>(null);

  const [source, setSource] = useState<LivePhotoAsset | null>(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!LivePhotoView.isAvailable()) {
    return (
      <>
        <Stack.Screen options={{ title: "Live Photo" }} />
        <Screen>
          <Alert
            variant="info"
            title="Live Photos are an iOS feature"
            description="Open this example on an iPhone or iPad to try it."
          />
        </Screen>
      </>
    );
  }

  const pick = async () => {
    setError(null);
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["livePhotos"],
    });
    if (result.canceled) return;

    const [asset] = result.assets;
    const pairedVideoUri = asset.pairedVideoAsset?.uri;
    if (!pairedVideoUri) {
      setError("That photo is not a Live Photo.");
      return;
    }
    setSource({ photoUri: asset.uri, pairedVideoUri });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Live Photo" }} />
      <Screen>
        <Section
          title="Live Photo"
          description="Press and hold the photo, or use the buttons"
          utilities={["LivePhotoView", "startPlayback", "isMuted", "livePhotos"]}
        >
          {source ? (
            <LivePhotoView
              ref={player}
              source={source}
              isMuted={muted}
              contentFit="cover"
              style={view(styles.roundedXl, styles.overflowHidden, { height: 320 })}
              onPlaybackStart={() => setPlaying(true)}
              onPlaybackStop={() => setPlaying(false)}
              onLoadError={({ message }) => setError(message)}
            />
          ) : null}

          <NativeHost matchContents={{ vertical: true }} style={{ marginTop: 12 }}>
            <Column spacing={12}>
              <Switch value={muted} onValueChange={setMuted} label="Muted" />
              <Button label="Pick Live Photo" variant="outlined" onPress={pick} />
              <Row spacing={8}>
                <Button
                  label="Play"
                  disabled={!source}
                  onPress={() => player.current?.startPlayback("full")}
                />
                <Button
                  label="Hint"
                  variant="text"
                  disabled={!source}
                  onPress={() => player.current?.startPlayback("hint")}
                />
              </Row>
            </Column>
          </NativeHost>

          {error ? <Alert variant="error" title={error} style={styles.mt3} /> : null}
          {source ? (
            <InfoRows rows={[["Playback", playing ? "Playing" : "Stopped"]]} />
          ) : null}
        </Section>
      </Screen>
    </>
  );
}
