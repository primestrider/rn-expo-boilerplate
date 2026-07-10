import { Stack } from "expo-router";
import { Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { styles, text, view } from "@/styles";

const paddings = [
  { name: "p2", style: styles.p2 },
  { name: "p4", style: styles.p4 },
  { name: "p6", style: styles.p6 },
  { name: "px4", style: styles.px4 },
  { name: "py2", style: styles.py2 },
  { name: "pt4", style: styles.pt4 },
] as const;

const margins = [
  { name: "m2", style: styles.m2 },
  { name: "m4", style: styles.m4 },
  { name: "mx4", style: styles.mx4 },
  { name: "my2", style: styles.my2 },
  { name: "mt4", style: styles.mt4 },
  { name: "mb2", style: styles.mb2 },
] as const;

const gaps = [
  { name: "gap1", style: styles.gap1 },
  { name: "gap2", style: styles.gap2 },
  { name: "gap4", style: styles.gap4 },
  { name: "gap6", style: styles.gap6 },
] as const;

export default function SpacingExample() {
  return (
    <>
      <Stack.Screen options={{ title: "Spacing" }} />
      <ExampleScreen
        title="Spacing"
        subtitle="Padding, margin, gap, and negative margin"
      >
        <Section
          title="Padding"
          description="styles.p*, styles.px*, styles.py*, styles.pt*, styles.pr*, styles.pb*, styles.pl*"
          utilities={paddings.map((item) => item.name)}
        >
          <View style={view(styles.gap3)}>
            {paddings.map((item) => (
              <View
                key={item.name}
                style={view(styles.bgGray100, styles.roundedLg)}
              >
                <View
                  style={view(styles.bgPrimary100, styles.rounded, item.style)}
                >
                  <Text
                    style={text(
                      styles.textXs,
                      styles.fontMono,
                      styles.textPrimary500,
                    )}
                  >
                    {item.name}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Section>

        <Section
          title="Margin"
          description="styles.m*, styles.mx*, styles.my*, styles.mt*, styles.mr*, styles.mb*, styles.ml*"
          utilities={margins.map((item) => item.name)}
        >
          <DemoBox>
            {margins.map((item) => (
              <View
                key={item.name}
                style={view(styles.bgGray100, styles.roundedLg, styles.mb2)}
              >
                <View
                  style={view(
                    styles.bgPrimary,
                    styles.rounded,
                    item.style,
                    styles.p2,
                  )}
                >
                  <Text
                    style={text(
                      styles.textXs,
                      styles.fontMono,
                      styles.textWhite,
                    )}
                  >
                    {item.name}
                  </Text>
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
            <DemoBox key={item.name} label={item.name} style={styles.mb3}>
              <View style={view(styles.flexRow, item.style)}>
                {[1, 2, 3].map((n) => (
                  <View
                    key={n}
                    style={view(
                      styles.bgPrimary,
                      styles.px3,
                      styles.py2,
                      styles.rounded,
                    )}
                  >
                    <Text style={text(styles.textXs, styles.textWhite)}>
                      {n}
                    </Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Negative Margin"
          description="styles.-m*, styles.-mx*, styles.-mt*, etc."
          utilities={["-mt4", "-mx2"]}
        >
          <DemoBox label="Container with simulated dashed border">
            <View
              style={view(
                styles.bgGray100,
                styles.p6,
                styles.roundedLg,
                styles.border,
                styles.borderGray300,
              )}
            >
              <View
                style={view(
                  styles.bgPrimary,
                  styles.p3,
                  styles.rounded,
                  styles["-mt4"],
                )}
              >
                <Text
                  style={text(styles.textXs, styles.textWhite, styles.fontMono)}
                >
                  -mt4
                </Text>
              </View>
              <Text style={text(styles.textXs, styles.textMuted, styles.mt6)}>
                Blue box pulled upward with negative margin
              </Text>
            </View>
          </DemoBox>
        </Section>
      </ExampleScreen>
    </>
  );
}
