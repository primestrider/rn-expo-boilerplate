import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { view, text, styles } from "@/styles";

const fontSizes = [
  { name: "textXs", style: styles.textXs },
  { name: "textSm", style: styles.textSm },
  { name: "textBase", style: styles.textBase },
  { name: "textLg", style: styles.textLg },
  { name: "textXl", style: styles.textXl },
  { name: "text2xl", style: styles.text2xl },
  { name: "text3xl", style: styles.text3xl },
] as const;

const fontWeights = [
  { name: "fontNormal", style: styles.fontNormal },
  { name: "fontMedium", style: styles.fontMedium },
  { name: "fontSemibold", style: styles.fontSemibold },
  { name: "fontBold", style: styles.fontBold },
] as const;

const textAligns = [
  { name: "textLeft", style: styles.textLeft },
  { name: "textCenter", style: styles.textCenter },
  { name: "textRight", style: styles.textRight },
] as const;

const letterSpacings = [
  { name: "trackingTight", style: styles.trackingTight },
  { name: "trackingNormal", style: styles.trackingNormal },
  { name: "trackingWide", style: styles.trackingWide },
  { name: "trackingWidest", style: styles.trackingWidest },
] as const;

export default function TypographyExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Typography" }} />
      <ExampleScreen title="Typography" subtitle="Font size, weight, alignment, and decoration">
        <Section
          title="Font Family"
          utilities={["fontSans", "fontMono"]}
        >
          <DemoBox>
            <Text style={text(styles.textLg, styles.fontSans, styles.textForeground, styles.mb2)}>
              fontSans — Plus Jakarta Sans
            </Text>
            <Text style={text(styles.textLg, styles.fontMono, styles.textForeground)}>
              fontMono — monospace 0123456789
            </Text>
          </DemoBox>
        </Section>

        <Section
          title="Font Size"
          utilities={fontSizes.map((item) => item.name)}
        >
          <DemoBox>
            {fontSizes.map((item) => (
              <Text key={item.name} style={text(item.style, styles.textForeground, styles.mb1, styles.fontSans)}>
                {item.name} — Typography scale
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Font Weight"
          utilities={fontWeights.map((item) => item.name)}
        >
          <DemoBox>
            {fontWeights.map((item) => (
              <Text key={item.name} style={text(styles.textBase, item.style, styles.textForeground, styles.mb1)}>
                {item.name} — Weight preview
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Text Alignment"
          utilities={textAligns.map((item) => item.name)}
        >
          {textAligns.map((item) => (
            <DemoBox key={item.name} style={styles.mb2}>
              <Text style={text(styles.textSm, styles.textGray500, styles.mb1, styles.fontMono)}>{item.name}</Text>
              <Text style={text(styles.textBase, item.style, styles.textForeground)}>
                Lorem ipsum dolor sit amet
              </Text>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Letter Spacing"
          utilities={letterSpacings.map((item) => item.name)}
        >
          <DemoBox>
            {letterSpacings.map((item) => (
              <Text key={item.name} style={text(styles.textBase, item.style, styles.textForeground, styles.mb2)}>
                {item.name} — SPACED TEXT
              </Text>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Text Decoration & Transform"
          utilities={["underline", "lineThrough", "uppercase", "capitalize"]}
        >
          <DemoBox>
            <Text style={text(styles.textBase, styles.underline, styles.textPrimary, styles.mb2)}>
              underline — Underlined text
            </Text>
            <Text style={text(styles.textBase, styles.lineThrough, styles.textMuted, styles.mb2)}>
              lineThrough — Strikethrough text
            </Text>
            <Text style={text(styles.textBase, styles.uppercase, styles.textForeground, styles.mb2)}>
              uppercase — transformed text
            </Text>
            <Text style={text(styles.textBase, styles.capitalize, styles.textForeground)}>
              capitalize — hello world example
            </Text>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
