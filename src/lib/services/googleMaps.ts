import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

let isLoaded = false;
let optionsSet = false;

/**
 * Initialize Google Maps API
 * Uses singleton pattern to prevent multiple initializations
 */
export async function initGoogleMaps(): Promise<typeof google> {
	if (isLoaded && window.google) {
		return window.google;
	}

	if (!optionsSet) {
		setOptions({
			key: PUBLIC_GOOGLE_MAPS_API_KEY,
			v: 'weekly'
		});
		optionsSet = true;
	}

	try {
		await importLibrary('maps');
		await importLibrary('places');
		await importLibrary('geometry');
		await importLibrary('marker'); // Advanced Markers API
		isLoaded = true;
		return window.google;
	} catch (error) {
		console.error('Failed to load Google Maps:', error);
		throw new Error('Google Maps를 로드하는데 실패했습니다.');
	}
}

/**
 * Check if Google Maps is loaded
 */
export function isGoogleMapsLoaded(): boolean {
	return isLoaded && !!window.google;
}

/**
 * Get Google Maps instance (assumes it's already loaded)
 */
export function getGoogleMaps(): typeof google {
	if (!isGoogleMapsLoaded()) {
		throw new Error('Google Maps가 아직 로드되지 않았습니다. initGoogleMaps()를 먼저 호출하세요.');
	}
	return window.google;
}
