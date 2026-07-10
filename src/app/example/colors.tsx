import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { view, text, palette, styles } from "@/styles";

const semanticBgs = [
  { name: "bgBackground", style: styles.bgBackground },
  { name: "bgPrimary", style: styles.bgPrimary },
  { name: "bgSecondary", style: styles.bgSecondary },
  { name: "bgCard", style: styles.bgCard },
  { name: "bgDestructive", style: styles.bgDestructive },
  { name: "bgMuted", style: styles.bgMuted },
] as const;

const paletteBgs = [
  { name: "bgPrimary50", style: styles.bgPrimary50 },
  { name: "bgPrimary100", style: styles.bgPrimary100 },
  { name: "bgPrimary500", style: styles.bgPrimary500 },
  { name: "bgGray50", style: styles.bgGray50 },
  { name: "bgGray200", style: styles.bgGray200 },
  { name: "bgGray800", style: styles.bgGray800 },
] as const;

const statusBgs = [
  { name: "bgSuccess", style: styles.bgSuccess },
  { name: "bgWarning", style: styles.bgWarning },
  { name: "bgError", style: styles.bgError },
  { name: "bgInfo", style: styles.bgInfo },
] as const;

const textColors = [
  { name: "textForeground", style: styles.textForeground },
  { name: "textPrimary", style: styles.textPrimary },
  { name: "textMuted", style: styles.textMuted },
  { name: "textDestructive", style: styles.textDestructive },
  { name: "textSuccess", style: styles.textSuccess },
  { name: "textWarning", style: styles.textWarning },
  { name: "textError", style: styles.textError },
] as const;

export default function ColorsExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Colors" }} />
      <ExampleScreen
        title="Colors"
        subtitle="Semantic colors, palette, and text color utilities"
      >
        <Section
          title="Semantic Background"
          description="Colors with contextual meaning (background, primary, destructive, etc.)"
          utilities={semanticBgs.map((item) => item.name)}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {semanticBgs.map((item) => (
              <View key={item.name} style={view(styles.w24, styles.h16, styles.roundedLg, item.style, styles.center)}>
                <Text style={text(styles.textXs, styles.fontMono, styles.textWhite)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Palette Background"
          description="Color scale from design tokens"
          utilities={paletteBgs.map((item) => item.name)}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {paletteBgs.map((item) => (
              <View key={item.name} style={view(styles.w24, styles.h16, styles.roundedLg, item.style, styles.center)}>
                <Text style={text(styles.textXs, styles.fontMono, styles.textGray700)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Status Background"
          utilities={statusBgs.map((item) => item.name)}
        >
          <View style={view(styles.flexRow, styles.flexWrap, styles.gap2)}>
            {statusBgs.map((item) => (
              <View key={item.name} style={view(styles.flex1, styles.h12, styles.roundedLg, item.style, styles.center)}>
                <Text style={text(styles.textXs, styles.fontMedium, styles.textWhite)}>{item.name}</Text>
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
              <Text key={item.name} style={text(styles.textBase, styles.mb1, item.style)}>
                {item.name} — The quick brown fox
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Primary Scale (Token)"
          description="Direct palette access via token import"
          utilities={["palette.primary[500]"]}
        >
          <View style={view(styles.flexRow, styles.gap1)}>
            {Object.entries(palette.primary).map(([shade, color]) => (
              <View
                key={shade}
                style={view(styles.flex1, styles.h12, styles.rounded, { backgroundColor: color })}
              />
            ))}
          </View>
          <Text style={text(styles.textXs, styles.textMuted, styles.mt2, styles.textCenter)}>
            primary 50 → 900
          </Text>
        </Section>
      </ExampleScreen>
    </>
  );
}
