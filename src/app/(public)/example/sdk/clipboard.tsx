import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { AppText, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  Spacer,
  Text,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const REFERRAL_CODE = "SUPER-7K2Q9";

const IMPACTS = Object.values(Haptics.ImpactFeedbackStyle);
const OUTCOMES = Object.values(Haptics.NotificationFeedbackType);

/**
 * expo-clipboard for "copy referral code" / "paste account number", with
 * expo-haptics confirming each action the way payment apps do.
 */
export default function ClipboardExample() {
  const styles = useStyles();
  const input = useNativeState("");

  const [pasted, setPasted] = useState<string | null>(null);
  const [changes, setChanges] = useState(0);
  const [impact, setImpact] = useState(Haptics.ImpactFeedbackStyle.Medium);
  const [outcome, setOutcome] = useState(Haptics.NotificationFeedbackType.Success);

  // Fires when anything — this app or another — writes to the clipboard.
  useEffect(() => {
    const subscription = Clipboard.addClipboardListener(() =>
      setChanges((n) => n + 1),
    );
    return () => subscription.remove();
  }, []);

  const copyCode = async () => {
    await Clipboard.setStringAsync(REFERRAL_CODE);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const paste = async () => {
    if (!(await Clipboard.hasStringAsync())) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    const text = await Clipboard.getStringAsync();
    // `useNativeState` returns a mutable native handle, like a ref: writing
    // `.value` is how @expo/ui updates the field without a re-render.
    // eslint-disable-next-line react-hooks/immutability
    input.value = text;
    setPasted(text);
    Haptics.selectionAsync();
  };

  return (
    <>
      <Stack.Screen options={{ title: "Clipboard & Haptics" }} />
      <Screen>
        <Section
          title="Copy"
          description="Copies a referral code and confirms with a success tap"
          utilities={["setStringAsync", "notificationAsync"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Row spacing={8} alignment="center">
              <Text textStyle={{ fontSize: 18, fontWeight: "600" }}>
                {REFERRAL_CODE}
              </Text>
              <Spacer flexible />
              <Button label="Copy" onPress={copyCode} />
            </Row>
          </NativeHost>
        </Section>

        <Section
          title="Paste"
          description="Reads the clipboard into a native text field"
          utilities={["hasStringAsync", "getStringAsync", "addClipboardListener"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <TextInput value={input} placeholder="Account number" />
              <Button label="Paste" variant="outlined" onPress={paste} />
            </Column>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            Clipboard changed {changes} times while this screen was open.
          </AppText>
          {pasted !== null ? (
            <View style={styles.mt3}>
              <InfoRows rows={[["Last pasted", pasted]]} />
            </View>
          ) : null}
        </Section>

        <Section
          title="Haptics"
          description="Changing a picker ticks with selectionAsync — no-op on web"
          utilities={["impactAsync", "notificationAsync", "selectionAsync"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Row spacing={8} alignment="center">
                <Picker
                  selectedValue={impact}
                  onValueChange={(value) => {
                    setImpact(value as Haptics.ImpactFeedbackStyle);
                    Haptics.selectionAsync();
                  }}
                >
                  {IMPACTS.map((style) => (
                    <Picker.Item key={style} label={style} value={style} />
                  ))}
                </Picker>
                <Spacer flexible />
                <Button label="Impact" onPress={() => Haptics.impactAsync(impact)} />
              </Row>
              <Row spacing={8} alignment="center">
                <Picker
                  selectedValue={outcome}
                  onValueChange={(value) => {
                    setOutcome(value as Haptics.NotificationFeedbackType);
                    Haptics.selectionAsync();
                  }}
                >
                  {OUTCOMES.map((type) => (
                    <Picker.Item key={type} label={type} value={type} />
                  ))}
                </Picker>
                <Spacer flexible />
                <Button
                  label="Notify"
                  onPress={() => Haptics.notificationAsync(outcome)}
                />
              </Row>
            </Column>
          </NativeHost>
        </Section>
      </Screen>
    </>
  );
}
