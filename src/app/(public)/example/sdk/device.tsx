import * as Device from "expo-device";
import * as Network from "expo-network";
import { Stack } from "expo-router";
import { useState } from "react";
import { Platform, View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import { Button, NativeHost } from "@/shared/native-ui";
import { useStyles } from "@/styles";

const DEVICE_TYPE: Record<Device.DeviceType, string> = {
  [Device.DeviceType.UNKNOWN]: "Unknown",
  [Device.DeviceType.PHONE]: "Phone",
  [Device.DeviceType.TABLET]: "Tablet",
  [Device.DeviceType.DESKTOP]: "Desktop",
  [Device.DeviceType.TV]: "TV",
};

const formatGb = (bytes: number | null) =>
  bytes ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : null;

/**
 * expo-device for support tickets, fraud signals and device binding;
 * expo-network for the "you're offline" banner every super app shows.
 */
export default function DeviceExample() {
  const styles = useStyles();
  const network = Network.useNetworkState();

  const [ip, setIp] = useState<string | null>(null);
  const [airplane, setAirplane] = useState<boolean | null>(null);

  const refresh = async () => {
    setIp(await Network.getIpAddressAsync());
    // Only Android reports airplane mode.
    if (Platform.OS === "android") {
      setAirplane(await Network.isAirplaneModeEnabledAsync());
    }
  };

  const offline = network.isConnected === false || network.isInternetReachable === false;

  return (
    <>
      <Stack.Screen options={{ title: "Device & Network" }} />
      <Screen>
        <Section
          title="Network"
          description="useNetworkState re-renders when connectivity changes"
          utilities={[
            "useNetworkState",
            "getIpAddressAsync",
            "isAirplaneModeEnabledAsync",
          ]}
        >
          {offline ? (
            <Alert
              variant="warning"
              title="You're offline"
              description="Transactions will resume once you reconnect."
              style={styles.mb3}
            />
          ) : null}
          <InfoRows
            rows={[
              ["Type", network.type],
              ["Connected", network.isConnected ? "Yes" : "No"],
              ["Internet reachable", network.isInternetReachable ? "Yes" : "No"],
              ["IP address", ip],
              ["Airplane mode", airplane === null ? null : airplane ? "On" : "Off"],
            ]}
          />
          <View style={styles.mt3}>
            <NativeHost matchContents>
              <Button label="Read IP address" variant="outlined" onPress={refresh} />
            </NativeHost>
          </View>
        </Section>

        <Section
          title="Device"
          description="Static constants, read synchronously"
          utilities={["modelName", "osVersion", "deviceType", "isDevice"]}
        >
          <InfoRows
            rows={[
              ["Brand", Device.brand],
              ["Model", Device.modelName],
              ["OS", `${Device.osName ?? ""} ${Device.osVersion ?? ""}`.trim()],
              ["Device type", Device.deviceType === null ? null : DEVICE_TYPE[Device.deviceType]],
              ["Physical device", Device.isDevice ? "Yes" : "No (simulator)"],
              ["Memory", formatGb(Device.totalMemory)],
              ["Year class", Device.deviceYearClass],
            ]}
          />
        </Section>
      </Screen>
    </>
  );
}
