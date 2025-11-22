import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { IconButton } from "react-native-paper";

export interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  onBackPress?: () => void;
  right?: React.ReactNode;
  compact?: boolean;
  alignLeftWhenNoBack?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  eyebrow,
  onBackPress,
  right,
  compact = false,
  alignLeftWhenNoBack = true,
}) => {
  const titleStyle = compact ? styles.headerTitleCompact : styles.headerTitle;
  const wrapperStyle = compact ? styles.headerCompact : styles.header;
  const showPlaceholder = !onBackPress && !alignLeftWhenNoBack;

  return (
    <View style={wrapperStyle}>
      {onBackPress ? (
        <IconButton
          icon="chevron-left"
          size={24}
          onPress={onBackPress}
          style={styles.backButton}
        />
      ) : showPlaceholder ? (
        <View style={styles.backPlaceholder} />
      ) : null}

      <View style={styles.headerText}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={titleStyle}>{title}</Text>
        {subtitle ? (
          <Text
            style={[
              styles.headerSubtitle,
              compact && styles.headerSubtitleCompact,
            ]}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={styles.headerRight}>{right}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  headerCompact: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  backButton: {
    marginLeft: -8,
    marginRight: 4,
  },
  backPlaceholder: {
    width: 40,
  },
  headerText: { flex: 1 },
  eyebrow: {
    color: "#9aa0ad",
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: "none",
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerTitleCompact: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  headerSubtitle: { marginTop: 2, color: "#8a8f98" },
  headerSubtitleCompact: { fontSize: 12.5, color: "#8a8f98" },
  headerRight: { minWidth: 40, alignItems: "flex-end" },
});

export default ScreenHeader;
