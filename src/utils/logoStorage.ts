export const DEFAULT_LOGO_URL = '/magadh_sparsh_logo.svg';
export const LOGO_STORAGE_KEY = 'site_official_logo';
export const LOGO_SETTINGS_KEY = 'site_official_logo_settings';

export interface LogoDisplaySettings {
  url: string;
  scale: number;        // Zoom multiplier e.g. 1.0 (range 0.5 to 2.5)
  maxHeight: number;    // Base height in px (e.g. 36px, range 16px to 120px)
  offsetX: number;      // Horizontal offset shift in px (-100 to 100)
  offsetY: number;      // Vertical offset shift in px (-100 to 100)
  alignment: 'left' | 'center' | 'right';
  objectFit: 'contain' | 'cover' | 'fill' | 'none';
}

export const DEFAULT_LOGO_SETTINGS: LogoDisplaySettings = {
  url: DEFAULT_LOGO_URL,
  scale: 1.0,
  maxHeight: 36,
  offsetX: 0,
  offsetY: 0,
  alignment: 'center',
  objectFit: 'contain',
};

export function getOfficialLogoSettings(): LogoDisplaySettings {
  try {
    const rawUrl = localStorage.getItem(LOGO_STORAGE_KEY);
    const rawSettings = localStorage.getItem(LOGO_SETTINGS_KEY);

    let settings: LogoDisplaySettings = { ...DEFAULT_LOGO_SETTINGS };

    if (rawSettings) {
      const parsed = JSON.parse(rawSettings);
      settings = { ...settings, ...parsed };
    }

    if (rawUrl && rawUrl.trim()) {
      settings.url = rawUrl;
    }

    return settings;
  } catch (e) {
    console.error('Error reading logo settings from storage:', e);
    return { ...DEFAULT_LOGO_SETTINGS };
  }
}

export function getOfficialLogo(): string {
  return getOfficialLogoSettings().url;
}

export function saveOfficialLogo(logoDataUrl: string): boolean {
  try {
    localStorage.setItem(LOGO_STORAGE_KEY, logoDataUrl);
    const currentSettings = getOfficialLogoSettings();
    const updatedSettings = { ...currentSettings, url: logoDataUrl };
    localStorage.setItem(LOGO_SETTINGS_KEY, JSON.stringify(updatedSettings));
    
    window.dispatchEvent(new CustomEvent('officialLogoUpdated', { detail: updatedSettings }));
    return true;
  } catch (e) {
    console.error('Error saving logo to storage:', e);
    return false;
  }
}

export function saveOfficialLogoSettings(newSettings: Partial<LogoDisplaySettings>): boolean {
  try {
    const currentSettings = getOfficialLogoSettings();
    const merged = { ...currentSettings, ...newSettings };
    
    if (newSettings.url) {
      localStorage.setItem(LOGO_STORAGE_KEY, newSettings.url);
    }
    localStorage.setItem(LOGO_SETTINGS_KEY, JSON.stringify(merged));
    
    window.dispatchEvent(new CustomEvent('officialLogoUpdated', { detail: merged }));
    return true;
  } catch (e) {
    console.error('Error saving logo display settings:', e);
    return false;
  }
}

export function resetOfficialLogoDisplaySettings(): boolean {
  try {
    const currentSettings = getOfficialLogoSettings();
    const reset = {
      ...DEFAULT_LOGO_SETTINGS,
      url: currentSettings.url, // preserve uploaded file
    };
    localStorage.setItem(LOGO_SETTINGS_KEY, JSON.stringify(reset));
    window.dispatchEvent(new CustomEvent('officialLogoUpdated', { detail: reset }));
    return true;
  } catch (e) {
    console.error('Error resetting logo display settings:', e);
    return false;
  }
}

export function deleteOfficialLogo(): boolean {
  try {
    localStorage.removeItem(LOGO_STORAGE_KEY);
    localStorage.removeItem(LOGO_SETTINGS_KEY);
    const reset = { ...DEFAULT_LOGO_SETTINGS };
    window.dispatchEvent(new CustomEvent('officialLogoUpdated', { detail: reset }));
    return true;
  } catch (e) {
    console.error('Error deleting logo from storage:', e);
    return false;
  }
}

export function isCustomLogoSet(): boolean {
  try {
    const logo = localStorage.getItem(LOGO_STORAGE_KEY);
    return Boolean(logo && logo.trim());
  } catch (e) {
    return false;
  }
}
