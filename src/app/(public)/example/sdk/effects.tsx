import { BlurTargetView, BlurView, type BlurTint } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { MeshGradientView } from "expo-mesh-gradient";
import { Stack } from "expo-router";
import { useRef, useState } from "react";
import { Platform, View } from "react-native";

import { Section } from "@/features/example/components";
import { AppText, Screen } from "@/shared/components";
import { formatCurrency } from "@/shared/helpers";
import {
  Column,
  NativeHost,
  Picker,
  Slider,
  Switch,
} from "@/shared/native-ui";
import { useStyles, view } from "@/styles";

const GRADIENTS = {
  ocean: ["#0EA5E9", "#6366F1"],
  sunset: ["#F97316", "#EC4899"],
  forest: ["#22C55E", "#0F766E"],
} as const;

type GradientName = keyof typeof GRADIENTS;

const TINTS: BlurTint[] = ["default", "light", "dark", "systemMaterial"];

// The gradients are the same in both themes, so their text is too.
const ON_GRADIENT = { color: "#FFFFFF" };

/** Start/end points for a gradient running at `degrees` (0 = left → right). */
function gradientPoints(degrees: number) {
  const radians = (degrees * Math.PI) / 180;
  const x = Math.cos(radians) / 2;
  const y = Math.sin(radians) / 2;
  return {
    start: { x: 0.5 - x, y: 0.5 - y },
    end: { x: 0.5 + x, y: 0.5 + y },
  };
}

const MESH_COLORS = [
  "#6366F1", "#8B5CF6", "#EC4899",
  "#0EA5E9", "#F8FAFC", "#F97316",
  "#22C55E", "#14B8A6", "#EAB308",
];

/**
 * expo-linear-gradient for card and banner backgrounds, expo-blur for frosted
 * overlays (the balance-hiding card is a classic), and expo-mesh-gradient
 * for rich hero backgrounds.
 */
export default function EffectsExample() {
  const styles = useStyles();
  const blurTarget = useRef<View>(null);

  const [gradient, setGradient] = useState<GradientName>("ocean");
  const [angle, setAngle] = useState(45);
  const [hidden, setHidden] = useState(true);
  const [intensity, setIntensity] = useState(60);
  const [tint, setTint] = useState<BlurTint>("default");
  const [middle, setMiddle] = useState(0.5);
  const [smooth, setSmooth] = useState(true);

  const card = GRADIENTS[gradient];

  return (
    <>
      <Stack.Screen options={{ title: "Blur & Gradients" }} />
      <Screen>
        <Section
          title="Linear gradient"
          description="A wallet card background at any angle"
          utilities={["LinearGradient", "colors", "start", "end"]}
        >
          <LinearGradient
            testID="card-gradient"
            colors={card}
            {...gradientPoints(angle)}
            style={view(styles.roundedXl, styles.p4, { height: 160 })}
          >
            <AppText variant="caption" style={ON_GRADIENT}>
              Super Wallet
            </AppText>
            <AppText variant="h2" style={ON_GRADIENT}>
              {formatCurrency(1_250_000)}
            </AppText>
          </LinearGradient>
          <NativeHost matchContents={{ vertical: true }} style={{ marginTop: 12 }}>
            <Column spacing={12}>
              <Picker
                selectedValue={gradient}
                onValueChange={(value) => setGradient(value as GradientName)}
              >
                <Picker.Item label="Ocean" value="ocean" />
                <Picker.Item label="Sunset" value="sunset" />
                <Picker.Item label="Forest" value="forest" />
              </Picker>
              <Slider value={angle} onValueChange={setAngle} min={0} max={180} step={15} />
            </Column>
          </NativeHost>
        </Section>

        <Section
          title="Blur view"
          description="Hide the balance behind frosted glass"
          utilities={["BlurView", "BlurTargetView", "intensity", "tint", "blurMethod"]}
        >
          <View style={view(styles.roundedXl, styles.overflowHidden, { height: 160 })}>
            {/* Android blurs a sibling target; iOS blurs whatever is behind. */}
            <BlurTargetView ref={blurTarget} style={styles.flex1}>
              <LinearGradient
                colors={card}
                style={view(styles.flex1, styles.p4, styles.justifyCenter)}
              >
                <AppText variant="h2" style={ON_GRADIENT}>
                  {formatCurrency(1_250_000)}
                </AppText>
              </LinearGradient>
            </BlurTargetView>
            {hidden ? (
              <BlurView
                testID="balance-blur"
                blurTarget={blurTarget}
                blurMethod="dimezisBlurViewSdk31Plus"
                intensity={intensity}
                tint={tint}
                style={view(styles.absolute, styles.inset0, styles.itemsCenter, styles.justifyCenter)}
              >
                <AppText variant="title">Balance hidden</AppText>
              </BlurView>
            ) : null}
          </View>
          <NativeHost matchContents={{ vertical: true }} style={{ marginTop: 12 }}>
            <Column spacing={12}>
              <Switch value={hidden} onValueChange={setHidden} label="Hide balance" />
              <Slider value={intensity} onValueChange={setIntensity} min={0} max={100} step={5} />
              <Picker selectedValue={tint} onValueChange={(value) => setTint(value as BlurTint)}>
                {TINTS.map((name) => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
            </Column>
          </NativeHost>
        </Section>

        <Section
          title="Mesh gradient"
          description="3×3 control points — drag the middle one with the slider"
          utilities={["MeshGradientView", "points", "colors", "smoothsColors"]}
        >
          {Platform.OS === "web" ? (
            <AppText color="muted">Mesh gradients render on iOS and Android.</AppText>
          ) : (
            <>
              <MeshGradientView
                testID="mesh"
                style={view(styles.roundedXl, { height: 200 })}
                columns={3}
                rows={3}
                colors={MESH_COLORS}
                smoothsColors={smooth}
                points={[
                  [0, 0], [0.5, 0], [1, 0],
                  [0, 0.5], [middle, middle], [1, 0.5],
                  [0, 1], [0.5, 1], [1, 1],
                ]}
              />
              <NativeHost matchContents={{ vertical: true }} style={{ marginTop: 12 }}>
                <Column spacing={12}>
                  <Slider value={middle} onValueChange={setMiddle} min={0.2} max={0.8} />
                  <Switch value={smooth} onValueChange={setSmooth} label="Smooth colors" />
                </Column>
              </NativeHost>
            </>
          )}
        </Section>
      </Screen>
    </>
  );
}
