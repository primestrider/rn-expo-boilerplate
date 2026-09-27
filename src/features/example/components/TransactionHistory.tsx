import {
  SQLiteProvider,
  useSQLiteContext,
  type SQLiteDatabase,
} from "expo-sqlite";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { AppText } from "@/shared/components";
import { formatCurrency, formatDateTime } from "@/shared/helpers";
import { Button, Column, NativeHost, Picker, Row } from "@/shared/native-ui";
import { useStyles } from "@/styles";

import { InfoRows } from "./InfoRows";

export const TRANSACTIONS_DB = "example-transactions.db";

const SCHEMA_VERSION = 1;

const KINDS = {
  topup: { label: "Top-up", sign: 1 },
  payment: { label: "Payment", sign: -1 },
  transfer: { label: "Transfer", sign: -1 },
} as const;

type Kind = keyof typeof KINDS;

const AMOUNTS = ["10000", "50000", "100000"] as const;

export type TransactionRow = {
  id: number;
  kind: Kind;
  amount: number;
  created_at: number;
};

/**
 * Schema migrations keyed on SQLite's own `user_version`, so each runs once
 * per device and a fresh install gets them all in order.
 */
export async function migrate(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const version = row?.user_version ?? 0;
  if (version >= SCHEMA_VERSION) return;

  if (version < 1) {
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        kind TEXT NOT NULL,
        amount INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }
  await db.execAsync(`PRAGMA user_version = ${SCHEMA_VERSION}`);
}

type Ledger = { rows: TransactionRow[]; balance: number };

/** The latest 20 transactions and the balance over all of them. */
async function readLedger(db: SQLiteDatabase): Promise<Ledger> {
  const rows = await db.getAllAsync<TransactionRow>(
    "SELECT * FROM transactions ORDER BY created_at DESC, id DESC LIMIT 20",
  );
  const totals = await db.getFirstAsync<{ balance: number }>(
    "SELECT COALESCE(SUM(amount), 0) AS balance FROM transactions",
  );
  return { rows, balance: totals?.balance ?? 0 };
}

function History() {
  const db = useSQLiteContext();
  const styles = useStyles();

  const [kind, setKind] = useState<Kind>("topup");
  const [amount, setAmount] = useState<string>(AMOUNTS[1]);
  const [{ rows, balance }, setLedger] = useState<Ledger>({ rows: [], balance: 0 });

  useEffect(() => {
    let active = true;
    readLedger(db).then((ledger) => {
      if (active) setLedger(ledger);
    });
    return () => {
      active = false;
    };
  }, [db]);

  const load = async () => setLedger(await readLedger(db));

  // Bound parameters, never string concatenation, for anything user-chosen.
  const add = async () => {
    await db.runAsync(
      "INSERT INTO transactions (kind, amount, created_at) VALUES (?, ?, ?)",
      kind,
      KINDS[kind].sign * Number(amount),
      Date.now(),
    );
    await load();
  };

  const clear = async () => {
    await db.runAsync("DELETE FROM transactions");
    await load();
  };

  return (
    <View>
      <NativeHost matchContents={{ vertical: true }}>
        <Column spacing={12}>
          <Row spacing={8}>
            <Picker
              selectedValue={kind}
              onValueChange={(value) => setKind(value as Kind)}
            >
              {(Object.keys(KINDS) as Kind[]).map((key) => (
                <Picker.Item key={key} label={KINDS[key].label} value={key} />
              ))}
            </Picker>
            <Picker selectedValue={amount} onValueChange={setAmount}>
              {AMOUNTS.map((value) => (
                <Picker.Item
                  key={value}
                  label={formatCurrency(Number(value))}
                  value={value}
                />
              ))}
            </Picker>
          </Row>
          <Row spacing={8}>
            <Button label="Add transaction" onPress={add} />
            <Button label="Clear" variant="text" onPress={clear} />
          </Row>
        </Column>
      </NativeHost>

      <AppText variant="title" style={styles.mt4}>
        Balance {formatCurrency(balance)}
      </AppText>

      <View style={styles.mt3}>
        {rows.length === 0 ? (
          <AppText color="muted">No transactions yet.</AppText>
        ) : (
          <InfoRows
            rows={rows.map((row) => [
              `${KINDS[row.kind].label} · ${formatDateTime(new Date(row.created_at), "dd MMM, HH:mm")}`,
              formatCurrency(row.amount),
            ])}
          />
        )}
      </View>
    </View>
  );
}

/**
 * An offline transaction ledger in expo-sqlite. The provider opens the
 * database and runs migrations before anything below it can query.
 */
export function TransactionHistory() {
  return (
    <SQLiteProvider databaseName={TRANSACTIONS_DB} onInit={migrate}>
      <History />
    </SQLiteProvider>
  );
}
