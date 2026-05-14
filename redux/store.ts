import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/ThemeSlice";
import authReducer from "../features/AuthSlice";

export const store = configureStore({
  reducer: {
    Theme: themeReducer,
    Auth: authReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;