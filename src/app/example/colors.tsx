import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, palette, u } from "@/styles";

const semanticBgs = [
  { name: "bgBackground", style: u.bgBackground },
  { name: "bgPrimary", style: u.bgPrimary },
  { name: "bgSecondary", style: u.bgSecondary },
  { name: "bgCard", style: u.bgCard },
  { name: "bgDestructive", style: u.bgDestructive },
  { name: "bgMuted", style: u.bgMuted },
] as const;

const paletteBgs = [
  { name: "bgPrimary50", style: u.bgPrimary50 },
  { name: "bgPrimary100", style: u.bgPrimary100 },
  { name: "bgPrimary500", style: u.bgPrimary500 },
  { name: "bgGray50", style: u.bgGray50 },
  { name: "bgGray200", style: u.bgGray200 },
  { name: "bgGray800", style: u.bgGray800 },
] as const;

const statusBgs = [
  { name: "bgSuccess", style: u.bgSuccess },
  { name: "bgWarning", style: u.bgWarning },
  { name: "bgError", style: u.bgError },
  { name: "bgInfo", style: u.bgInfo },
] as const;

const textColors = [
  { name: "textForeground", style: u.textForeground },
  { name: "textPrimary", style: u.textPrimary },
  { name: "textMuted", style: u.textMuted },
  { name: "textDestructive", style: u.textDestructive },
  { name: "textSuccess", style: u.textSuccess },
  { name: "textWarning", style: u.textWarning },
  { name: "textError", style: u.textError },
] as const;

export default function ColorsExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Colors" }} />
      <ExampleScreen
        title="Colors"
        subtitle="Semantic colors, palette, dan text color utilities"
      >
        <Section
          title="Semantic Background"
          description="Warna dengan makna kontekstual (background, primary, destructive, dll.)"
          utilities={semanticBgs.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap2)}>
            {semanticBgs.map((item) => (
              <View key={item.name} style={cx(u.w24, u.h16, u.roundedLg, item.style, u.center)}>
                <Text style={tx(u.textXs, u.fontMono, u.textWhite)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Palette Background"
          description="Skala warna dari design tokens"
          utilities={paletteBgs.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap2)}>
            {paletteBgs.map((item) => (
              <View key={item.name} style={cx(u.w24, u.h16, u.roundedLg, item.style, u.center)}>
                <Text style={tx(u.textXs, u.fontMono, u.textGray700)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Status Background"
          utilities={statusBgs.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap2)}>
            {statusBgs.map((item) => (
              <View key={item.name} style={cx(u.flex1, u.h12, u.roundedLg, item.style, u.center)}>
                <Text style={tx(u.textXs, u.fontMedium, u.textWhite)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Text Colors"
          utilities={textColors.map((item) => item.name)}
        >
          <DemoBox>
            {textColors.map((item) => (
              <Text key={item.name} style={tx(u.textBase, u.mb1, item.style)}>
                {item.name} — The quick brown fox
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Primary Scale (Token)"
          description="Akses langsung ke palette via import token"
          utilities={["palette.primary[500]"]}
        >
          <View style={cx(u.flexRow, u.gap1)}>
            {Object.entries(palette.primary).map(([shade, color]) => (
              <View
                key={shade}
                style={cx(u.flex1, u.h12, u.rounded, { backgroundColor: color })}
              />
            ))}
          </View>
          <Text style={tx(u.textXs, u.textMuted, u.mt2, u.textCenter)}>
            primary 50 → 900
          </Text>
        </Section>
      </ExampleScreen>
    </>
  );
}
