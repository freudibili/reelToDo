import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@features/auth/store/authSlice";
import activitiesReducer from "@features/activites/store/activitiesSlice";
import importReducer from "@features/import/store/importSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  activities: activitiesReducer,
  import: importReducer,
});

export default rootReducer;
