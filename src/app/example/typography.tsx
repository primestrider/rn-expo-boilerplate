import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, u } from "@/styles";

const fontSizes = [
  { name: "textXs", style: u.textXs },
  { name: "textSm", style: u.textSm },
  { name: "textBase", style: u.textBase },
  { name: "textLg", style: u.textLg },
  { name: "textXl", style: u.textXl },
  { name: "text2xl", style: u.text2xl },
  { name: "text3xl", style: u.text3xl },
] as const;

const fontWeights = [
  { name: "fontNormal", style: u.fontNormal },
  { name: "fontMedium", style: u.fontMedium },
  { name: "fontSemibold", style: u.fontSemibold },
  { name: "fontBold", style: u.fontBold },
] as const;

const textAligns = [
  { name: "textLeft", style: u.textLeft },
  { name: "textCenter", style: u.textCenter },
  { name: "textRight", style: u.textRight },
] as const;

const letterSpacings = [
  { name: "trackingTight", style: u.trackingTight },
  { name: "trackingNormal", style: u.trackingNormal },
  { name: "trackingWide", style: u.trackingWide },
  { name: "trackingWidest", style: u.trackingWidest },
] as const;

export default function TypographyExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Typography" }} />
      <ExampleScreen title="Typography" subtitle="Font size, weight, alignment, dan dekorasi">
        <Section
          title="Font Family"
          utilities={["fontSans", "fontMono"]}
        >
          <DemoBox>
            <Text style={tx(u.textLg, u.fontSans, u.textForeground, u.mb2)}>
              fontSans — Plus Jakarta Sans
            </Text>
            <Text style={tx(u.textLg, u.fontMono, u.textForeground)}>
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
              <Text key={item.name} style={tx(item.style, u.textForeground, u.mb1, u.fontSans)}>
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
              <Text key={item.name} style={tx(u.textBase, item.style, u.textForeground, u.mb1)}>
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
            <DemoBox key={item.name} style={u.mb2}>
              <Text style={tx(u.textSm, u.textGray500, u.mb1, u.fontMono)}>{item.name}</Text>
              <Text style={tx(u.textBase, item.style, u.textForeground)}>
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
              <Text key={item.name} style={tx(u.textBase, item.style, u.textForeground, u.mb2)}>
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
            <Text style={tx(u.textBase, u.underline, u.textPrimary, u.mb2)}>
              underline — Underlined text
            </Text>
            <Text style={tx(u.textBase, u.lineThrough, u.textMuted, u.mb2)}>
              lineThrough — Strikethrough text
            </Text>
            <Text style={tx(u.textBase, u.uppercase, u.textForeground, u.mb2)}>
              uppercase — transformed text
            </Text>
            <Text style={tx(u.textBase, u.capitalize, u.textForeground)}>
              capitalize — hello world example
            </Text>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
