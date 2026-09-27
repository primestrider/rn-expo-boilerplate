import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { Section } from "@/features/example/components";
import { AppText, Badge, Card, Screen } from "@/shared/components";
import {
  BottomSheet,
  Button,
  Checkbox,
  Collapsible,
  Column,
  FieldGroup,
  Icon,
  List,
  ListItem,
  NativeHost,
  Picker,
  RNHostView,
  Row,
  Slider,
  Spacer,
  Switch,
  Text,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles, useTheme, view } from "@/styles";

const FAVORITE = {
  ios: "heart.fill",
  android: require("@/assets/icons/favorite.xml"),
} as const;

const SIZES = ["Small", "Medium", "Large"] as const;

/**
 * Every universal `@expo/ui` component, one tree per section: SwiftUI on iOS,
 * Jetpack Compose on Android, react-native-web on web. `NativeHost` supplies
 * the app theme to each tree.
 */
export default function NativeUniversalComponents() {
  const styles = useStyles();
  const { colors } = useTheme();

  const [liked, setLiked] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [volume, setVolume] = useState(40);
  const [size, setSize] = useState<string>("Medium");
  const [open, setOpen] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [typed, setTyped] = useState("");
  const [presses, setPresses] = useState(0);
  const name = useNativeState("");

  return (
    <>
      <Stack.Screen options={{ title: "Native UI · Universal" }} />
      <Screen>
        <Section
          title="Layout & Text"
          description="Column, Row and Spacer lay out native children"
          utilities={["Column", "Row", "Spacer", "Text"]}
        >
          <Card variant="outlined">
            <NativeHost matchContents={{ vertical: true }}>
              <Column spacing={8}>
                <Text textStyle={{ fontSize: 20, fontWeight: "600" }}>
                  Native heading
                </Text>
                <Text textStyle={{ color: colors.muted }}>
                  Rendered by SwiftUI or Compose, not React Native.
                </Text>
                <Row spacing={8} alignment="center">
                  <Text>Left</Text>
                  <Spacer flexible />
                  <Text>Right</Text>
                </Row>
              </Column>
            </NativeHost>
          </Card>
        </Section>

        <Section
          title="Button"
          description="Platform buttons in three emphasis levels"
          utilities={["filled", "outlined", "text"]}
        >
          <NativeHost matchContents>
            <Row spacing={8}>
              <Button
                label="Filled"
                onPress={() => setPresses((n) => n + 1)}
              />
              <Button
                label="Outlined"
                variant="outlined"
                onPress={() => setPresses((n) => n + 1)}
              />
              <Button
                label="Text"
                variant="text"
                onPress={() => setPresses((n) => n + 1)}
              />
            </Row>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            Pressed {presses} times
          </AppText>
        </Section>

        <Section
          title="Switch & Checkbox"
          description="Boolean controls; on iOS the checkbox is a Toggle"
          utilities={["value", "onValueChange", "label", "disabled"]}
        >
          <Card variant="outlined">
            <NativeHost matchContents={{ vertical: true }}>
              <Column spacing={12}>
                <Switch value={liked} onValueChange={setLiked} label="Liked" />
                <Checkbox
                  value={agreed}
                  onValueChange={setAgreed}
                  label="I agree to the terms"
                />
                <Switch value disabled onValueChange={() => {}} label="Disabled" />
              </Column>
            </NativeHost>
          </Card>
        </Section>

        <Section
          title="Slider"
          description="Continuous or stepped value"
          utilities={["min", "max", "step"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Slider
              value={volume}
              onValueChange={setVolume}
              min={0}
              max={100}
              step={10}
            />
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            Volume {Math.round(volume)}
          </AppText>
        </Section>

        <Section
          title="Picker"
          description="Single choice as a menu, or an inline wheel on iOS"
          utilities={["selectedValue", "appearance", "Picker.Item"]}
        >
          <NativeHost matchContents>
            <Picker selectedValue={size} onValueChange={setSize}>
              {SIZES.map((option) => (
                <Picker.Item key={option} label={option} value={option} />
              ))}
            </Picker>
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            Selected {size}
          </AppText>
        </Section>

        <Section
          title="TextInput"
          description="Value lives in useNativeState, updated on the UI thread"
          utilities={["useNativeState", "onChangeText", "placeholder"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <TextInput
              value={name}
              onChangeText={setTyped}
              placeholder="Your name"
            />
          </NativeHost>
          <AppText variant="caption" color="muted" style={styles.mt2}>
            {typed ? `Hello, ${typed}` : "Start typing"}
          </AppText>
        </Section>

        <Section
          title="Collapsible"
          description="Tap the header to show or hide the content"
          utilities={["isOpen", "onOpenChange", "label"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Collapsible
              label="Shipping details"
              isOpen={open}
              onOpenChange={setOpen}
            >
              <Text>Arrives in 2–4 business days.</Text>
            </Collapsible>
          </NativeHost>
        </Section>

        <Section
          title="BottomSheet"
          description="Native sheet with half and full detents"
          utilities={["isPresented", "onDismiss", "snapPoints"]}
        >
          <NativeHost matchContents>
            <Button label="Open sheet" onPress={() => setSheet(true)} />
          </NativeHost>
          <BottomSheet
            isPresented={sheet}
            onDismiss={() => setSheet(false)}
            snapPoints={["half", "full"]}
            containerColor={colors.card}
          >
            <RNHostView matchContents>
              <View style={view(styles.gap2, styles.p4)}>
                <AppText variant="title">Sheet content</AppText>
                <AppText color="muted">
                  React Native views, hosted inside the native sheet.
                </AppText>
              </View>
            </RNHostView>
          </BottomSheet>
        </Section>

        <Section
          title="List & ListItem"
          description="Short, fixed groups of rows — not a virtualized list"
          utilities={["leading", "trailing", "supportingText", "onPress"]}
        >
          {/* A List scrolls itself, so its host needs a real height. */}
          <NativeHost style={view(styles.roundedXl, { height: 240 })}>
            <List>
              <ListItem
                leading={<Icon name={FAVORITE} size={20} color={colors.primary} />}
                supportingText="Shown with a native icon"
              >
                Favorites
              </ListItem>
              <ListItem supportingText="Tap to toggle" onPress={() => setLiked((v) => !v)}>
                {liked ? "Liked" : "Not liked"}
              </ListItem>
              <ListItem trailing={<Text>{size}</Text>}>Size</ListItem>
            </List>
          </NativeHost>
        </Section>

        <Section
          title="FieldGroup"
          description="Settings-style grouped form sections"
          utilities={["FieldGroup.Section", "title"]}
        >
          <NativeHost style={view(styles.roundedXl, { height: 280 })}>
            <FieldGroup>
              <FieldGroup.Section title="Notifications">
                <Switch value={liked} onValueChange={setLiked} label="Push" />
                <Checkbox value={agreed} onValueChange={setAgreed} label="Email digest" />
              </FieldGroup.Section>
              <FieldGroup.Section title="Playback">
                <Slider value={volume} onValueChange={setVolume} min={0} max={100} />
              </FieldGroup.Section>
            </FieldGroup>
          </NativeHost>
        </Section>

        <Section
          title="RNHostView"
          description="Embed React Native views inside a native tree"
          utilities={["matchContents"]}
        >
          <NativeHost matchContents>
            <Row spacing={8} alignment="center">
              <Text>Native text next to</Text>
              <RNHostView matchContents>
                <Badge label="an RN Badge" variant="primary" />
              </RNHostView>
            </Row>
          </NativeHost>
        </Section>
      </Screen>
    </>
  );
}
