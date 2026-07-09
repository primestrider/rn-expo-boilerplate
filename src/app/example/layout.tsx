import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, gridCol, u } from "@/styles";

const flexDirections = [
  { name: "flexRow", style: u.flexRow },
  { name: "flexCol", style: u.flexCol },
  { name: "flexRowReverse", style: u.flexRowReverse },
] as const;

const alignItems = [
  { name: "itemsStart", style: u.itemsStart },
  { name: "itemsCenter", style: u.itemsCenter },
  { name: "itemsEnd", style: u.itemsEnd },
  { name: "itemsStretch", style: u.itemsStretch },
] as const;

const justifyContent = [
  { name: "justifyStart", style: u.justifyStart },
  { name: "justifyCenter", style: u.justifyCenter },
  { name: "justifyEnd", style: u.justifyEnd },
  { name: "justifyBetween", style: u.justifyBetween },
  { name: "justifyAround", style: u.justifyAround },
  { name: "justifyEvenly", style: u.justifyEvenly },
] as const;

export default function LayoutExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Layout & Flex" }} />
      <ExampleScreen title="Layout & Flex" subtitle="Flexbox, alignment, position, dan grid">
        <Section
          title="Flex Direction"
          utilities={flexDirections.map((item) => item.name)}
        >
          {flexDirections.map((item) => (
            <DemoBox key={item.name} label={item.name} style={u.mb3}>
              <View style={cx(u.h20, item.style, u.gap2)}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={cx(u.bgPrimary, u.px3, u.py1, u.rounded)}>
                    <Text style={tx(u.textXs, u.textWhite)}>{n}</Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Align Items"
          utilities={alignItems.map((item) => item.name)}
        >
          {alignItems.map((item) => (
            <DemoBox key={item.name} label={item.name} style={u.mb3}>
              <View style={cx(u.flexRow, u.h16, item.style, u.gap2, u.bgGray100, u.rounded, u.p2)}>
                <View style={cx(u.bgPrimary, u.px2, u.py4, u.rounded)}>
                  <Text style={tx(u.textXs, u.textWhite)}>A</Text>
                </View>
                <View style={cx(u.bgPrimary, u.px2, u.py1, u.rounded)}>
                  <Text style={tx(u.textXs, u.textWhite)}>B</Text>
                </View>
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Justify Content"
          utilities={justifyContent.map((item) => item.name)}
        >
          {justifyContent.map((item) => (
            <DemoBox key={item.name} label={item.name} style={u.mb3}>
              <View style={cx(u.flexRow, item.style, u.gap1, u.bgGray100, u.rounded, u.p2)}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={cx(u.bgPrimary, u.w8, u.h8, u.rounded, u.center)}>
                    <Text style={tx(u.textXs, u.textWhite)}>{n}</Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Flex Grow & Shrink"
          utilities={["flex1", "flexGrow", "flexShrink0", "rowBetween", "center"]}
        >
          <DemoBox label="flex1 — kedua box membagi ruang">
            <View style={cx(u.flexRow, u.gap2, u.h12)}>
              <View style={cx(u.flex1, u.bgPrimary, u.rounded, u.center)}>
                <Text style={tx(u.textXs, u.textWhite)}>flex1</Text>
              </View>
              <View style={cx(u.flex1, u.bgGray500, u.rounded, u.center)}>
                <Text style={tx(u.textXs, u.textWhite)}>flex1</Text>
              </View>
            </View>
          </DemoBox>
          <DemoBox label="rowBetween" style={u.mt3}>
            <View style={cx(u.rowBetween, u.bgGray100, u.p3, u.rounded)}>
              <Text style={tx(u.textSm, u.textForeground)}>Left</Text>
              <Text style={tx(u.textSm, u.textForeground)}>Right</Text>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Position"
          utilities={["relative", "absolute", "inset0", "z10", "z50"]}
        >
          <DemoBox label="absolute + top0 + right0">
            <View style={cx(u.relative, u.h24, u.bgGray100, u.roundedLg)}>
              <View
                style={cx(
                  u.absolute,
                  u.top0,
                  u.right0,
                  u.bgPrimary,
                  u.px2,
                  u.py1,
                  u.rounded,
                  u.z50
                )}
              >
                <Text style={tx(u.textXs, u.textWhite)}>Badge</Text>
              </View>
              <View style={cx(u.center, u.hFull)}>
                <Text style={tx(u.textSm, u.textMuted)}>relative container</Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Grid-like Layout"
          description="RN tidak punya CSS Grid — gunakan flexWrap + gridCol()"
          utilities={["gridCols2", "gridCols3", "gridCol(3)"]}
        >
          <DemoBox label="gridCols3 + gridCol(3)">
            <View style={cx(u.gridCols3, u.gap2)}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <View
                  key={n}
                  style={cx(
                    gridCol(3),
                    u.bgPrimary50,
                    u.p3,
                    u.rounded,
                    u.center,
                    u.border,
                    u.borderPrimary
                  )}
                >
                  <Text style={tx(u.textSm, u.textPrimary500)}>{n}</Text>
                </View>
              ))}
            </View>
          </DemoBox>
          <DemoBox label="gridCols2 + gridCol(2)" style={u.mt3}>
            <View style={cx(u.gridCols2, u.gap2)}>
              {["A", "B", "C", "D"].map((label) => (
                <View
                  key={label}
                  style={cx(gridCol(2), u.bgGray100, u.p4, u.roundedLg, u.center)}
                >
                  <Text style={tx(u.textBase, u.fontSemibold)}>{label}</Text>
                </View>
              ))}
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
