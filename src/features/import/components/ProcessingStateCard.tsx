import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Platform,
} from "react-native";
import LottieView from "lottie-react-native";
import { Icon } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useAppTheme } from "@common/theme/appTheme";

const processingAnimation = require("../../../../assets/animations/travel-is-fun.json");

type Mode = "processing" | "failed";

type Props = {
  mode: Mode;
  message?: string | null;
  loading?: boolean;
  onRetry?: () => void;
  onSecondary?: () => void;
  secondaryLabel?: string;
  showAnimation?: boolean;
};

const ProcessingStateCard: React.FC<Props> = ({
  mode,
  message,
  loading = false,
  onRetry,
  onSecondary,
  secondaryLabel,
  showAnimation = false,
}) => {
  const { t } = useTranslation();
  const { colors, mode: themeMode } = useAppTheme();
  const isProcessing = mode === "processing";
  const isWeb = Platform.OS === "web";

  const indicator = isProcessing ? (
    showAnimation && !isWeb ? (
      <LottieView
        source={processingAnimation}
        autoPlay
        loop
        style={styles.animation}
      />
    ) : (
      <ActivityIndicator color={colors.primary} />
    )
  ) : (
    <Icon source="alert-circle" size={22} color={colors.danger} />
  );

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {isProcessing
              ? t("import:processing.title")
              : t("import:processing.failedTitle")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.secondaryText }]}>
            {message ||
              (isProcessing
                ? t("import:processing.subtitle")
                : t("import:processing.failedSubtitle"))}
          </Text>
        </View>
        {indicator}
      </View>

      <Text style={[styles.hint, { color: colors.secondaryText }]}>
        {isProcessing
          ? t("import:processing.hint")
          : t("import:processing.failedSubtitle")}
      </Text>

      {!isProcessing ? (
        <View style={styles.actions}>
          {onRetry ? (
            <Pressable
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: loading ? 0.7 : 1,
                },
              ]}
              onPress={onRetry}
              disabled={loading}
            >
              <Text
                style={[
                  styles.btnText,
                  {
                    color:
                      themeMode === "dark" ? colors.background : colors.surface,
                  },
                ]}
              >
                {loading
                  ? t("import:processing.retrying")
                  : t("import:processing.retry")}
              </Text>
            </Pressable>
          ) : null}
          {onSecondary && secondaryLabel ? (
            <Pressable
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={onSecondary}
            >
              <Text style={[styles.secondaryText, { color: colors.text }]}>
                {secondaryLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  header: {
    flexDirection: "column",
    gap: 10,
    alignItems: "center",
  },
  animation: {
    width: 72,
    height: 72,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    flexShrink: 1,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 6,
  },
  primaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  btnText: {
    fontSize: 14,
    fontWeight: "700",
  },
  secondaryBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export default ProcessingStateCard;
