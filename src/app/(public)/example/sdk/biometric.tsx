import * as LocalAuthentication from "expo-local-authentication";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Row,
  Switch,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const PIN_KEY = "example.pin";

const TYPE_LABEL: Record<LocalAuthentication.AuthenticationType, string> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: "Fingerprint",
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: "Face",
  [LocalAuthentication.AuthenticationType.IRIS]: "Iris",
};

type Capabilities = {
  hardware: boolean;
  enrolled: boolean;
  types: string;
  secureStore: boolean;
};

type Status = { variant: "success" | "error" | "info"; title: string };

/**
 * expo-local-authentication in front of expo-secure-store: the PIN is kept in
 * the Keychain / Keystore and only read back after a biometric check — the
 * pattern behind "unlock with Face ID" and payment confirmation.
 */
export default function BiometricExample() {
  const styles = useStyles();
  const pin = useNativeState("");

  const [typed, setTyped] = useState("");
  const [allowPasscode, setAllowPasscode] = useState(true);
  const [capabilities, setCapabilities] = useState<Capabilities | null>(null);
  const [hasPin, setHasPin] = useState(false);
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    (async () => {
      const [hardware, enrolled, types, secureStore] = await Promise.all([
        LocalAuthentication.hasHardwareAsync(),
        LocalAuthentication.isEnrolledAsync(),
        LocalAuthentication.supportedAuthenticationTypesAsync(),
        SecureStore.isAvailableAsync(),
      ]);
      setCapabilities({
        hardware,
        enrolled,
        types: types.map((type) => TYPE_LABEL[type]).join(", "),
        secureStore,
      });
      if (secureStore) setHasPin((await SecureStore.getItemAsync(PIN_KEY)) !== null);
    })();
  }, []);

  const authenticate = async (promptMessage: string) => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      disableDeviceFallback: !allowPasscode,
      cancelLabel: "Cancel",
    });
    if (!result.success) {
      setStatus({ variant: "error", title: `Not verified: ${result.error}` });
    }
    return result.success;
  };

  const savePin = async () => {
    if (!/^\d{6}$/.test(typed)) {
      setStatus({ variant: "error", title: "PIN must be exactly 6 digits." });
      return;
    }
    await SecureStore.setItemAsync(PIN_KEY, typed);
    // `useNativeState` returns a mutable native handle, like a ref: writing
    // `.value` clears the field without a re-render.
    // eslint-disable-next-line react-hooks/immutability
    pin.value = "";
    setTyped("");
    setHasPin(true);
    setStatus({ variant: "success", title: "PIN saved to secure storage." });
  };

  const revealPin = async () => {
    if (!(await authenticate("Confirm to reveal your PIN"))) return;
    const stored = await SecureStore.getItemAsync(PIN_KEY);
    setStatus({ variant: "info", title: `Stored PIN: ${stored ?? "none"}` });
  };

  const deletePin = async () => {
    await SecureStore.deleteItemAsync(PIN_KEY);
    setHasPin(false);
    setStatus({ variant: "info", title: "PIN removed." });
  };

  const biometricReady = capabilities?.hardware && capabilities.enrolled;

  return (
    <>
      <Stack.Screen options={{ title: "Biometric & Secure Store" }} />
      <Screen>
        <Section
          title="Device support"
          description="What this device can verify with"
          utilities={[
            "hasHardwareAsync",
            "isEnrolledAsync",
            "supportedAuthenticationTypesAsync",
          ]}
        >
          <InfoRows
            rows={[
              ["Biometric hardware", capabilities?.hardware ? "Yes" : "No"],
              ["Enrolled", capabilities?.enrolled ? "Yes" : "No"],
              ["Types", capabilities?.types],
              ["Secure storage", capabilities?.secureStore ? "Available" : "Unavailable"],
            ]}
          />
        </Section>

        <Section
          title="Authenticate"
          description="Face ID / Touch ID / fingerprint prompt"
          utilities={["authenticateAsync", "disableDeviceFallback"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Switch
                value={allowPasscode}
                onValueChange={setAllowPasscode}
                label="Allow device passcode fallback"
              />
              <Button
                label="Verify it's me"
                disabled={!biometricReady}
                onPress={async () => {
                  if (await authenticate("Verify it's you")) {
                    setStatus({ variant: "success", title: "Verified." });
                  }
                }}
              />
            </Column>
          </NativeHost>
        </Section>

        <Section
          title="Transaction PIN"
          description="Saved encrypted; reading it back requires biometrics"
          utilities={["setItemAsync", "getItemAsync", "deleteItemAsync"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <TextInput
                value={pin}
                onChangeText={setTyped}
                placeholder="6-digit PIN"
                keyboardType="number-pad"
                secureTextEntry
                maxLength={6}
              />
              <Row spacing={8}>
                <Button
                  label="Save"
                  disabled={!capabilities?.secureStore}
                  onPress={savePin}
                />
                <Button
                  label="Reveal"
                  variant="outlined"
                  disabled={!hasPin || !biometricReady}
                  onPress={revealPin}
                />
                <Button
                  label="Delete"
                  variant="text"
                  disabled={!hasPin}
                  onPress={deletePin}
                />
              </Row>
            </Column>
          </NativeHost>
        </Section>

        {status ? (
          <Alert
            variant={status.variant}
            title={status.title}
            onClose={() => setStatus(null)}
            style={styles.mb6}
          />
        ) : null}
      </Screen>
    </>
  );
}
