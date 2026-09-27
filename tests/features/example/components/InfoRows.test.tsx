import { render } from "@testing-library/react-native";

import { InfoRows } from "@/features/example/components";

import { infoValue, nativeTexts } from "../../../helpers/native-ui";

describe("InfoRows", () => {
  it("renders each label next to its value", () => {
    render(
      <InfoRows
        rows={[
          ["City", "Jakarta"],
          ["Accuracy", 12],
        ]}
      />,
    );

    expect(infoValue("City")).toBe("Jakarta");
    expect(infoValue("Accuracy")).toBe("12");
  });

  it("shows an em dash for missing values", () => {
    render(
      <InfoRows
        rows={[
          ["Street", null],
          ["District", undefined],
          ["Postal code", ""],
        ]}
      />,
    );

    expect(infoValue("Street")).toBe("—");
    expect(infoValue("District")).toBe("—");
    expect(infoValue("Postal code")).toBe("—");
  });

  it("keeps rows that share a label", () => {
    render(
      <InfoRows
        rows={[
          ["report.pdf", "1.0 KB"],
          ["report.pdf", "2.0 KB"],
        ]}
      />,
    );

    expect(nativeTexts()).toEqual(["report.pdf", "1.0 KB", "report.pdf", "2.0 KB"]);
  });
});
