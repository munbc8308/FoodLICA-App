import type { UserSettings } from '$lib/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '$lib/constants';

class SettingsStore {
	private _settings = $state<UserSettings>(this.loadFromStorage());

	get settings(): UserSettings {
		return this._settings;
	}

	updateSettings(partial: Partial<UserSettings>) {
		this._settings = { ...this._settings, ...partial };
		this.saveToStorage();
	}

	resetToDefaults() {
		this._settings = { ...DEFAULT_SETTINGS };
		this.saveToStorage();
	}

	private loadFromStorage(): UserSettings {
		if (typeof window === 'undefined') {
			return { ...DEFAULT_SETTINGS };
		}

		try {
			const stored = localStorage.getItem(STORAGE_KEYS.USER_SETTINGS);
			if (stored) {
				return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
			}
		} catch (error) {
			console.error('Failed to load settings from localStorage:', error);
		}

		return { ...DEFAULT_SETTINGS };
	}

	private saveToStorage() {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEYS.USER_SETTINGS, JSON.stringify(this._settings));
		} catch (error) {
			console.error('Failed to save settings to localStorage:', error);
		}
	}
}

export const settingsStore = new SettingsStore();
