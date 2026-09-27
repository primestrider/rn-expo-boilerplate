import { Card } from "@/shared/components";
import { Column, NativeHost, Row, Spacer, Text } from "@/shared/native-ui";
import { useTheme } from "@/styles";

type Props = {
  /** `[label, value]` pairs; empty values render as an em dash. */
  rows: [string, string | number | boolean | null | undefined][];
};

/** Label/value rows rendered natively — for showing what an SDK call returned. */
export function InfoRows({ rows }: Readonly<Props>) {
  const { colors } = useTheme();

  return (
    <Card variant="outlined">
      <NativeHost matchContents={{ vertical: true }}>
        <Column spacing={10}>
          {rows.map(([label, value], index) => (
            <Row key={`${label}-${index}`} spacing={8}>
              <Text textStyle={{ color: colors.muted }}>{label}</Text>
              <Spacer flexible />
              <Text>{value == null || value === "" ? "—" : String(value)}</Text>
            </Row>
          ))}
        </Column>
      </NativeHost>
    </Card>
  );
}
