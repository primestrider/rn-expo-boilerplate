import { Stack } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { DemoBox } from "@/example/components/DemoBox";
import { ExampleScreen } from "@/example/components/ExampleScreen";
import { Section } from "@/example/components/Section";
import { cx, tx, gridCol, space, u } from "@/styles";

export default function HelpersExample() {
  const [active, setActive] = useState(false);
  const dynamicPadding = 20;

  return (
    <>
      <Stack.Screen options={{ title: "Helpers" }} />
      <ExampleScreen
        title="Helpers"
        subtitle="cx(), space(), dan gridCol() untuk styling dinamis"
      >
        <Section
          title="cx() — Conditional Styles"
          description="Gabungkan utility class dengan kondisi, mirip clsx/cn"
          utilities={["cx()", "u.flex1", "u.bgPrimary", "u.opacity75"]}
        >
          <DemoBox>
            <Text style={tx(u.textSm, u.fontMono, u.textGray600, u.mb3)}>
              {`cx(u.p4, u.roundedLg, active && u.bgPrimary)`}
            </Text>
            <Pressable
              onPress={() => setActive((prev) => !prev)}
              style={cx(
                u.p4,
                u.roundedLg,
                u.border,
                u.borderBorder,
                active ? u.bgPrimary : u.bgGray100
              )}
            >
              <Text style={tx(u.textBase, active ? u.textWhite : u.textForeground)}>
                {active ? "Active — tap to deactivate" : "Tap to activate"}
              </Text>
            </Pressable>
          </DemoBox>

          <DemoBox label="Pressed state dengan callback" style={u.mt3}>
            <Pressable
              style={({ pressed }) =>
                cx(
                  u.bgPrimary,
                  u.px4,
                  u.py3,
                  u.roundedLg,
                  u.center,
                  pressed && u.opacity75
                )
              }
            >
              <Text style={tx(u.textBase, u.fontSemibold, u.textWhite)}>Press Me</Text>
            </Pressable>
          </DemoBox>
        </Section>

        <Section
          title="space() — Dynamic Spacing"
          description="Buat padding/margin dinamis dari nilai numerik"
          utilities={["space('p', 20)", "space('mx', 8)"]}
        >
          <DemoBox>
            <Text style={tx(u.textSm, u.fontMono, u.textGray600, u.mb3)}>
              {`space('p', ${dynamicPadding})`}
            </Text>
            <View style={cx(u.bgGray100, u.roundedLg)}>
              <View style={cx(u.bgPrimary, u.rounded, space("p", dynamicPadding))}>
                <Text style={tx(u.textSm, u.textWhite)}>Dynamic padding: {dynamicPadding}px</Text>
              </View>
            </View>
          </DemoBox>

          <DemoBox label="space('mx', 8)" style={u.mt3}>
            <View style={cx(u.bgGray100, u.roundedLg, u.p4)}>
              <View style={cx(u.bgPrimary100, u.rounded, space("mx", 8), u.py3)}>
                <Text style={tx(u.textSm, u.textPrimary500, u.textCenter)}>
                  Horizontal margin 8px
                </Text>
              </View>
            </View>
          </DemoBox>
        </Section>

        <Section
          title="gridCol() — Dynamic Grid Columns"
          description="Hitung lebar kolom berdasarkan jumlah kolom"
          utilities={["gridCol(2)", "gridCol(3)", "gridCol(4)"]}
        >
          {[2, 3, 4].map((cols) => (
            <DemoBox key={cols} label={`gridCol(${cols})`} style={u.mb3}>
              <View style={cx(u.flexRow, u.flexWrap, u.gap2)}>
                {Array.from({ length: cols * 2 }, (_, i) => (
                  <View
                    key={i}
                    style={cx(
                      gridCol(cols as 2 | 3 | 4),
                      u.bgPrimary50,
                      u.p2,
                      u.rounded,
                      u.center,
                      u.border,
                      u.borderPrimary
                    )}
                  >
                    <Text style={tx(u.textXs, u.textPrimary500)}>{i + 1}</Text>
                  </View>
                ))}
              </View>
            </DemoBox>
          ))}
        </Section>

        <Section
          title="Kombinasi Lengkap"
          description="cx + u + space + gridCol dalam satu komponen"
          utilities={["cx()", "u.*", "space()", "gridCol()"]}
        >
          <View
            style={cx(
              u.bgCard,
              u.roundedXl,
              u.border,
              u.borderBorder,
              u.shadow,
              space("p", 16)
            )}
          >
            <Text style={tx(u.textLg, u.fontBold, u.textForeground, u.mb4)}>
              Dashboard Preview
            </Text>
            <View style={cx(u.flexRow, u.flexWrap, u.gap3)}>
              {[
                { label: "Users", value: "1.2k", color: u.bgPrimary },
                { label: "Orders", value: "348", color: u.bgSuccess },
                { label: "Revenue", value: "$12k", color: u.bgWarning },
              ].map((stat) => (
                <View
                  key={stat.label}
                  style={cx(gridCol(3), stat.color, u.roundedLg, u.p3)}
                >
                  <Text style={tx(u.textXs, u.textWhite, u.opacity75)}>{stat.label}</Text>
                  <Text style={tx(u.textXl, u.fontBold, u.textWhite)}>{stat.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </Section>
      </ExampleScreen>
    </>
  );
}
