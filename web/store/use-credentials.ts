"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CredentialsState {
  apiToken: string;
  zoneId: string;
  setCredentials: (apiToken: string, zoneId: string) => void;
  clearCredentials: () => void;
  hasCredentials: () => boolean;
}

export const useCredentials = create<CredentialsState>()(
  persist(
    (set, get) => ({
      apiToken: "",
      zoneId: "",
      setCredentials: (apiToken: string, zoneId: string) =>
        set({ apiToken, zoneId }),
      clearCredentials: () => set({ apiToken: "", zoneId: "" }),
      hasCredentials: () => {
        const { apiToken, zoneId } = get();
        return Boolean(apiToken && zoneId);
      },
    }),
    {
      name: "cloudflare-credentials",
      getStorage: () => localStorage,
    }
  )
);
