import { act, render, screen } from "@testing-library/react-native";
import type { SQLiteDatabase } from "expo-sqlite";

import { TransactionHistory } from "@/features/example/components";
import {
  migrate,
  type TransactionRow,
} from "@/features/example/components/TransactionHistory";
import { formatCurrency } from "@/shared/helpers";

import { nativeTexts, pickNative, pressNative } from "../../../helpers/native-ui";

/**
 * SQL itself is SQLite's job; these tests pin what the component asks of it —
 * bound parameters, sign conventions, and re-reading after each write.
 */
let mockRows: TransactionRow[] = [];

const mockDb = {
  getAllAsync: jest.fn(async () => mockRows),
  getFirstAsync: jest.fn(async () => ({
    balance: mockRows.reduce((sum, row) => sum + row.amount, 0),
  })),
  runAsync: jest.fn(),
  execAsync: jest.fn(),
};

jest.mock("expo-sqlite", () => ({
  SQLiteProvider: ({ children }: { children: unknown }) => children,
  useSQLiteContext: () => mockDb,
}));

async function renderHistory() {
  render(<TransactionHistory />);
  await act(async () => {});
}

beforeEach(() => {
  jest.clearAllMocks();
  mockRows = [];
});

describe("TransactionHistory", () => {
  it("shows an empty ledger", async () => {
    await renderHistory();

    expect(screen.getByText("No transactions yet.")).toBeOnTheScreen();
    expect(screen.getByText(`Balance ${formatCurrency(0)}`)).toBeOnTheScreen();
  });

  it("lists stored transactions with the running balance", async () => {
    mockRows = [
      { id: 2, kind: "payment", amount: -10000, created_at: Date.UTC(2026, 8, 20, 3) },
      { id: 1, kind: "topup", amount: 50000, created_at: Date.UTC(2026, 8, 19, 3) },
    ];
    await renderHistory();

    expect(screen.getByText(`Balance ${formatCurrency(40000)}`)).toBeOnTheScreen();
    // Newest first, labelled by kind, amounts signed.
    const texts = nativeTexts();
    const payment = texts.findIndex((text) => text.startsWith("Payment · "));
    const topup = texts.findIndex((text) => text.startsWith("Top-up · "));
    expect(payment).toBeGreaterThan(-1);
    expect(payment).toBeLessThan(topup);
    expect(texts[payment + 1]).toBe(formatCurrency(-10000));
    expect(texts[topup + 1]).toBe(formatCurrency(50000));
  });

  it("records a top-up as a positive amount with bound parameters", async () => {
    await renderHistory();

    await pressNative("Add transaction");

    expect(mockDb.runAsync).toHaveBeenCalledWith(
      "INSERT INTO transactions (kind, amount, created_at) VALUES (?, ?, ?)",
      "topup",
      50000,
      expect.any(Number),
    );
    // Re-read after writing, so the list reflects the database.
    expect(mockDb.getAllAsync).toHaveBeenCalledTimes(2);
  });

  it("records payments and transfers as negative amounts", async () => {
    await renderHistory();

    await pickNative("payment", 0);
    await pickNative("100000", 1);
    await pressNative("Add transaction");

    expect(mockDb.runAsync).toHaveBeenLastCalledWith(
      expect.any(String),
      "payment",
      -100000,
      expect.any(Number),
    );
  });

  it("clears the ledger", async () => {
    await renderHistory();

    await pressNative("Clear");

    expect(mockDb.runAsync).toHaveBeenCalledWith("DELETE FROM transactions");
  });
});

describe("migrate", () => {
  const dbAt = (version: number) =>
    ({
      getFirstAsync: jest.fn(async () => ({ user_version: version })),
      execAsync: jest.fn(),
    }) as unknown as SQLiteDatabase & { execAsync: jest.Mock };

  it("creates the schema on a fresh database and records the version", async () => {
    const db = dbAt(0);

    await migrate(db);

    expect(db.execAsync).toHaveBeenCalledWith(
      expect.stringContaining("CREATE TABLE IF NOT EXISTS transactions"),
    );
    expect(db.execAsync).toHaveBeenLastCalledWith("PRAGMA user_version = 1");
  });

  it("does nothing on an up-to-date database", async () => {
    const db = dbAt(1);

    await migrate(db);

    expect(db.execAsync).not.toHaveBeenCalled();
  });
});
