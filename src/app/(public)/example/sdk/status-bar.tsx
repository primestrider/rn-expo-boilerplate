import { Stack } from "expo-router";
import {
  StatusBar,
  type StatusBarAnimation,
  type StatusBarStyle,
} from "expo-status-bar";
import { useState } from "react";

import { Section } from "@/features/example/components";
import { AppText, Screen } from "@/shared/components";
import { Column, NativeHost, Picker, Switch } from "@/shared/native-ui";
import { useStyles } from "@/styles";

/**
 * expo-status-bar: the root layout sets a themed bar for the whole app. A
 * screen that renders its own `StatusBar` overrides it while mounted — e.g.
 * light icons over a dark camera or video — and the root one returns when
 * the screen closes.
 */
export default function StatusBarExample() {
  const styles = useStyles();

  const [style, setStyle] = useState<StatusBarStyle>("auto");
  const [hidden, setHidden] = useState(false);
  const [animation, setAnimation] = useState<StatusBarAnimation>("fade");

  return (
    <>
      <Stack.Screen options={{ title: "Status Bar" }} />
      <StatusBar
        style={style}
        hidden={hidden}
        animated
        hideTransitionAnimation={animation}
      />
      <Screen>
        <Section
          title="Status bar"
          description="Changes apply to this screen only"
          utilities={["StatusBar", "style", "hidden", "hideTransitionAnimation"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Picker
                selectedValue={style}
                onValueChange={(value) => setStyle(value as StatusBarStyle)}
              >
                <Picker.Item label="Auto (follows theme)" value="auto" />
                <Picker.Item label="Light icons" value="light" />
                <Picker.Item label="Dark icons" value="dark" />
                <Picker.Item label="Inverted" value="inverted" />
              </Picker>
              <Switch value={hidden} onValueChange={setHidden} label="Hidden" />
              <Picker
                selectedValue={animation}
                onValueChange={(value) => setAnimation(value as StatusBarAnimation)}
              >
                <Picker.Item label="Fade" value="fade" />
                <Picker.Item label="Slide" value="slide" />
                <Picker.Item label="No animation" value="none" />
              </Picker>
            </Column>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            The hide animation applies on iOS. Go back to see the app&apos;s
            own status bar return.
          </AppText>
        </Section>
      </Screen>
    </>
  );
}
