import { render, screen } from "@testing-library/react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { ReactNode } from "react";

import ShareExample from "@/app/(public)/example/sdk/share";
import { formatCurrency } from "@/shared/helpers";

import { infoValue, pickNative, pressNative, typeNative } from "../../helpers/native-ui";

jest.mock("expo-router", () => ({
  Stack: { Screen: () => null },
  Link: ({ children }: { children: ReactNode }) => children,
}));

jest.mock("expo-print", () => ({
  printToFileAsync: jest.fn(),
  printAsync: jest.fn(),
}));

jest.mock("expo-sharing", () => ({
  isAvailableAsync: jest.fn(),
  shareAsync: jest.fn(),
}));

const print = jest.mocked(Print);
const sharing = jest.mocked(Sharing);

/** The HTML handed to the most recent print call. */
const printedHtml = () =>
  print.printToFileAsync.mock.lastCall?.[0]?.html ?? print.printAsync.mock.lastCall?.[0]?.html;

beforeEach(() => {
  jest.clearAllMocks();
  sharing.isAvailableAsync.mockResolvedValue(true);
  print.printToFileAsync.mockResolvedValue({
    uri: "file:///cache/Print/receipt-1.pdf",
    numberOfPages: 1,
  });
});

describe("Share & Print example", () => {
  it("renders the receipt to a PDF and shares it as a PDF", async () => {
    render(<ShareExample />);

    await pressNative("Share PDF");

    expect(printedHtml()).toContain("Kopi Kenangan");
    expect(printedHtml()).toContain(formatCurrency(25000));
    expect(sharing.shareAsync).toHaveBeenCalledWith("file:///cache/Print/receipt-1.pdf", {
      mimeType: "application/pdf",
      UTI: "com.adobe.pdf",
      dialogTitle: "Share receipt",
    });
    expect(infoValue("File")).toBe("receipt-1.pdf");
    expect(infoValue("Pages")).toBe("1");
  });

  it("uses the chosen merchant and keeps only the digits of the amount", async () => {
    render(<ShareExample />);

    await pickNative("PLN Token");
    await typeNative("Rp 75.000");
    await pressNative("Share PDF");

    expect(printedHtml()).toContain("PLN Token");
    expect(printedHtml()).toContain(formatCurrency(75000));
  });

  it("explains when sharing is unavailable, without rendering a file", async () => {
    sharing.isAvailableAsync.mockResolvedValue(false);
    render(<ShareExample />);

    await pressNative("Share PDF");

    expect(print.printToFileAsync).not.toHaveBeenCalled();
    expect(
      screen.getByText("Sharing is not available on this platform."),
    ).toBeOnTheScreen();
  });

  it("sends the same receipt to the system print dialog", async () => {
    render(<ShareExample />);

    await pressNative("Print");

    expect(print.printAsync).toHaveBeenCalledTimes(1);
    expect(printedHtml()).toContain("Payment receipt");
  });

  it("shows a print failure instead of throwing", async () => {
    print.printAsync.mockRejectedValue(new Error("Printing was cancelled"));
    render(<ShareExample />);

    await pressNative("Print");

    expect(screen.getByText("Printing was cancelled")).toBeOnTheScreen();
  });
});
