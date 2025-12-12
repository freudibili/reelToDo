import React from "react";
import { StyleSheet } from "react-native";

import AppScreen from "@common/components/AppScreen";
import { Box, Card, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
  centered?: boolean;
  withCard?: boolean;
  tone?: "light" | "dark";
  backgroundColor?: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
};

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
  footer,
  loading = false,
  centered = true,
  withCard = false,
  tone = "light",
  backgroundColor,
  onBackPress,
  showBackButton = false,
}) => {
  const { colors } = useAppTheme();
  const isDark = tone === "dark";
  const resolvedBackground =
    backgroundColor ??
    (isDark ? colors.surface : colors.background);

  return (
    <AppScreen
      scrollable
      backgroundColor={resolvedBackground}
      withBottomInset
      alignToTabBar={false}
      loading={loading}
      flushBottom
      headerTitle={showBackButton ? "" : undefined}
      headerSubtitle={undefined}
      onBackPress={showBackButton ? onBackPress : undefined}
      headerCompact={showBackButton}
    >
      <Stack
        gap="lg"
        style={[
          styles.container,
          centered ? styles.centered : styles.topAligned,
        ]}
      >
        <Stack align="center" gap="xs">
          <Text variant="title1">{title}</Text>
          {subtitle ? (
            <Text variant="body" tone="muted" align="center">
              {subtitle}
            </Text>
          ) : null}
        </Stack>

        {withCard ? (
          <Card
            padding="lg"
            radius="lg"
            variant={isDark ? "outlined" : "elevated"}
          >
            {children}
          </Card>
        ) : (
          <Box style={styles.content} gap={12}>
            {children}
          </Box>
        )}
      </Stack>

      {footer ? (
        <Box style={styles.footer} gap={10}>
          {footer}
        </Box>
      ) : null}
    </AppScreen>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    gap: 16,
    flex: 1,
  },
  centered: {
    justifyContent: "center",
  },
  topAligned: {
    justifyContent: "flex-start",
  },
  content: {
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
    gap: 12,
  },
  footer: {
    marginTop: 12,
    gap: 10,
  },
});
