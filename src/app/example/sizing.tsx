import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, u } from "@/styles";

const widths = [
  { name: "wFull", style: u.wFull },
  { name: "wHalf", style: u.wHalf },
  { name: "wThird", style: u.wThird },
  { name: "wQuarter", style: u.wQuarter },
] as const;

const fixedSizes = [
  { name: "w12", style: u.w12 },
  { name: "w16", style: u.w16 },
  { name: "h12", style: u.h12 },
  { name: "size16", style: u.size16 },
  { name: "size24", style: u.size24 },
] as const;

export default function SizingExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Sizing" }} />
      <ExampleScreen title="Sizing" subtitle="Width, height, min/max, dan aspect ratio">
        <Section
          title="Percentage Width"
          utilities={widths.map((item) => item.name)}
        >
          <DemoBox>
            {widths.map((item) => (
              <View key={item.name} style={cx(u.mb2)}>
                <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mb1)}>{item.name}</Text>
                <View style={cx(item.style, u.h8, u.bgPrimary, u.rounded)} />
              </View>
            ))}
          </DemoBox>
        </Section>

        <Section
          title="Fixed Size (Token Spacing)"
          utilities={fixedSizes.map((item) => item.name)}
        >
          <View style={cx(u.flexRow, u.flexWrap, u.gap3)}>
            {fixedSizes.map((item) => (
              <View key={item.name} style={cx(u.itemsCenter)}>
                <View style={cx(item.style, u.bgPrimary, u.rounded)} />
                <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mt1)}>{item.name}</Text>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Height Utilities"
          utilities={["hFull", "hHalf", "hScreen"]}
        >
          <DemoBox label="h12 vs h16 vs h24">
            <View style={cx(u.flexRow, u.gap2, u.itemsEnd)}>
              <View style={cx(u.w12, u.h12, u.bgPrimary, u.rounded, u.center)}>
                <Text style={tx(u.textXs, u.textWhite)}>h12</Text>
              </View>
              <View style={cx(u.w12, u.h16, u.bgPrimary500, u.rounded, u.center)}>
                <Text style={tx(u.textXs, u.textWhite)}>h16</Text>
              </View>
              <View style={cx(u.w12, u.h24, u.bgPrimary600, u.rounded, u.center)}>
                <Text style={tx(u.textXs, u.textWhite)}>h24</Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Aspect Ratio"
          utilities={["aspectSquare", "aspectVideo"]}
        >
          <View style={cx(u.flexRow, u.gap3)}>
            <View style={cx(u.flex1)}>
              <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mb1)}>aspectSquare</Text>
              <View style={cx(u.aspectSquare, u.bgPrimary100, u.roundedLg, u.center)}>
                <Text style={tx(u.textSm, u.textPrimary500)}>1:1</Text>
              </View>
            </View>
            <View style={cx(u.flex1)}>
              <Text style={tx(u.textXs, u.fontMono, u.textGray500, u.mb1)}>aspectVideo</Text>
              <View style={cx(u.aspectVideo, u.bgGray200, u.roundedLg, u.center)}>
                <Text style={tx(u.textSm, u.textGray600)}>16:9</Text>
              </View>
            </View>
          </View>
        </Section>

        <Section
          title="Min / Max"
          utilities={["minW0", "minWFull", "maxWFull", "minH0"]}
        >
          <DemoBox label="maxWFull dalam container sempit">
            <View style={cx(u.w32, u.bgGray100, u.p2, u.rounded)}>
              <View style={cx(u.maxWFull, u.bgPrimary, u.p2, u.rounded)}>
                <Text style={tx(u.textXs, u.textWhite)}>maxWFull</Text>
              </View>
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
