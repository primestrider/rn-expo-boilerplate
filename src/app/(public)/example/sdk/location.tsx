import * as Location from "expo-location";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { InfoRows, PermissionGate, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Switch,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const ACCURACY = {
  low: Location.Accuracy.Low,
  balanced: Location.Accuracy.Balanced,
  high: Location.Accuracy.High,
} as const;

type AccuracyKey = keyof typeof ACCURACY;

/**
 * expo-location: a one-off fix, live tracking and reverse geocoding — the
 * pieces behind "deliver to", nearby merchants and ride pickup.
 */
export default function LocationExample() {
  const styles = useStyles();
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const [accuracy, setAccuracy] = useState<AccuracyKey>("balanced");
  const [watching, setWatching] = useState(false);
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState<Location.LocationObject | null>(null);
  const [address, setAddress] = useState<Location.LocationGeocodedAddress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const locate = async () => {
    setLoading(true);
    setError(null);
    try {
      const current = await Location.getCurrentPositionAsync({
        accuracy: ACCURACY[accuracy],
      });
      setPosition(current);
      const [place] = await Location.reverseGeocodeAsync(current.coords);
      setAddress(place ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not get a location.");
    } finally {
      setLoading(false);
    }
  };

  // The subscription lives exactly as long as the switch is on.
  useEffect(() => {
    if (!watching || !permission?.granted) return;

    let subscription: Location.LocationSubscription | undefined;
    let cancelled = false;

    Location.watchPositionAsync(
      { accuracy: ACCURACY[accuracy], distanceInterval: 5 },
      setPosition,
      (reason) => setError(reason),
    ).then((sub) => {
      if (cancelled) sub.remove();
      else subscription = sub;
    });

    return () => {
      cancelled = true;
      subscription?.remove();
    };
  }, [watching, accuracy, permission?.granted]);

  const coords = position?.coords;

  return (
    <>
      <Stack.Screen options={{ title: "Location" }} />
      <Screen>
        <PermissionGate
          permission={permission}
          onRequest={requestPermission}
          reason="Location access is needed to show where you are."
        >
          <Section
            title="Position"
            description="One-off fix, or live updates every 5 meters"
            utilities={[
              "getCurrentPositionAsync",
              "watchPositionAsync",
              "reverseGeocodeAsync",
              "Accuracy",
            ]}
          >
            <NativeHost matchContents={{ vertical: true }}>
              <Column spacing={12}>
                <Picker
                  selectedValue={accuracy}
                  onValueChange={(value) => setAccuracy(value as AccuracyKey)}
                >
                  <Picker.Item label="Low accuracy" value="low" />
                  <Picker.Item label="Balanced" value="balanced" />
                  <Picker.Item label="High accuracy" value="high" />
                </Picker>
                <Switch
                  value={watching}
                  onValueChange={setWatching}
                  label="Watch position"
                />
                <Button
                  label={loading ? "Locating…" : "Get current location"}
                  disabled={loading}
                  onPress={locate}
                />
              </Column>
            </NativeHost>

            {error ? (
              <Alert variant="error" title={error} style={styles.mt3} />
            ) : null}

            <View style={styles.mt4}>
              <InfoRows
                rows={[
                  ["Latitude", coords?.latitude.toFixed(6)],
                  ["Longitude", coords?.longitude.toFixed(6)],
                  ["Accuracy", coords?.accuracy && `±${Math.round(coords.accuracy)} m`],
                  [
                    "Updated",
                    position && new Date(position.timestamp).toLocaleTimeString(),
                  ],
                ]}
              />
            </View>
          </Section>

          <Section
            title="Address"
            description="Reverse-geocoded from the last one-off fix"
            utilities={["LocationGeocodedAddress"]}
          >
            <InfoRows
              rows={[
                ["Street", address?.street],
                ["District", address?.district],
                ["City", address?.city],
                ["Region", address?.region],
                ["Postal code", address?.postalCode],
                ["Country", address?.country],
              ]}
            />
          </Section>
        </PermissionGate>
      </Screen>
    </>
  );
}
