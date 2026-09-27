import type { PermissionResponse } from "expo";
import { PermissionStatus } from "expo";
import { render, screen } from "@testing-library/react-native";
import { Linking, Text } from "react-native";

import { PermissionGate } from "@/features/example/components";
import { Spinner } from "@/shared/components";

import { nativeButton, pressNative } from "../../../helpers/native-ui";

const permission = (
  granted: boolean,
  canAskAgain = true,
): PermissionResponse => ({
  granted,
  canAskAgain,
  expires: "never",
  status: granted ? PermissionStatus.GRANTED : PermissionStatus.DENIED,
});

function renderGate(value: PermissionResponse | null, onRequest = jest.fn()) {
  render(
    <PermissionGate
      permission={value}
      onRequest={onRequest}
      reason="Camera access is needed."
    >
      <Text>Protected content</Text>
    </PermissionGate>,
  );
  return onRequest;
}

describe("PermissionGate", () => {
  it("shows a spinner while the permission is still loading", () => {
    renderGate(null);

    expect(screen.UNSAFE_getByType(Spinner)).toBeTruthy();
    expect(screen.queryByText("Protected content")).toBeNull();
  });

  it("renders its children once the permission is granted", () => {
    renderGate(permission(true));

    expect(screen.getByText("Protected content")).toBeOnTheScreen();
  });

  it("explains why and asks when the permission is not granted", async () => {
    const onRequest = renderGate(permission(false));

    expect(screen.queryByText("Protected content")).toBeNull();
    expect(screen.getByText("Camera access is needed.")).toBeOnTheScreen();

    await pressNative("Grant access");

    expect(onRequest).toHaveBeenCalledTimes(1);
  });

  it("sends the user to Settings once the OS will no longer prompt", async () => {
    const openSettings = jest
      .spyOn(Linking, "openSettings")
      .mockResolvedValue(undefined);
    const onRequest = renderGate(permission(false, false));

    expect(
      screen.getByText("Camera access is needed. Enable it in Settings to continue."),
    ).toBeOnTheScreen();
    expect(nativeButton("Open Settings")).toBeTruthy();

    await pressNative("Open Settings");

    expect(openSettings).toHaveBeenCalledTimes(1);
    expect(onRequest).not.toHaveBeenCalled();
  });
});
