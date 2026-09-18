import { Stack, useRouter, type LinkProps } from "expo-router";

import { componentGroups } from "@/example/data/components";
import { AppText, Card, Screen } from "@/shared/components";
import { useStyles } from "@/styles";

export default function ComponentsIndex() {
  const styles = useStyles();
  const router = useRouter();

  return (
    <>
      <Stack.Screen options={{ title: "Components" }} />
      <Screen contentContainerStyle={styles.gap3}>
        <AppText variant="h2">Component Library</AppText>
        <AppText variant="caption" color="muted" style={styles.mb3}>
          Reusable components built on the same utility styles — rounded 2xl
          surfaces, fully rounded controls, themed light and dark.
        </AppText>

        {componentGroups.map((group) => (
          <Card
            key={group.title}
            variant="outlined"
            onPress={() => router.push(group.href as LinkProps["href"])}
          >
            <Card.Header title={group.title} subtitle={group.description} />
            <Card.Body>
              <AppText variant="mono" color="primary">
                {group.components.join(" · ")}
              </AppText>
            </Card.Body>
          </Card>
        ))}
      </Screen>
    </>
  );
}
