import type { PermissionResponse } from "expo";
import { Contact, ContactField, getPermissionsAsync, requestPermissionsAsync } from "expo-contacts";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { InfoRows, PermissionGate, Section } from "@/features/example/components";
import { Alert, AppText, Screen } from "@/shared/components";
import {
  Button,
  NativeHost,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const FIELDS = [ContactField.FULL_NAME, ContactField.PHONES] as const;

type Recipient = { id: string; name: string | null; phone: string | null };

const toRecipient = (details: {
  id: string;
  fullName: string | null;
  phones: { number?: string }[];
}): Recipient => ({
  id: details.id,
  name: details.fullName,
  phone: details.phones[0]?.number ?? null,
});

/**
 * expo-contacts: pick a recipient for a transfer or a phone top-up, either
 * from the system contact picker or by searching the address book.
 */
export default function ContactsExample() {
  const styles = useStyles();
  const query = useNativeState("");

  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const [count, setCount] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Recipient[]>([]);
  const [picked, setPicked] = useState<Recipient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPermissionsAsync().then(setPermission);
  }, []);

  useEffect(() => {
    if (permission?.granted) Contact.getCount().then(setCount);
  }, [permission?.granted]);

  // Debounced so each keystroke doesn't hit the address book.
  useEffect(() => {
    if (!permission?.granted) return;
    const timer = setTimeout(async () => {
      const details = await Contact.getAllDetails(FIELDS, {
        name: search || undefined,
        limit: 10,
      });
      setResults(details.map(toRecipient));
    }, 250);
    return () => clearTimeout(timer);
  }, [search, permission?.granted]);

  const pickContact = async () => {
    try {
      setError(null);
      const contact = await Contact.presentPicker();
      if (contact) setPicked(toRecipient(await contact.getDetails(FIELDS)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Contact picker failed.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Contacts" }} />
      <Screen>
        <Section
          title="System picker"
          description="The OS contact picker — the user shares one contact"
          utilities={["Contact.presentPicker", "getDetails"]}
        >
          <NativeHost matchContents>
            <Button label="Choose recipient" onPress={pickContact} />
          </NativeHost>
          {error ? (
            <Alert variant="error" title={error} style={styles.mt3} />
          ) : null}
          {picked ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  ["Name", picked.name],
                  ["Phone", picked.phone],
                ]}
              />
            </View>
          ) : null}
        </Section>

        <PermissionGate
          permission={permission}
          onRequest={async () => setPermission(await requestPermissionsAsync())}
          reason="Contacts access is needed to search your address book."
        >
          <Section
            title="Search"
            description={
              count === null ? "Search by name" : `Search ${count} contacts by name`
            }
            utilities={["Contact.getAllDetails", "Contact.getCount", "limit"]}
          >
            <NativeHost matchContents={{ vertical: true }}>
                <TextInput
                  value={query}
                  onChangeText={setSearch}
                  placeholder="Name"
                  autoCorrect={false}
                />
            </NativeHost>
            <View style={styles.mt3}>
              {results.length === 0 ? (
                <AppText color="muted">No contacts found.</AppText>
              ) : (
                <InfoRows
                  rows={results.map((r) => [r.name ?? "Unnamed", r.phone])}
                />
              )}
            </View>
          </Section>
        </PermissionGate>
      </Screen>
    </>
  );
}
