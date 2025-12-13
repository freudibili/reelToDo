import { Redirect } from "expo-router";
import React from "react";

import { selectShouldShowOnboarding } from "@common/store/appSlice";
import { useAppSelector } from "@core/store/hook";

const IndexRoute = () => {
  const shouldShowOnboarding = useAppSelector(selectShouldShowOnboarding);

  if (shouldShowOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/activities" />;
};

export default IndexRoute;
