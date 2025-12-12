import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { StyleSheet } from "react-native";

import AppScreen, { ScreenHeader } from "@common/components/AppScreen";
import { Box, Button, Stack, Text } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import LocationAutocompleteInput from "@features/import/components/LocationAutocompleteInput";

import ProfileTextField from "../components/ProfileTextField";
import { settingsSelectors } from "../store/settingsSelectors";
import { saveProfile } from "../store/settingsSlice";

const ProfileScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();

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

      <Stack gap="lg" style={styles.form}>
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
        <Box style={styles.fieldGroup} gap={6}>
          <Text variant="headline" weight="700">
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
        </Box>

        <Button
          label={t("common:buttons.saveChanges")}
          onPress={handleSave}
          loading={loading}
          disabled={loading}
          fullWidth
        />
      </Stack>
    </AppScreen>
  );
};

const styles = StyleSheet.create({
  form: {
    marginTop: 8,
  },
  fieldGroup: {
    zIndex: 5,
  },
  autocompleteWrapper: {
    zIndex: 5,
  },
});

export default ProfileScreen;
