import { router, usePathname } from "expo-router";
import { useShareIntent } from "expo-share-intent";
import React, { useEffect, useRef } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import Screen from "@common/components/AppScreen";
import { useAppTheme } from "@common/theme/appTheme";

const NotFoundScreen = () => {
  const pathname = usePathname();
  const { colors } = useAppTheme();
  const hasRedirectedRef = useRef(false);
  const { isReady, hasShareIntent } = useShareIntent();

  useEffect(() => {
    if (hasRedirectedRef.current) return;
    if (!isReady) return;
    if (hasShareIntent) return;
    const normalized = pathname?.startsWith("/")
      ? pathname.slice(1)
      : pathname ?? "";

    if (normalized.startsWith("dataUrl=")) {
      hasRedirectedRef.current = true;
      router.replace({ pathname: "/import", params: { from: "share" } });
    }
  }, [hasShareIntent, isReady, pathname]);

  return (
    <Screen>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.primary }]}>
          Oops, we could not find that screen
        </Text>
        <Text style={[styles.message, { color: colors.secondaryText }]}>
          Let&apos;s head back home and try again.
        </Text>
        <Pressable
          onPress={() => router.replace("/")}
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Go home</Text>
        </Pressable>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  message: {
    fontSize: 15,
    textAlign: "center",
  },
  button: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});

export default NotFoundScreen;
