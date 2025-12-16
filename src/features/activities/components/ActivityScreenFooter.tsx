import React from "react";
import { View, StyleSheet } from "react-native";

import { Button } from "@common/designSystem";

type ActivityScreenFooterProps = {
  onCancel: () => void;
  onPrimary: () => void;
  cancelLabel: string;
  primaryLabel: string;
  cancelLoading?: boolean;
  cancelDisabled?: boolean;
  primaryDisabled?: boolean;
  primaryLoading?: boolean;
  primaryVisible?: boolean;
};

const ActivityScreenFooter: React.FC<ActivityScreenFooterProps> = ({
  onCancel,
  onPrimary,
  cancelLabel,
  primaryLabel,
  cancelLoading = false,
  cancelDisabled = false,
  primaryDisabled = false,
  primaryLoading = false,
  primaryVisible = true,
}) => {
  return (
    <View style={styles.container}>
      <Button
        label={cancelLabel}
        variant="secondary"
        onPress={onCancel}
        disabled={cancelLoading || cancelDisabled}
        loading={cancelLoading}
        style={styles.button}
        shadow={false}
      />
      {primaryVisible ? (
        <Button
          label={primaryLabel}
          variant="primary"
          onPress={onPrimary}
          disabled={primaryDisabled}
          loading={primaryLoading}
          style={styles.button}
          shadow={false}
        />
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 10,
  },
  button: {
    flex: 1,
  },
});

export default ActivityScreenFooter;
