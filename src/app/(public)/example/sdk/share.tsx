import * as Print from "expo-print";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import { useState } from "react";
import { View } from "react-native";

import { InfoRows, Section } from "@/features/example/components";
import { Alert, Screen } from "@/shared/components";
import { formatCurrency, formatDateTime } from "@/shared/helpers";
import {
  Button,
  Column,
  NativeHost,
  Picker,
  Row,
  TextInput,
  useNativeState,
} from "@/shared/native-ui";
import { useStyles } from "@/styles";

const MERCHANTS = ["Kopi Kenangan", "PLN Token", "Telkomsel Pulsa"] as const;

type Receipt = { merchant: string; amount: number; reference: string; paidAt: Date };

/**
 * The receipt is plain HTML: expo-print renders it natively into a PDF, so
 * layout is ordinary CSS. Only fixed merchant names and a number are
 * interpolated, so nothing here needs escaping.
 */
function receiptHtml({ merchant, amount, reference, paidAt }: Receipt) {
  return `<!doctype html>
<html>
  <body style="font-family: -apple-system, Roboto, sans-serif; padding: 32px;">
    <h1 style="margin: 0 0 4px;">Payment receipt</h1>
    <p style="color: #6b7280; margin: 0 0 24px;">${formatDateTime(paidAt)}</p>
    <table style="width: 100%; border-collapse: collapse; font-size: 16px;">
      <tr><td>Merchant</td><td style="text-align: right;">${merchant}</td></tr>
      <tr><td>Reference</td><td style="text-align: right;">${reference}</td></tr>
      <tr><td style="padding-top: 16px;"><b>Total</b></td>
        <td style="padding-top: 16px; text-align: right;"><b>${formatCurrency(amount)}</b></td></tr>
    </table>
  </body>
</html>`;
}

/**
 * expo-print turns an e-receipt into a PDF (or sends it to a printer), and
 * expo-sharing hands the file to WhatsApp, email or Files.
 */
export default function ShareExample() {
  const styles = useStyles();
  const amountInput = useNativeState("25000");

  const [merchant, setMerchant] = useState<string>(MERCHANTS[0]);
  const [amount, setAmount] = useState("25000");
  const [file, setFile] = useState<{ uri: string; pages: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const receipt = (): Receipt => ({
    merchant,
    amount: Number(amount.replace(/\D/g, "")) || 0,
    reference: `TRX-${Date.now().toString(36).toUpperCase()}`,
    paidAt: new Date(),
  });

  const run = async (task: () => Promise<void>) => {
    setError(null);
    try {
      await task();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const sharePdf = () =>
    run(async () => {
      if (!(await Sharing.isAvailableAsync())) {
        throw new Error("Sharing is not available on this platform.");
      }
      const { uri, numberOfPages } = await Print.printToFileAsync({
        html: receiptHtml(receipt()),
      });
      setFile({ uri, pages: numberOfPages });
      await Sharing.shareAsync(uri, {
        mimeType: "application/pdf",
        UTI: "com.adobe.pdf",
        dialogTitle: "Share receipt",
      });
    });

  const print = () => run(() => Print.printAsync({ html: receiptHtml(receipt()) }));

  return (
    <>
      <Stack.Screen options={{ title: "Share & Print" }} />
      <Screen>
        <Section
          title="E-receipt"
          description="Rendered from HTML into a PDF, then shared or printed"
          utilities={["printToFileAsync", "shareAsync", "printAsync"]}
        >
          <NativeHost matchContents={{ vertical: true }}>
            <Column spacing={12}>
              <Picker selectedValue={merchant} onValueChange={setMerchant}>
                {MERCHANTS.map((name) => (
                  <Picker.Item key={name} label={name} value={name} />
                ))}
              </Picker>
              <TextInput
                value={amountInput}
                onChangeText={setAmount}
                placeholder="Amount (IDR)"
                keyboardType="number-pad"
              />
              <Row spacing={8}>
                <Button label="Share PDF" onPress={sharePdf} />
                <Button label="Print" variant="outlined" onPress={print} />
              </Row>
            </Column>
          </NativeHost>

          {error ? (
            <Alert variant="error" title={error} style={styles.mt3} />
          ) : null}

          {file ? (
            <View style={styles.mt3}>
              <InfoRows
                rows={[
                  ["File", file.uri.split("/").pop()],
                  ["Pages", file.pages],
                ]}
              />
            </View>
          ) : null}
        </Section>
      </Screen>
    </>
  );
}
