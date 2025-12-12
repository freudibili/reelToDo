import { combineReducers } from "@reduxjs/toolkit";

import appReducer from "@common/store/appSlice";
import activitiesReducer from "@features/activities/store/activitiesSlice";
import authReducer from "@features/auth/store/authSlice";
import calendarReducer from "@features/calendar/store/calendarSlice";
import importReducer from "@features/import/store/importSlice";
import mapReducer from "@features/map/store/mapSlice";
import settingsReducer from "@features/settings/store/settingsSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  activities: activitiesReducer,
  import: importReducer,
  settings: settingsReducer,
  calendar: calendarReducer,
  map: mapReducer,
  app: appReducer,
});

export default rootReducer;
