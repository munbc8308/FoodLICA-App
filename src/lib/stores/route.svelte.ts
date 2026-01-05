import type { RouteInfo, Location, LoadingState } from '$lib/types';
import { getRoute } from '$lib/services/directions';
import { settingsStore } from './settings.svelte';

class RouteStore {
	private _route = $state<RouteInfo | null>(null);
	private _loadingState = $state<LoadingState>('idle');
	private _error = $state<string | null>(null);

	get route(): RouteInfo | null {
		return this._route;
	}

	get loadingState(): LoadingState {
		return this._loadingState;
	}

	get error(): string | null {
		return this._error;
	}

	async fetchRoute(origin: Location, destination: Location) {
		console.log('[RouteStore] Fetching route from', origin, 'to', destination);
		this._loadingState = 'loading';
		this._error = null;

		try {
			const routeInfo = await getRoute(origin, destination, settingsStore.settings.transportMode);
			console.log('[RouteStore] Route fetched successfully:', routeInfo);
			this._route = routeInfo;
			this._loadingState = 'success';
		} catch (error) {
			this._loadingState = 'error';
			this._error = error instanceof Error ? error.message : '경로를 가져오는데 실패했습니다.';
			console.error('[RouteStore] Route fetch error:', error);
		}
	}

	clearRoute() {
		this._route = null;
		this._loadingState = 'idle';
		this._error = null;
	}
}

export const routeStore = new RouteStore();
