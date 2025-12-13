import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers } from "@reduxjs/toolkit";
import { persistReducer } from "redux-persist";

import appReducer from "@common/store/appSlice";
import activitiesReducer from "@features/activities/store/activitiesSlice";
import authReducer from "@features/auth/store/authSlice";
import calendarReducer from "@features/calendar/store/calendarSlice";
import importReducer from "@features/import/store/importSlice";
import mapReducer from "@features/map/store/mapSlice";
import settingsReducer from "@features/settings/store/settingsSlice";

const appPersistConfig = {
  key: "app",
  storage: AsyncStorage,
  blacklist: ["toast"],
};

const rootReducer = combineReducers({
  auth: authReducer,
  activities: activitiesReducer,
  import: importReducer,
  settings: settingsReducer,
  calendar: calendarReducer,
  map: mapReducer,
  app: persistReducer(appPersistConfig, appReducer),
});

export default rootReducer;
