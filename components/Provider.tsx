"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "@/redux/store";
import { useAppSelector } from "@/redux/hooks";
import InitUser from "@/Init-User";

interface PropsType {
  children: React.ReactNode;
}

function AppContent({ children }: PropsType) {
  const userData = useAppSelector(
    (state) => state.User.userData
  );

  return (
    <>
      <InitUser />
      {children}
    </>
  );
}

export default function Providers({ children }: PropsType) {
  return (
    <SessionProvider>
      <ReduxProvider store={store}>
        <AppContent>
          {children}
        </AppContent>
      </ReduxProvider>
    </SessionProvider>
  );
}