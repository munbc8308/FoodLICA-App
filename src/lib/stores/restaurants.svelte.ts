import type { Restaurant, LoadingState } from '$lib/types';
import { searchNearbyRestaurants, getRandomRestaurants } from '$lib/services/places';
import { settingsStore } from './settings.svelte';
import { locationStore } from './location.svelte';

class RestaurantsStore {
	private _restaurants = $state<Restaurant[]>([]);
	private _recommended = $state<Restaurant[]>([]);
	private _selected = $state<Restaurant | null>(null);
	private _loadingState = $state<LoadingState>('idle');
	private _error = $state<string | null>(null);

	get restaurants(): Restaurant[] {
		return this._restaurants;
	}

	get recommended(): Restaurant[] {
		return this._recommended;
	}

	get selected(): Restaurant | null {
		return this._selected;
	}

	get loadingState(): LoadingState {
		return this._loadingState;
	}

	get error(): string | null {
		return this._error;
	}

	async searchRestaurants() {
		const location = locationStore.location;
		if (!location) {
			this._error = '위치 정보가 없습니다.';
			return;
		}

		this._loadingState = 'loading';
		this._error = null;

		try {
			console.log('[RestaurantsStore] Searching restaurants at location:', location);
			const results = await searchNearbyRestaurants(location, settingsStore.settings);
			console.log('[RestaurantsStore] Search results:', results.length, 'restaurants found');
			this._restaurants = results;
			console.log('[RestaurantsStore] _restaurants updated, length:', this._restaurants.length);
			this._loadingState = 'success';
		} catch (error) {
			this._loadingState = 'error';
			this._error = error instanceof Error ? error.message : '식당 검색에 실패했습니다.';
			console.error('Restaurant search error:', error);
		}
	}

	generateRecommendations(count: number = 5) {
		if (this._restaurants.length === 0) {
			this._recommended = [];
			return;
		}

		this._recommended = getRandomRestaurants(this._restaurants, count);
	}

	selectRestaurant(restaurantId: string) {
		console.log('[RestaurantsStore] selectRestaurant called with id:', restaurantId);
		console.log('[RestaurantsStore] Searching in recommended:', this._recommended.length, 'restaurants');

		const restaurant = this._recommended.find((r) => r.id === restaurantId);

		if (restaurant) {
			console.log('[RestaurantsStore] Found restaurant:', restaurant.name, 'at', restaurant.location);
			this._selected = restaurant;
			console.log('[RestaurantsStore] Selected restaurant set to:', this._selected.name);
		} else {
			console.error('[RestaurantsStore] Restaurant not found with id:', restaurantId);
			console.log('[RestaurantsStore] Available restaurant ids:', this._recommended.map((r) => r.id));
		}
	}

	clearSelection() {
		this._selected = null;
	}

	clearRecommendations() {
		this._recommended = [];
	}

	clearAll() {
		this._restaurants = [];
		this._recommended = [];
		this._selected = null;
		this._loadingState = 'idle';
		this._error = null;
	}
}

export const restaurantsStore = new RestaurantsStore();
