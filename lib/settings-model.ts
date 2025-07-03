import type { Settings } from "@/types/settings"

class SettingsModel {
  private settings: Settings | null = null;

  initializeSettings(settings: Settings) {
    console.log("[Settings Model] Initializing settings:", settings);
    this.settings = settings;
  }

  getSettings(): Settings | null {
    return this.settings;
  }

  getCurrency(): string {
    return this.settings?.currency || "";
  }
}

export const settingsModel = new SettingsModel(); 