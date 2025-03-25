// src/services/settings.service.js
export class SettingsService {
    static async getSettings() {
      // Implémentation exemple
      return { theme: 'light', notifications: true };
    }
  
    static async updateSettings(newSettings) {
      // Implémentation exemple
      console.log('Settings updated:', newSettings);
      return { success: true };
    }
  }