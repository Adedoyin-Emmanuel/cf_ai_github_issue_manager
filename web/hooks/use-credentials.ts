"use client";

import { useCredentials as useCredentialsStore } from "@/store/use-credentials";

export function useCredentials() {
  const store = useCredentialsStore();

  return {
    ...store,
    isConfigured: store.hasCredentials(),
  };
}
