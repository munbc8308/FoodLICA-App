import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PUBLIC_GOOGLE_MAPS_API_KEY } from '$env/static/public';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { origin, destination, mode } = await request.json();

		console.log('[Routes API Server] Request:', { origin, destination, mode });

		// Validate input
		if (!origin || !destination || !mode) {
			return json({ error: '필수 파라미터가 누락되었습니다.' }, { status: 400 });
		}

		// Map transport mode to Routes API travel mode
		const travelModeMap: Record<string, string> = {
			WALKING: 'WALK',
			DRIVING: 'DRIVE',
			TRANSIT: 'TRANSIT'
		};

		const routesApiMode = travelModeMap[mode] || 'WALK';

		const requestBody: any = {
			origin: {
				location: {
					latLng: {
						latitude: origin.lat,
						longitude: origin.lng
					}
				}
			},
			destination: {
				location: {
					latLng: {
						latitude: destination.lat,
						longitude: destination.lng
					}
				}
			},
			travelMode: routesApiMode,
			computeAlternativeRoutes: false,
			routeModifiers: {
				avoidTolls: false,
				avoidHighways: false,
				avoidFerries: false
			},
			languageCode: 'ko-KR',
			units: 'METRIC'
		};

		// routingPreference is only supported for DRIVE and TWO_WHEELER modes
		if (routesApiMode === 'DRIVE') {
			requestBody.routingPreference = 'TRAFFIC_AWARE';
		}

		// Use Directions API (REST) instead of Routes API v2
		const directionsUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
		const originStr = `${origin.lat},${origin.lng}`;
		const destStr = `${destination.lat},${destination.lng}`;
		const modeStr = mode.toLowerCase();

		directionsUrl.searchParams.set('origin', originStr);
		directionsUrl.searchParams.set('destination', destStr);
		directionsUrl.searchParams.set('mode', modeStr);
		directionsUrl.searchParams.set('language', 'ko');
		directionsUrl.searchParams.set('key', PUBLIC_GOOGLE_MAPS_API_KEY);

		console.log('[Directions API Server] Origin:', originStr);
		console.log('[Directions API Server] Destination:', destStr);
		console.log('[Directions API Server] Mode:', modeStr);
		console.log('[Directions API Server] Full URL:', directionsUrl.toString());

		const response = await fetch(directionsUrl.toString());

		console.log('[Routes API Server] Response status:', response.status);
		console.log('[Routes API Server] Response headers:', Object.fromEntries(response.headers.entries()));

		// Read response as text first to see raw content
		const responseText = await response.text();
		console.log('[Routes API Server] Raw response body:', responseText);
		console.log('[Routes API Server] Response body length:', responseText.length);

		if (!response.ok) {
			console.error('[Routes API Server] Error response text:', responseText);
			return json({ error: `Routes API 오류: ${response.status}` }, { status: response.status });
		}

		// Parse JSON
		let data;
		try {
			data = JSON.parse(responseText);
			console.log('[Directions API Server] Parsed data:', JSON.stringify(data, null, 2));
		} catch (e) {
			console.error('[Directions API Server] JSON parse error:', e);
			console.error('[Directions API Server] Could not parse:', responseText);
			return json({ error: 'JSON 파싱 실패' }, { status: 500 });
		}

		// Check Directions API status
		if (data.status !== 'OK') {
			console.error('[Directions API Server] API status:', data.status);
			console.error('[Directions API Server] Error message:', data.error_message);

			// If ZERO_RESULTS, try with available travel modes
			if (data.status === 'ZERO_RESULTS' && data.available_travel_modes?.length > 0) {
				const availableMode = data.available_travel_modes[0];
				console.log(
					'[Directions API Server] ZERO_RESULTS - Retrying with available mode:',
					availableMode
				);

				// Retry with the first available mode
				const retryUrl = new URL('https://maps.googleapis.com/maps/api/directions/json');
				retryUrl.searchParams.set('origin', originStr);
				retryUrl.searchParams.set('destination', destStr);
				retryUrl.searchParams.set('mode', availableMode.toLowerCase());
				retryUrl.searchParams.set('language', 'ko');
				retryUrl.searchParams.set('key', PUBLIC_GOOGLE_MAPS_API_KEY);

				console.log('[Directions API Server] Retry URL:', retryUrl.toString());

				const retryResponse = await fetch(retryUrl.toString());
				const retryText = await retryResponse.text();
				const retryData = JSON.parse(retryText);

				console.log('[Directions API Server] Retry status:', retryData.status);

				if (retryData.status === 'OK' && retryData.routes?.length > 0) {
					console.log('[Directions API Server] Retry succeeded with mode:', availableMode);
					data = retryData;
					// Continue with the retry data
				} else {
					console.error('[Directions API Server] Retry also failed:', retryData.status);
					return json({ error: `경로 오류: ${data.status}` }, { status: 400 });
				}
			} else {
				return json({ error: `경로 오류: ${data.status}` }, { status: 400 });
			}
		}

		if (!data.routes || data.routes.length === 0) {
			console.error('[Directions API Server] No routes found in response!');
			return json({ error: '경로를 찾을 수 없습니다.' }, { status: 404 });
		}

		// Transform Directions API response to our format
		const route = data.routes[0];
		const leg = route.legs[0];

		const transformedData = {
			routes: [
				{
					distanceMeters: leg.distance.value,
					duration: `${leg.duration.value}s`,
					polyline: {
						encodedPolyline: route.overview_polyline.points
					},
					legs: [
						{
							distanceMeters: leg.distance.value,
							duration: `${leg.duration.value}s`,
							startLocation: {
								latLng: {
									latitude: leg.start_location.lat,
									longitude: leg.start_location.lng
								}
							},
							endLocation: {
								latLng: {
									latitude: leg.end_location.lat,
									longitude: leg.end_location.lng
								}
							},
							steps: leg.steps.map((step: any) => ({
								distanceMeters: step.distance.value,
								staticDuration: `${step.duration.value}s`,
								startLocation: {
									latLng: {
										latitude: step.start_location.lat,
										longitude: step.start_location.lng
									}
								},
								endLocation: {
									latLng: {
										latitude: step.end_location.lat,
										longitude: step.end_location.lng
									}
								},
								navigationInstruction: {
									instructions: step.html_instructions.replace(/<[^>]*>/g, '')
								}
							}))
						}
					]
				}
			]
		};

		console.log('[Directions API Server] Transformed data:', JSON.stringify(transformedData, null, 2));

		// Return the route data
		return json({ success: true, data: transformedData });
	} catch (error) {
		console.error('[Routes API Server] Error:', error);
		return json({ error: '경로 계산 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
