import { useRouter } from "expo-router";
import React, { useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "react-native-paper";

import Screen from "@common/components/AppScreen";
import { GradientButton } from "@common/designSystem";
import { useAppTheme } from "@common/theme/appTheme";
import { useAppDispatch, useAppSelector } from "@core/store/hook";

import ActivityList from "../components/ActivityList";
import { activitiesSelectors } from "../store/activitiesSelectors";
import {
  fetchActivities,
  startActivitiesListener,
  stopActivitiesListener,
} from "../store/activitiesSlice";

const ActivitiesScreen = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { t } = useTranslation();
  const { colors } = useAppTheme();
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

  const noActivities = !categories || categories.length === 0;

  return (
    <Screen
      loading={loading && !initialized}
      flushBottom
      headerTitle={t("activities:header")}
      headerRight={
        noActivities ? null : (
          <GradientButton
            label={t("activities:list.importFromLink")}
            icon={
              <Icon
                source="link-plus"
                size={16}
                color={colors.favoriteContrast}
              />
            }
            onPress={handleOpenImport}
            size="sm"
          />
        )
      }
    >
      <ActivityList
        data={categories}
        onSelectCategory={handleOpenCategory}
        onImport={handleOpenImport}
      />
    </Screen>
  );
};

export default ActivitiesScreen;
