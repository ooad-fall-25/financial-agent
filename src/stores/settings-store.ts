import { create } from "zustand";

export type Language = "English" | "Chinese";

export interface SettingsState {
  language: Language;
  setLanguage: (lang: Language) => void
}

export const useSettingsStore = create<SettingsState>()((set) => ({
  language: "English",
  setLanguage: (lang) => set({language: lang})
}));
