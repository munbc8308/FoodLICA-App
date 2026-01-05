import type { Restaurant, Location, UserSettings } from '$lib/types';
import { getGoogleMaps } from './googleMaps';
import { RECOMMENDATION_COUNT } from '$lib/constants';

/**
 * Search for nearby restaurants using Google Places API
 * Note: Using PlacesService (legacy) as it's still supported and more stable
 */
export async function searchNearbyRestaurants(
	location: Location,
	settings: UserSettings
): Promise<Restaurant[]> {
	const google = getGoogleMaps();
	const service = new google.maps.places.PlacesService(document.createElement('div'));

	// Determine which categories to search for
	const categoriesToSearch =
		settings.categories.length > 0 ? settings.categories : ['restaurant'];

	console.log('[Places API] Searching for categories:', categoriesToSearch);

	// Search for each category separately and combine results (OR logic)
	const allResults: Restaurant[] = [];
	const seenPlaceIds = new Set<string>();

	for (const category of categoriesToSearch) {
		const request: google.maps.places.PlaceSearchRequest = {
			location: new google.maps.LatLng(location.lat, location.lng),
			radius: settings.radius,
			type: category
		};

		if (settings.onlyOpenNow) {
			request.openNow = true;
		}

		console.log('[Places API] Searching for type:', category);

		try {
			const results = await new Promise<google.maps.places.PlaceResult[]>((resolve, reject) => {
				service.nearbySearch(request, (results, status) => {
					if (status === google.maps.places.PlacesServiceStatus.OK && results) {
						resolve(results);
					} else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
						resolve([]);
					} else {
						reject(new Error(`Places API 오류: ${status}`));
					}
				});
			});

			console.log(`[Places API] Found ${results.length} results for ${category}`);

			// Filter and convert results
			const filteredRestaurants = results
				.filter((place) => {
					// Skip duplicates
					if (seenPlaceIds.has(place.place_id || '')) {
						return false;
					}

					// Filter out places with no rating (0 or undefined)
					if (!place.rating || place.rating === 0) {
						return false;
					}

					// Filter by minimum rating
					if (place.rating < settings.minRating) {
						return false;
					}

					// Filter by open now status
					if (settings.onlyOpenNow) {
						if (place.opening_hours) {
							const isOpen = place.opening_hours.isOpen?.();
							if (isOpen === false) {
								return false;
							}
						} else {
							return false;
						}
					}

					return true;
				})
				.map((place) => {
					seenPlaceIds.add(place.place_id || '');
					return convertPlaceToRestaurant(place, location);
				});

			allResults.push(...filteredRestaurants);
		} catch (error) {
			console.error(`[Places API] Error searching for ${category}:`, error);
		}
	}

	console.log('[Places API] Total unique restaurants found:', allResults.length);
	allResults.forEach((r, i) => {
		console.log(
			`[Places API] Restaurant ${i + 1}: ${r.name} (${r.categories.join(', ')}) at (${r.location.lat}, ${r.location.lng})`
		);
	});

	return allResults;
}

/**
 * Get detailed information about a specific place
 */
export async function getPlaceDetails(placeId: string): Promise<Restaurant | null> {
	const google = getGoogleMaps();
	const service = new google.maps.places.PlacesService(document.createElement('div'));

	const request: google.maps.places.PlaceDetailsRequest = {
		placeId,
		fields: [
			'place_id',
			'name',
			'formatted_address',
			'geometry',
			'rating',
			'user_ratings_total',
			'price_level',
			'photos',
			'types',
			'opening_hours',
			'formatted_phone_number',
			'website'
		]
	};

	return new Promise((resolve, reject) => {
		service.getDetails(request, (place, status) => {
			if (status === google.maps.places.PlacesServiceStatus.OK && place) {
				// We don't have user location here, so distance will be undefined
				const restaurant = convertPlaceToRestaurant(place, { lat: 0, lng: 0 });
				resolve(restaurant);
			} else {
				console.error('Place details error:', status);
				reject(new Error(`Place Details API 오류: ${status}`));
			}
		});
	});
}

/**
 * Select random restaurants from a list
 */
export function getRandomRestaurants(
	restaurants: Restaurant[],
	count: number = RECOMMENDATION_COUNT
): Restaurant[] {
	if (restaurants.length <= count) {
		return [...restaurants];
	}

	const shuffled = [...restaurants].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
}

/**
 * Convert Google Places PlaceResult to our Restaurant type
 */
function convertPlaceToRestaurant(
	place: google.maps.places.PlaceResult,
	userLocation: Location
): Restaurant {
	const photos = place.photos?.slice(0, 5).map((photo) => photo.getUrl({ maxWidth: 800 })) || [];

	const location: Location = {
		lat: place.geometry?.location?.lat() || 0,
		lng: place.geometry?.location?.lng() || 0
	};

	// Calculate distance from user location
	let distance: number | undefined;
	if (userLocation.lat !== 0 && userLocation.lng !== 0 && place.geometry?.location) {
		const google = getGoogleMaps();
		const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);
		const placeLatLng = place.geometry.location;
		distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, placeLatLng);
	}

	return {
		id: place.place_id || '',
		placeId: place.place_id || '',
		name: place.name || '이름 없음',
		address: place.formatted_address || place.vicinity || '',
		location,
		rating: place.rating || 0,
		userRatingsTotal: place.user_ratings_total || 0,
		priceLevel: place.price_level,
		photos,
		categories: place.types || [],
		openingHours: place.opening_hours
			? {
					isOpen: place.opening_hours.isOpen?.() || false,
					weekdayText: place.opening_hours.weekday_text || []
				}
			: undefined,
		distance,
		phoneNumber: place.formatted_phone_number,
		website: place.website
	};
}
