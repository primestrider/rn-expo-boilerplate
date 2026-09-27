import { useEvent, type PermissionResponse } from "expo";
import {
  getRecordingPermissionsAsync,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
} from "expo-audio";
import { Stack } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { InfoRows, PermissionGate, Section } from "@/features/example/components";
import { Screen } from "@/shared/components";
import { Button, NativeHost, Row } from "@/shared/native-ui";
import { useStyles, view } from "@/styles";

// Sample clip from the expo-video docs.
const PROMO_VIDEO =
  "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4";

const clock = (seconds: number) => {
  const whole = Math.max(0, Math.floor(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

/**
 * expo-audio records and plays back a chat voice note; expo-video plays a
 * looping promo banner with picture-in-picture.
 */
export default function MediaExample() {
  const styles = useStyles();

  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [voiceNote, setVoiceNote] = useState<string | null>(null);

  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recording = useAudioRecorderState(recorder);
  const player = useAudioPlayer(null);
  const playback = useAudioPlayerStatus(player);

  const video = useVideoPlayer(PROMO_VIDEO, (p) => {
    p.loop = true;
    p.muted = true;
  });
  const { isPlaying } = useEvent(video, "playingChange", {
    isPlaying: video.playing,
  });

  useEffect(() => {
    getRecordingPermissionsAsync().then(setPermission);
  }, []);

  const startRecording = async () => {
    // iOS only records once the audio session allows it.
    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
  };

  const stopRecording = async () => {
    await recorder.stop();
    await setAudioModeAsync({ allowsRecording: false });
    if (recorder.uri) {
      setVoiceNote(recorder.uri);
      player.replace({ uri: recorder.uri });
    }
  };

  const togglePlayback = async () => {
    if (playback.playing) {
      player.pause();
      return;
    }
    // A finished note starts again from the top.
    if (playback.duration > 0 && playback.currentTime >= playback.duration) {
      await player.seekTo(0);
    }
    player.play();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Audio & Video" }} />
      <Screen>
        <PermissionGate
          permission={permission}
          onRequest={async () => setPermission(await requestRecordingPermissionsAsync())}
          reason="Microphone access is needed to record voice notes."
        >
          <Section
            title="Voice note"
            description="Record, stop, then play it back"
            utilities={[
              "useAudioRecorder",
              "useAudioRecorderState",
              "useAudioPlayer",
              "setAudioModeAsync",
            ]}
          >
            <NativeHost matchContents>
              <Row spacing={8}>
                {recording.isRecording ? (
                  <Button label="Stop" onPress={stopRecording} />
                ) : (
                  <Button label="Record" onPress={startRecording} />
                )}
                <Button
                  label={playback.playing ? "Pause" : "Play"}
                  variant="outlined"
                  disabled={!voiceNote || recording.isRecording}
                  onPress={togglePlayback}
                />
              </Row>
            </NativeHost>
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  [
                    "Recording",
                    recording.isRecording
                      ? clock(recording.durationMillis / 1000)
                      : "Idle",
                  ],
                  [
                    "Playback",
                    voiceNote
                      ? `${clock(playback.currentTime)} / ${clock(playback.duration)}`
                      : null,
                  ],
                ]}
              />
            </View>
          </Section>
        </PermissionGate>

        <Section
          title="Promo video"
          description="Muted, looping banner; picture-in-picture where supported"
          utilities={["useVideoPlayer", "VideoView", "playingChange"]}
        >
          <View style={view(styles.roundedXl, styles.overflowHidden, { height: 200 })}>
            <VideoView
              player={video}
              style={styles.flex1}
              contentFit="cover"
              nativeControls={false}
              allowsPictureInPicture
            />
          </View>
          <NativeHost matchContents style={{ marginTop: 12 }}>
            <Button
              label={isPlaying ? "Pause video" : "Play video"}
              onPress={() => (isPlaying ? video.pause() : video.play())}
            />
          </NativeHost>
        </Section>
      </Screen>
    </>
  );
}
