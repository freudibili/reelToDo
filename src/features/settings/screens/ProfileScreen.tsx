import React, { useEffect, useState } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { TextInput, Button, HelperText } from "react-native-paper";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "../store/settingsSelectors";
import { saveProfile } from "../store/settingsSlice";

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();

  const profile = useAppSelector(settingsSelectors.profile);
  const loading = useAppSelector(settingsSelectors.loading);

  const [fullName, setFullName] = useState(profile.fullName);
  const [address, setAddress] = useState(profile.address);

  useEffect(() => {
    setFullName(profile.fullName);
    setAddress(profile.address);
  }, [profile.fullName, profile.address]);

  const handleSave = () => {
    void dispatch(
      saveProfile({
        fullName: fullName.trim() || profile.fullName,
        email: profile.email,
        address: address.trim(),
      })
    )
      .unwrap()
      .then(() => router.back());
  };

  return (
    <AppScreen scrollable loading={loading}>
      <ScreenHeader
        title={t("settings:profile.title")}
        subtitle={t("settings:profile.subtitle")}
        onBackPress={() => router.back()}
      />

      <View style={styles.form}>
        <TextInput
          label={t("settings:profile.fullName")}
          value={fullName}
          onChangeText={setFullName}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />
        <TextInput
          label={t("settings:profile.email")}
          value={profile.email}
          mode="outlined"
          disabled
          style={styles.input}
        />
        <TextInput
          label={t("settings:profile.address")}
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          style={styles.input}
          autoCapitalize="words"
        />
        <HelperText type="info" visible>
          {t("settings:profile.helper")}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          {t("common:buttons.saveChanges")}
        </Button>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 12,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#fff",
  },
  button: {
    marginTop: 4,
    borderRadius: 10,
  },
  buttonContent: {
    paddingVertical: 6,
  },
});

export default ProfileScreen;
