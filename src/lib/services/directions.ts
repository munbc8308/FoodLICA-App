import type { Location, RouteInfo, RouteStep, UserSettings } from '$lib/types';
import { getGoogleMaps } from './googleMaps';

/**
 * Get route from origin to destination using our server-side Routes API endpoint
 */
export async function getRoute(
	origin: Location,
	destination: Location,
	mode: UserSettings['transportMode'] = 'WALKING'
): Promise<RouteInfo> {
	console.log('[Routes Service] getRoute called with:', {
		origin,
		destination,
		mode
	});

	try {
		// Call our server-side API endpoint
		const API_URL = import.meta.env.PUBLIC_API_URL || '';
		const response = await fetch(`${API_URL}/api/routes`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			credentials: 'include',
			body: JSON.stringify({ origin, destination, mode })
		});

		console.log('[Routes Service] Response status:', response.status);

		if (!response.ok) {
			const errorData = await response.json();
			console.error('[Routes Service] Error response:', errorData);
			throw new Error(errorData.error || '경로를 찾을 수 없습니다.');
		}

		const result = await response.json();
		console.log('[Routes Service] Response data:', result);

		if (!result.success || !result.data) {
			throw new Error('경로 데이터를 받을 수 없습니다.');
		}

		const data = result.data;

		if (!data.routes || data.routes.length === 0) {
			// Calculate straight-line distance as fallback
			const google = getGoogleMaps();
			const distance = google.maps.geometry.spherical.computeDistanceBetween(
				new google.maps.LatLng(origin.lat, origin.lng),
				new google.maps.LatLng(destination.lat, destination.lng)
			);
			console.error('[Routes Service] No routes found. Straight-line distance:', distance, 'meters');
			throw new Error('경로를 찾을 수 없습니다. 직선 거리만 표시됩니다.');
		}

		const route = data.routes[0];
		const leg = route.legs?.[0];

		// Convert duration (e.g., "180s") to seconds
		const durationSeconds = parseInt(route.duration?.replace('s', '') || '0');
		const durationMinutes = Math.round(durationSeconds / 60);

		// Convert distance meters to text
		const distanceMeters = route.distanceMeters || 0;
		const distanceText =
			distanceMeters >= 1000
				? `${(distanceMeters / 1000).toFixed(1)}km`
				: `${distanceMeters}m`;

		const routeInfo: RouteInfo = {
			distance: distanceText,
			distanceValue: distanceMeters,
			duration: `${durationMinutes}분`,
			durationValue: durationSeconds,
			steps: leg?.steps?.map((step: any) => convertRoutesApiStep(step)) || [],
			polyline: route.polyline?.encodedPolyline || '',
			startLocation: {
				lat: leg?.startLocation?.latLng?.latitude || origin.lat,
				lng: leg?.startLocation?.latLng?.longitude || origin.lng
			},
			endLocation: {
				lat: leg?.endLocation?.latLng?.latitude || destination.lat,
				lng: leg?.endLocation?.latLng?.longitude || destination.lng
			}
		};

		console.log('[Routes Service] RouteInfo created:', routeInfo);
		return routeInfo;
	} catch (error) {
		console.error('[Routes Service] Error:', error);

		// Calculate straight-line distance as fallback
		try {
			const google = getGoogleMaps();
			const distance = google.maps.geometry.spherical.computeDistanceBetween(
				new google.maps.LatLng(origin.lat, origin.lng),
				new google.maps.LatLng(destination.lat, destination.lng)
			);
			console.error('[Routes Service] Straight-line distance:', distance, 'meters');
		} catch (e) {
			// Ignore
		}

		throw error;
	}
}

/**
 * Convert Routes API step to our RouteStep type
 */
function convertRoutesApiStep(step: any): RouteStep {
	const distanceMeters = step.distanceMeters || 0;
	const distanceText =
		distanceMeters >= 1000 ? `${(distanceMeters / 1000).toFixed(1)}km` : `${distanceMeters}m`;

	const durationSeconds = parseInt(step.staticDuration?.replace('s', '') || '0');
	const durationText = `${Math.round(durationSeconds / 60)}분`;

	return {
		instruction: step.navigationInstruction?.instructions || '',
		distance: distanceText,
		duration: durationText,
		startLocation: {
			lat: step.startLocation?.latLng?.latitude || 0,
			lng: step.startLocation?.latLng?.longitude || 0
		},
		endLocation: {
			lat: step.endLocation?.latLng?.latitude || 0,
			lng: step.endLocation?.latLng?.longitude || 0
		}
	};
}

/**
 * Convert Google Directions step to our RouteStep type
 */
function convertStep(step: google.maps.DirectionsStep): RouteStep {
	return {
		instruction: step.instructions,
		distance: step.distance?.text || '',
		duration: step.duration?.text || '',
		startLocation: {
			lat: step.start_location.lat(),
			lng: step.start_location.lng()
		},
		endLocation: {
			lat: step.end_location.lat(),
			lng: step.end_location.lng()
		}
	};
}

/**
 * Format distance in a user-friendly way
 */
export function formatDistance(meters: number): string {
	if (meters < 1000) {
		return `${Math.round(meters)}m`;
	}
	return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Format duration in a user-friendly way
 */
export function formatDuration(seconds: number): string {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) {
		return `${minutes}분`;
	}
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;
	return `${hours}시간 ${remainingMinutes}분`;
}
