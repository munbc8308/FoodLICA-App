import type { Location } from '$lib/types';
import { GOOGLE_MAPS_CONFIG } from '$lib/constants';

/**
 * Get current user location using browser Geolocation API
 */
export async function getCurrentLocation(): Promise<Location> {
	if (!navigator.geolocation) {
		throw new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
	}

	return new Promise((resolve, reject) => {
		navigator.geolocation.getCurrentPosition(
			(position) => {
				resolve({
					lat: position.coords.latitude,
					lng: position.coords.longitude
				});
			},
			(error) => {
				let message = '위치를 가져오는데 실패했습니다.';

				switch (error.code) {
					case error.PERMISSION_DENIED:
						message = '위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요.';
						break;
					case error.POSITION_UNAVAILABLE:
						message = '위치 정보를 사용할 수 없습니다.';
						break;
					case error.TIMEOUT:
						message = '위치 요청 시간이 초과되었습니다.';
						break;
				}

				reject(new Error(message));
			},
			{
				enableHighAccuracy: true,
				timeout: 10000,
				maximumAge: 0
			}
		);
	});
}

/**
 * Get fallback location (Seoul city center)
 * Used when user denies location permission
 */
export function getFallbackLocation(): Location {
	return GOOGLE_MAPS_CONFIG.defaultCenter;
}

/**
 * Watch user location for continuous updates
 * Returns a watchId that can be used to stop watching
 */
export function watchLocation(
	onSuccess: (location: Location) => void,
	onError?: (error: Error) => void
): number {
	if (!navigator.geolocation) {
		throw new Error('이 브라우저는 위치 서비스를 지원하지 않습니다.');
	}

	return navigator.geolocation.watchPosition(
		(position) => {
			onSuccess({
				lat: position.coords.latitude,
				lng: position.coords.longitude
			});
		},
		(error) => {
			if (onError) {
				onError(new Error(`위치 추적 오류: ${error.message}`));
			}
		},
		{
			enableHighAccuracy: true,
			timeout: 5000,
			maximumAge: 0
		}
	);
}

/**
 * Stop watching location
 */
export function clearLocationWatch(watchId: number): void {
	navigator.geolocation.clearWatch(watchId);
}
