import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "English" | "Chinese";

export interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: "English",
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: "settings-storage",
    }
  )
);
