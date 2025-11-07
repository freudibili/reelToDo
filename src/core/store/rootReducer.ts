import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "@features/auth/store/authSlice";
import activitiesReducer from "@features/activites/store/activitiesSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  activities: activitiesReducer,
});

export default rootReducer;
