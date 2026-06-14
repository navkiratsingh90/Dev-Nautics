import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../features/ThemeSlice";
import userReducer from "../features/userSlice";

export const store = configureStore({
  reducer: {
    Theme: themeReducer,
    User: userReducer,
  },
});


export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;