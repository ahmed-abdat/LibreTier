import { create } from "zustand";
import { persist } from "zustand/middleware";

// Simple settings - just on/off toggles + custom API key
export interface EditorSettings {
  enableKeyboardNavigation: boolean;
  enableUndoRedo: boolean;
  reduceAnimations: boolean;
  imgbbApiKey: string; // Empty = use default, non-empty = use custom
}

// Default values - all features disabled, animations reduced for max performance
const DEFAULT_SETTINGS: EditorSettings = {
  enableKeyboardNavigation: false,
  enableUndoRedo: false,
  reduceAnimations: true,
  imgbbApiKey: "",
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
      storage: {
        getItem: (name) => {
          if (typeof window === "undefined") return null;
          try {
            const str = localStorage.getItem(name);
            return str ? JSON.parse(str) : null;
          } catch {
            console.warn("Failed to load settings, using defaults");
            return null;
          }
        },
        setItem: (name, value) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.setItem(name, JSON.stringify(value));
          } catch (error) {
            console.warn("Failed to save settings:", error);
          }
        },
        removeItem: (name) => {
          if (typeof window === "undefined") return;
          try {
            localStorage.removeItem(name);
          } catch {
            // Storage may be restricted
          }
        },
      },
    }
  )
);
