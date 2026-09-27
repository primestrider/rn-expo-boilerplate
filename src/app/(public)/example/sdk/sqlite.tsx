import { Stack } from "expo-router";

import { Section, TransactionHistory } from "@/features/example/components";
import { Screen } from "@/shared/components";

/**
 * expo-sqlite: the transaction list a super app keeps on device so history
 * opens instantly and works offline. The logic lives in `TransactionHistory`,
 * which has a web fallback — route files cannot use platform extensions.
 */
export default function SqliteExample() {
  return (
    <>
      <Stack.Screen options={{ title: "SQLite" }} />
      <Screen>
        <Section
          title="Transaction history"
          description="Stored in a local database that survives restarts"
          utilities={[
            "SQLiteProvider",
            "onInit",
            "useSQLiteContext",
            "runAsync",
            "getAllAsync",
          ]}
        >
          <TransactionHistory />
        </Section>
      </Screen>
    </>
  );
}
