import { Blob } from "expo-blob";
import { Stack } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Screen } from "@/shared/components";
import {
  Button,
  Column,
  NativeHost,
  Row,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const INITIAL = JSON.stringify({ trx: "TRX-001", amount: 50000, status: "PAID" });

const hex = (bytes: Uint8Array) =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(" ");

type Details = { size: number; type: string; text?: string; bytes?: string };

/**
 * expo-blob: a web-compatible `Blob` backed by native memory — for building
 * upload payloads, slicing files into chunks, or reading binary responses.
 */
export default function BlobExample() {
  const styles = useStyles();
  const input = useNativeState(INITIAL);

  const [content, setContent] = useState(INITIAL);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [details, setDetails] = useState<Details | null>(null);

  const create = () => {
    const next = new Blob([content], { type: "application/json" });
    setBlob(next);
    setDetails({ size: next.size, type: next.type });
  };

  const readText = async () => {
    if (!blob) return;
    setDetails({ size: blob.size, type: blob.type, text: await blob.text() });
  };

  // `slice` works in bytes, which is how uploads are chunked.
  const sliceFirstBytes = async () => {
    if (!blob) return;
    const head = blob.slice(0, 8);
    const bytes = new Uint8Array(await head.arrayBuffer());
    setDetails({ size: head.size, type: head.type, bytes: hex(bytes) });
  };

  const combine = async () => {
    if (!blob) return;
    const combined = new Blob([blob, "\n", blob], { type: "text/plain" });
    setDetails({ size: combined.size, type: combined.type, text: await combined.text() });
  };

  return (
    <>
      <Stack.Screen options={{ title: "Blob" }} />
      <Screen>
        <Section
          title="Blob"
          description="Create from text, then read it back as text or bytes"
          utilities={["new Blob()", "text()", "slice()", "arrayBuffer()"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <TextInput
                value={input}
                onChangeText={setContent}
                placeholder="Content"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Row spacing={8}>
                <Button label="Create" onPress={create} />
                <Button label="Text" variant="outlined" disabled={!blob} onPress={readText} />
              </Row>
              <Row spacing={8}>
                <Button label="Slice" variant="outlined" disabled={!blob} onPress={sliceFirstBytes} />
                <Button label="Combine" variant="outlined" disabled={!blob} onPress={combine} />
              </Row>
            </Column>
          </NativeHost>

          {details ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  ["Size", `${details.size} bytes`],
                  ["Type", details.type],
                  ...(details.text !== undefined
                    ? [["Text", details.text] as [string, string]]
                    : []),
                  ...(details.bytes !== undefined
                    ? [["Bytes", details.bytes] as [string, string]]
                    : []),
                ]}
              />
            </View>
          ) : null}
        </Section>
      </Screen>
    </>
  );
}
