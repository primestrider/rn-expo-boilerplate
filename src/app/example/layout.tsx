import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { view, text, gridCol, styles } from "@/styles";

const flexDirections = [
  { name: "flexRow", style: styles.flexRow },
  { name: "flexCol", style: styles.flexCol },
  { name: "flexRowReverse", style: styles.flexRowReverse },
] as const;

const alignItems = [
  { name: "itemsStart", style: styles.itemsStart },
  { name: "itemsCenter", style: styles.itemsCenter },
  { name: "itemsEnd", style: styles.itemsEnd },
  { name: "itemsStretch", style: styles.itemsStretch },
] as const;

const justifyContent = [
  { name: "justifyStart", style: styles.justifyStart },
  { name: "justifyCenter", style: styles.justifyCenter },
  { name: "justifyEnd", style: styles.justifyEnd },
  { name: "justifyBetween", style: styles.justifyBetween },
  { name: "justifyAround", style: styles.justifyAround },
  { name: "justifyEvenly", style: styles.justifyEvenly },
] as const;

export default function LayoutExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Layout & Flex" }} />
      <ExampleScreen title="Layout & Flex" subtitle="Flexbox, alignment, position, and grid">
        <Section
          title="Flex Direction"
          utilities={flexDirections.map((item) => item.name)}
        >
          {flexDirections.map((item) => (
            <DemoBox key={item.name} label={item.name} style={styles.mb3}>
              <View style={view(styles.h20, item.style, styles.gap2)}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={view(styles.bgPrimary, styles.px3, styles.py1, styles.rounded)}>
                    <Text style={text(styles.textXs, styles.textWhite)}>{n}</Text>
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
            <DemoBox key={item.name} label={item.name} style={styles.mb3}>
              <View style={view(styles.flexRow, styles.h16, item.style, styles.gap2, styles.bgGray100, styles.rounded, styles.p2)}>
                <View style={view(styles.bgPrimary, styles.px2, styles.py4, styles.rounded)}>
                  <Text style={text(styles.textXs, styles.textWhite)}>A</Text>
                </View>
                <View style={view(styles.bgPrimary, styles.px2, styles.py1, styles.rounded)}>
                  <Text style={text(styles.textXs, styles.textWhite)}>B</Text>
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
            <DemoBox key={item.name} label={item.name} style={styles.mb3}>
              <View style={view(styles.flexRow, item.style, styles.gap1, styles.bgGray100, styles.rounded, styles.p2)}>
                {[1, 2, 3].map((n) => (
                  <View key={n} style={view(styles.bgPrimary, styles.w8, styles.h8, styles.rounded, styles.center)}>
                    <Text style={text(styles.textXs, styles.textWhite)}>{n}</Text>
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
            <View style={view(styles.flexRow, styles.gap2, styles.h12)}>
              <View style={view(styles.flex1, styles.bgPrimary, styles.rounded, styles.center)}>
                <Text style={text(styles.textXs, styles.textWhite)}>flex1</Text>
              </View>
              <View style={view(styles.flex1, styles.bgGray500, styles.rounded, styles.center)}>
                <Text style={text(styles.textXs, styles.textWhite)}>flex1</Text>
              </View>
            </View>
          </DemoBox>
          <DemoBox label="rowBetween" style={styles.mt3}>
            <View style={view(styles.rowBetween, styles.bgGray100, styles.p3, styles.rounded)}>
              <Text style={text(styles.textSm, styles.textForeground)}>Left</Text>
              <Text style={text(styles.textSm, styles.textForeground)}>Right</Text>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Position"
          utilities={["relative", "absolute", "inset0", "z10", "z50"]}
        >
          <DemoBox label="absolute + top0 + right0">
            <View style={view(styles.relative, styles.h24, styles.bgGray100, styles.roundedLg)}>
              <View
                style={view(
                  styles.absolute,
                  styles.top0,
                  styles.right0,
                  styles.bgPrimary,
                  styles.px2,
                  styles.py1,
                  styles.rounded,
                  styles.z50
                )}
              >
                <Text style={text(styles.textXs, styles.textWhite)}>Badge</Text>
              </View>
              <View style={view(styles.center, styles.hFull)}>
                <Text style={text(styles.textSm, styles.textMuted)}>relative container</Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="Grid-like Layout"
          description="RN has no CSS Grid — use flexWrap + gridCol() instead"
          utilities={["gridCols2", "gridCols3", "gridCol(3)"]}
        >
          <DemoBox label="gridCols3 + gridCol(3)">
            <View style={view(styles.gridCols3, styles.gap2)}>
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <View
                  key={n}
                  style={view(
                    gridCol(3),
                    styles.bgPrimary50,
                    styles.p3,
                    styles.rounded,
                    styles.center,
                    styles.border,
                    styles.borderPrimary
                  )}
                >
                  <Text style={text(styles.textSm, styles.textPrimary500)}>{n}</Text>
                </View>
              ))}
            </View>
          </DemoBox>
          <DemoBox label="gridCols2 + gridCol(2)" style={styles.mt3}>
            <View style={view(styles.gridCols2, styles.gap2)}>
              {["A", "B", "C", "D"].map((label) => (
                <View
                  key={label}
                  style={view(gridCol(2), styles.bgGray100, styles.p4, styles.roundedLg, styles.center)}
                >
                  <Text style={text(styles.textBase, styles.fontSemibold)}>{label}</Text>
                </View>
              ))}
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
