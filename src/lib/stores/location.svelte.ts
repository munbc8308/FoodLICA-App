import type { Location, LoadingState } from '$lib/types';
import { getCurrentLocation, getFallbackLocation } from '$lib/services/geolocation';
import { STORAGE_KEYS } from '$lib/constants';

class LocationStore {
	private _location = $state<Location | null>(this.loadFromStorage());
	private _loadingState = $state<LoadingState>('idle');
	private _error = $state<string | null>(null);

	get location(): Location | null {
		return this._location;
	}

	get loadingState(): LoadingState {
		return this._loadingState;
	}

	get error(): string | null {
		return this._error;
	}

	async fetchCurrentLocation() {
		this._loadingState = 'loading';
		this._error = null;

		try {
			const location = await getCurrentLocation();
			this._location = location;
			this._loadingState = 'success';
			this.saveToStorage(location);
		} catch (error) {
			this._loadingState = 'error';
			this._error = error instanceof Error ? error.message : '위치를 가져오는데 실패했습니다.';

			// Use fallback location
			const fallback = getFallbackLocation();
			this._location = fallback;
			this.saveToStorage(fallback);

			console.error('Location fetch error:', error);
		}
	}

	setLocation(location: Location) {
		this._location = location;
		this._loadingState = 'success';
		this._error = null;
		this.saveToStorage(location);
	}

	useFallbackLocation() {
		const fallback = getFallbackLocation();
		this._location = fallback;
		this._loadingState = 'success';
		this._error = null;
		this.saveToStorage(fallback);
	}

	private loadFromStorage(): Location | null {
		if (typeof window === 'undefined') {
			return null;
		}

		try {
			const stored = localStorage.getItem(STORAGE_KEYS.USER_LOCATION);
			if (stored) {
				return JSON.parse(stored);
			}
		} catch (error) {
			console.error('Failed to load location from localStorage:', error);
		}

		return null;
	}

	private saveToStorage(location: Location) {
		if (typeof window === 'undefined') return;

		try {
			localStorage.setItem(STORAGE_KEYS.USER_LOCATION, JSON.stringify(location));
		} catch (error) {
			console.error('Failed to save location to localStorage:', error);
		}
	}
}

export const locationStore = new LocationStore();
