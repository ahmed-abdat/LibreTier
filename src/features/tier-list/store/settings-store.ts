import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple settings - just on/off toggles
export interface EditorSettings {
  enableKeyboardNavigation: boolean;
  enableUndoRedo: boolean;
  reduceAnimations: boolean;
}

// Default values - all features disabled, animations reduced for max performance
const DEFAULT_SETTINGS: EditorSettings = {
  enableKeyboardNavigation: false,
  enableUndoRedo: false,
  reduceAnimations: true,
};

interface SettingsStore {
  settings: EditorSettings;
  updateSettings: (updates: Partial<EditorSettings>) => void;
  resetToDefaults: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: DEFAULT_SETTINGS,

      updateSettings: (updates) =>
        set((state) => ({
          settings: { ...state.settings, ...updates },
        })),

      resetToDefaults: () =>
        set({
          settings: DEFAULT_SETTINGS,
        }),
    }),
    {
      name: "tier-editor-settings",
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
