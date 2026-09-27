import { Alert } from "@/shared/components";

/**
 * expo-sqlite on web runs on a WebAssembly build that needs Metro to serve
 * `.wasm` and the page to send cross-origin isolation headers. The boilerplate
 * does not set those up, so web gets this note instead of a broken bundle.
 */
export function TransactionHistory() {
  return (
    <Alert
      variant="info"
      title="SQLite runs on iOS and Android here"
      description="The web build needs extra Metro and header setup for expo-sqlite's WebAssembly engine."
    />
  );
}
