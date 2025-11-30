import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@features/auth/store/authSlice";
import activitiesReducer from "@features/activities/store/activitiesSlice";
import importReducer from "@features/import/store/importSlice";
import settingsReducer from "@features/settings/store/settingsSlice";
import calendarReducer from "@features/calendar/store/calendarSlice";
import mapReducer from "@features/map/store/mapSlice";
import homeExploreReducer from "@features/home/store/homeExploreSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  activities: activitiesReducer,
  import: importReducer,
  settings: settingsReducer,
  calendar: calendarReducer,
  map: mapReducer,
  homeExplore: homeExploreReducer,
});

export default rootReducer;
