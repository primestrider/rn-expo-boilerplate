import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, u } from "@/styles";

const paddings = [
  { name: "p2", style: u.p2 },
  { name: "p4", style: u.p4 },
  { name: "p6", style: u.p6 },
  { name: "px4", style: u.px4 },
  { name: "py2", style: u.py2 },
  { name: "pt4", style: u.pt4 },
] as const;

const margins = [
  { name: "m2", style: u.m2 },
  { name: "m4", style: u.m4 },
  { name: "mx4", style: u.mx4 },
  { name: "my2", style: u.my2 },
  { name: "mt4", style: u.mt4 },
  { name: "mb2", style: u.mb2 },
] as const;

const gaps = [
  { name: "gap1", style: u.gap1 },
  { name: "gap2", style: u.gap2 },
  { name: "gap4", style: u.gap4 },
  { name: "gap6", style: u.gap6 },
] as const;

export default function SpacingExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Spacing" }} />
      <ExampleScreen title="Spacing" subtitle="Padding, margin, gap, dan negative margin">
        <Section
          title="Padding"
          description="u.p*, u.px*, u.py*, u.pt*, u.pr*, u.pb*, u.pl*"
          utilities={paddings.map((item) => item.name)}
        >
          <View style={cx(u.gap3)}>
            {paddings.map((item) => (
              <View key={item.name} style={cx(u.bgGray100, u.roundedLg)}>
                <View style={cx(u.bgPrimary100, u.rounded, item.style)}>
                  <Text style={tx(u.textXs, u.fontMono, u.textPrimary500)}>{item.name}</Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Margin"
          description="u.m*, u.mx*, u.my*, u.mt*, u.mr*, u.mb*, u.ml*"
          utilities={margins.map((item) => item.name)}
        >
          <DemoBox>
            {margins.map((item) => (
              <View key={item.name} style={cx(u.bgGray100, u.roundedLg, u.mb2)}>
                <View style={cx(u.bgPrimary, u.rounded, item.style, u.p2)}>
                  <Text style={tx(u.textXs, u.fontMono, u.textWhite)}>{item.name}</Text>
                </View>
              </View>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Gap"
          description="Jarak antar child di flex container"
          utilities={gaps.map((item) => item.name)}
        >
          {gaps.map((item) => (
            <DemoBox key={item.name} label={item.name} style={u.mb3}>
              <View style={cx(u.flexRow, item.style)}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={cx(u.bgPrimary, u.px3, u.py2, u.rounded)}>
                    <Text style={tx(u.textXs, u.textWhite)}>{n}</Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Negative Margin"
          description="u.-m*, u.-mx*, u.-mt*, dll."
          utilities={["-mt4", "-mx2"]}
        >
          <DemoBox label="Container dengan border dashed (simulasi)">
            <View style={cx(u.bgGray100, u.p6, u.roundedLg, u.border, u.borderGray300)}>
              <View style={cx(u.bgPrimary, u.p3, u.rounded, u["-mt4"])}>
                <Text style={tx(u.textXs, u.textWhite, u.fontMono)}>-mt4</Text>
              </View>
              <Text style={tx(u.textXs, u.textMuted, u.mt6)}>
                Box biru ditarik ke atas dengan negative margin
              </Text>
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
