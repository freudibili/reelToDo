import React, { useEffect, useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
} from "../store/activitiesSlice";
import { activitiesSelectors } from "../store/activitiesSelectors";
import ActivityList from "../components/ActivityList";
import { useAppDispatch, useAppSelector } from "@core/store/hook";
import Screen from "@common/components/AppScreen";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Icon } from "react-native-paper";

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const categories = useAppSelector(activitiesSelectors.categoryCards);
  const loading = useAppSelector(activitiesSelectors.loading);
  const initialized = useAppSelector(activitiesSelectors.initialized);

  useEffect(() => {
    dispatch(fetchActivities());
    dispatch(startActivitiesListener(userId));
    return () => {
      stopActivitiesListener();
    };
  }, [dispatch, userId]);

  const handleOpenImport = useCallback(() => {
    router.push({ pathname: "/import", params: { from: "activities" } });
  }, [router]);

  const handleOpenCategory = useCallback(
    (category: string) => {
      router.push({ pathname: "/activities/[category]", params: { category } });
    },
    [router]
  );

  return (
    <Screen
      loading={loading && !initialized}
      flushBottom
      headerTitle={t("activities:header")}
      headerRight={
        <Pressable onPress={handleOpenImport} style={styles.importPressable}>
          <LinearGradient
            colors={["#0ea5e9", "#6366f1"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.importBtn}
          >
            <View style={styles.importContent}>
              <Icon source="link-plus" size={16} color="#fff" />
              <Text style={styles.importText}>
                {t("activities:list.importFromLink")}
              </Text>
            </View>
          </LinearGradient>
        </Pressable>
      }
    >
      <ActivityList data={categories} onSelectCategory={handleOpenCategory} />
    </Screen>
  );
};

export default ActivitiesScreen;

const styles = StyleSheet.create({
  importBtn: {
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 999,
    shadowColor: "#0f172a",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  importPressable: {
    borderRadius: 999,
  },
  importContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  importText: {
    fontSize: 12.5,
    color: "#fff",
    fontWeight: "700",
  },
});
