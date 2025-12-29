import { describe, it, expect, beforeEach } from "vitest";
import { useSettingsStore } from "./settings-store";

describe("SettingsStore", () => {
  beforeEach(() => {
    // Reset store before each test
    useSettingsStore.setState({
      settings: {
        enableKeyboardNavigation: false,
        enableUndoRedo: true,
        reduceAnimations: true,
        imgbbApiKey: "",
      },
    });
  });

  describe("initial state", () => {
    it("has correct default values", () => {
      const { settings } = useSettingsStore.getState();

      expect(settings.enableKeyboardNavigation).toBe(false);
      expect(settings.enableUndoRedo).toBe(true);
      expect(settings.reduceAnimations).toBe(true);
      expect(settings.imgbbApiKey).toBe("");
    });
  });

  describe("updateSettings", () => {
    it("updates a single setting", () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ enableKeyboardNavigation: true });

      const { settings } = useSettingsStore.getState();
      expect(settings.enableKeyboardNavigation).toBe(true);
      // Other settings unchanged
      expect(settings.enableUndoRedo).toBe(true);
      expect(settings.reduceAnimations).toBe(true);
    });

    it("updates multiple settings at once", () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({
        enableKeyboardNavigation: true,
        reduceAnimations: false,
      });

      const { settings } = useSettingsStore.getState();
      expect(settings.enableKeyboardNavigation).toBe(true);
      expect(settings.reduceAnimations).toBe(false);
      expect(settings.enableUndoRedo).toBe(true);
    });

    it("updates imgbbApiKey", () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ imgbbApiKey: "test-api-key" });

      const { settings } = useSettingsStore.getState();
      expect(settings.imgbbApiKey).toBe("test-api-key");
    });

    it("can disable undo/redo", () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ enableUndoRedo: false });

      const { settings } = useSettingsStore.getState();
      expect(settings.enableUndoRedo).toBe(false);
    });
  });

  describe("resetToDefaults", () => {
    it("resets all settings to defaults", () => {
      const { updateSettings, resetToDefaults } = useSettingsStore.getState();

      // Change all settings
      updateSettings({
        enableKeyboardNavigation: true,
        enableUndoRedo: false,
        reduceAnimations: false,
        imgbbApiKey: "custom-key",
      });

      // Verify changes
      let { settings } = useSettingsStore.getState();
      expect(settings.enableKeyboardNavigation).toBe(true);
      expect(settings.enableUndoRedo).toBe(false);
      expect(settings.reduceAnimations).toBe(false);
      expect(settings.imgbbApiKey).toBe("custom-key");

      // Reset
      resetToDefaults();

      // Verify defaults
      settings = useSettingsStore.getState().settings;
      expect(settings.enableKeyboardNavigation).toBe(false);
      expect(settings.enableUndoRedo).toBe(true);
      expect(settings.reduceAnimations).toBe(true);
      expect(settings.imgbbApiKey).toBe("");
    });
  });

  describe("persistence", () => {
    it("partializes state correctly (only settings)", () => {
      const { updateSettings } = useSettingsStore.getState();

      updateSettings({ enableKeyboardNavigation: true });

      const state = useSettingsStore.getState();
      // The store should have settings property
      expect(state.settings).toBeDefined();
      expect(state.settings.enableKeyboardNavigation).toBe(true);
    });
  });
});
