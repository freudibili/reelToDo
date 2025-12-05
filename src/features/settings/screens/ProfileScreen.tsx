import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import { settingsSelectors } from "../store/settingsSelectors";
import { useAppTheme } from "@common/theme/appTheme";
import { saveProfile } from "../store/settingsSlice";
import ProfileTextField from "../components/ProfileTextField";
import LocationAutocompleteInput from "@features/import/components/LocationAutocompleteInput";

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors, mode } = useAppTheme();

  const profile = useAppSelector(settingsSelectors.profile);
  const loading = useAppSelector(settingsSelectors.loading);

  const [firstName, setFirstName] = useState(profile.firstName);
  const [lastName, setLastName] = useState(profile.lastName);
  const [address, setAddress] = useState(profile.address);

  useEffect(() => {
    setFirstName(profile.firstName);
    setLastName(profile.lastName);
    setAddress(profile.address);
  }, [profile.firstName, profile.lastName, profile.address]);

  const handleSave = () => {
    void dispatch(
      saveProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: profile.email,
        address: address.trim(),
      })
    )
      .unwrap()
      .then(() => router.back());
  };

  return (
    <AppScreen scrollable loading={loading} backgroundColor={colors.background}>
      <ScreenHeader
        title={t("settings:profile.title")}
        subtitle={t("settings:profile.subtitle")}
        onBackPress={() => router.back()}
      />

      <View style={styles.form}>
        <ProfileTextField
          label={t("settings:profile.firstName")}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <ProfileTextField
          label={t("settings:profile.lastName")}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        <ProfileTextField
          label={t("settings:profile.email")}
          value={profile.email}
          editable={false}
          autoCapitalize="none"
        />
        <View style={styles.fieldGroup}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("settings:profile.address")}
          </Text>
          <LocationAutocompleteInput
            initialValue={profile.address}
            value={address}
            onChangeText={setAddress}
            onSelectPlace={(place) =>
              setAddress(place.formattedAddress ?? place.name ?? "")
            }
            placeholder={t("settings:profile.address")}
            style={styles.autocompleteWrapper}
          />
        </View>

        <Pressable
          onPress={handleSave}
          disabled={loading}
          style={[
            styles.button,
            {
              backgroundColor: loading ? colors.overlay : colors.primary,
              borderColor: loading ? colors.border : colors.primary,
            },
          ]}
        >
          <Text
            style={[
              styles.buttonText,
              {
                color: loading
                  ? colors.secondaryText
                  : mode === "dark"
                    ? colors.background
                    : colors.surface,
              },
            ]}
          >
            {t("common:buttons.saveChanges")}
          </Text>
        </Pressable>
      </View>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  form: {
    gap: 14,
    marginTop: 8,
  },
  fieldGroup: {
    gap: 6,
    zIndex: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  autocompleteWrapper: {
    zIndex: 5,
  },
  button: {
    marginTop: 6,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

export default ProfileScreen;
