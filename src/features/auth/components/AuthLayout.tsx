import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppScreen from "@common/components/AppScreen";
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
}) => {
  const { colors } = useAppTheme();
  const isDark = tone === "dark";
  const resolvedBackground =
    backgroundColor ??
    (isDark ? colors.surface : colors.background);
  const titleColor = colors.text;
  const subtitleColor = colors.secondaryText;

  return (
    <AppScreen
      scrollable
      backgroundColor={resolvedBackground}
      withBottomInset
      alignToTabBar={false}
      loading={loading}
      flushBottom
    >
      <View
        style={[
          styles.container,
          centered && styles.centered,
          !centered && styles.topAligned,
        ]}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: titleColor }]}>{title}</Text>
          {subtitle ? (
            <Text style={[styles.subtitle, { color: subtitleColor }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        {withCard ? (
          <View
            style={[styles.card, { backgroundColor: colors.surface }]}
          >
            {children}
          </View>
        ) : (
          <View style={styles.content}>{children}</View>
        )}
      </View>

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </AppScreen>
  );
};

export default AuthLayout;

const styles = StyleSheet.create({
  container: {
    paddingTop: 18,
    gap: 16,
    minHeight: "100%",
  },
  centered: {
    justifyContent: "center",
  },
  topAligned: {
    justifyContent: "flex-start",
  },
  header: {
    alignItems: "center",
    gap: 6,
  },
  card: {
    borderRadius: 16,
    padding: 18,
    gap: 12,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
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
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    marginTop: 4,
  },
});
