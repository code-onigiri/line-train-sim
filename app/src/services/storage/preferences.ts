const PREFERENCES_KEY = 'lts:preferences';

export interface Preferences {
  locale: string;
  theme: 'light' | 'dark' | 'auto';
  timeScale: number;
  enabledAddons: string[];
  recentMaps: string[];
  canvasSettings: {
    snapToGrid: boolean;
    gridSize: number;
    showElevation: boolean;
  };
}

const defaultPreferences: Preferences = {
  locale: 'en-US',
  theme: 'auto',
  timeScale: 1.0,
  enabledAddons: [],
  recentMaps: [],
  canvasSettings: {
    snapToGrid: true,
    gridSize: 10,
    showElevation: true,
  },
};

export function getPreferences(): Preferences {
  try {
    const stored = localStorage.getItem(PREFERENCES_KEY);
    if (stored) {
      return { ...defaultPreferences, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
  }
  return defaultPreferences;
}

export function setPreferences(preferences: Partial<Preferences>): void {
  try {
    const current = getPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences to localStorage:', error);
  }
}

export function resetPreferences(): void {
  try {
    localStorage.removeItem(PREFERENCES_KEY);
  } catch (error) {
    console.error('Failed to reset preferences:', error);
  }
}
