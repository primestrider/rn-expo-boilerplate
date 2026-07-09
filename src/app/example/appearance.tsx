import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, u } from "@/styles";

const borderRadii = [
  { name: "roundedNone", style: u.roundedNone },
  { name: "roundedSm", style: u.roundedSm },
  { name: "rounded", style: u.rounded },
  { name: "roundedLg", style: u.roundedLg },
  { name: "roundedXl", style: u.roundedXl },
  { name: "rounded2xl", style: u.rounded2xl },
  { name: "roundedFull", style: u.roundedFull },
] as const;

const shadows = [
  { name: "shadowSm", style: u.shadowSm },
  { name: "shadow", style: u.shadow },
  { name: "shadowMd", style: u.shadowMd },
  { name: "shadowLg", style: u.shadowLg },
] as const;

const opacities = [
  { name: "opacity25", style: u.opacity25 },
  { name: "opacity50", style: u.opacity50 },
  { name: "opacity75", style: u.opacity75 },
  { name: "opacity100", style: u.opacity100 },
] as const;

export default function AppearanceExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Appearance" }} />
      <ExampleScreen title="Appearance" subtitle="Border, radius, shadow, dan opacity">
        <Section
          title="Border Width & Color"
          utilities={["border", "border2", "borderT", "borderPrimary", "borderGray200"]}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap3)}>
            <View style={cx(u.w20, u.h20, u.border, u.borderBorder, u.rounded, u.center)}>
              <Text style={tx(u.textXs, u.fontMono)}>border</Text>
            </View>
            <View style={cx(u.w20, u.h20, u.border2, u.borderPrimary, u.rounded, u.center)}>
              <Text style={tx(u.textXs, u.fontMono, u.textPrimary)}>border2</Text>
            </View>
            <View style={cx(u.w20, u.h20, u.borderT, u.borderGray300, u.bgGray50, u.rounded)}>
              <Text style={tx(u.textXs, u.fontMono, u.textCenter, u.mt6)}>borderT</Text>
            </View>
          </View>
        </Section>

        <Section
          title="Border Radius"
          utilities={borderRadii.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap3)}>
            {borderRadii.map((item) => (
              <View key={item.name} style={cx(u.itemsCenter)}>
                <View style={cx(u.w16, u.h16, u.bgPrimary, item.style)} />
                <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mt1)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Corner Radius"
          utilities={["roundedT", "roundedB", "roundedL", "roundedR"]}
        >
          <View style={cx(u.flexRow, u.gap3)}>
            {(
              [
                { name: "roundedT", style: u.roundedT },
                { name: "roundedB", style: u.roundedB },
                { name: "roundedL", style: u.roundedL },
                { name: "roundedR", style: u.roundedR },
              ] as const
            ).map((item) => (
              <View key={item.name} style={cx(u.flex1, u.itemsCenter)}>
                <View style={cx(u.w16, u.h16, u.bgPrimary100, item.style, u.border, u.borderPrimary)} />
                <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mt1)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Shadow"
          utilities={shadows.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap4, u.p2)}>
            {shadows.map((item) => (
              <View key={item.name} style={cx(u.itemsCenter)}>
                <View style={cx(u.w24, u.h16, u.bgCard, item.style, u.roundedLg, u.center)}>
                  <Text style={tx(u.textXs, u.fontMono, u.textGray600)}>{item.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Opacity"
          utilities={opacities.map((item) => item.name)}
        >
          <DemoBox>
            <View style={cx(u.flexRow, u.gap2)}>
              {opacities.map((item) => (
                <View
                  key={item.name}
                  style={cx(u.flex1, u.h12, u.bgPrimary, item.style, u.rounded, u.center)}
                >
                  <Text style={tx(u.textXs, u.textWhite, u.fontMono)}>{item.name}</Text>
                </View>
              ))}
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Kombinasi Card"
          utilities={["bgCard", "roundedXl", "border", "shadowMd", "p5"]}
        >
          <View style={cx(u.bgCard, u.roundedXl, u.border, u.borderBorder, u.shadowMd, u.p5)}>
            <Text style={tx(u.textLg, u.fontSemibold, u.textForeground, u.mb1)}>
              Card Component
            </Text>
            <Text style={tx(u.textSm, u.textMuted)}>
              Contoh kombinasi appearance utilities untuk membuat card.
            </Text>
          </View>
        </Section>
      </ExampleScreen>
    </>
  );
}
