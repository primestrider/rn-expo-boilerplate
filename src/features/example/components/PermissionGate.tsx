import type { PermissionResponse } from "expo";
import type { ReactNode } from "react";
import { Linking } from "react-native";

import { AppText, Card, Spinner } from "@/shared/components";
import { Button, NativeHost } from "@/shared/native-ui";
import { useStyles } from "@/styles";

type Props = {
  /** The first item of an Expo permission hook, e.g. `useCameraPermissions()`. */
  permission: PermissionResponse | null;
  /** The second item of the same hook. */
  onRequest: () => unknown;
  /** Why the app needs access, shown before asking. */
  reason: string;
  children: ReactNode;
};

/**
 * Renders `children` once a runtime permission is granted, otherwise explains
 * why it is needed and asks. When the OS will no longer show the prompt
 * (`canAskAgain` false), the button opens the app's settings instead.
 */
export function PermissionGate({
  permission,
  onRequest,
  reason,
  children,
}: Readonly<Props>) {
  const styles = useStyles();

  if (!permission) return <Spinner />;
  if (permission.granted) return <>{children}</>;

  const blocked = !permission.canAskAgain;

  return (
    <Card variant="outlined">
      <AppText color="muted" style={styles.mb3}>
        {blocked ? `${reason} Enable it in Settings to continue.` : reason}
      </AppText>
      <NativeHost matchContents>
        <Button
          label={blocked ? "Open Settings" : "Grant access"}
          onPress={() => (blocked ? Linking.openSettings() : onRequest())}
        />
      </NativeHost>
    </Card>
  );
}
