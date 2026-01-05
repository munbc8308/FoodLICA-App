import type { UserSettings } from '$lib/types';

// Pastel color palette
export const COLORS = {
	pastel: {
		peach: '#FFB4AB',
		coral: '#FFDAB9',
		mint: '#B2E0D4',
		mintLight: '#C7EFCF',
		lavender: '#E6D9F2',
		lavenderLight: '#D4C5F9',
		ivory: '#FAFAFA',
		lightGray: '#F5F5F5',
		charcoal: '#4A4A4A'
	}
} as const;

// Default user settings
export const DEFAULT_SETTINGS: UserSettings = {
	radius: 1000, // 1000m (1km)
	minRating: 3.5,
	categories: [], // Empty = all categories
	transportMode: 'WALKING',
	onlyOpenNow: false,
	layoutMode: 'tile'
};

// Restaurant categories based on Google Places types
export const RESTAURANT_CATEGORIES = [
	{ value: 'restaurant', label: '레스토랑' },
	{ value: 'cafe', label: '카페' },
	{ value: 'bakery', label: '베이커리' },
	{ value: 'bar', label: '바/펍' },
	{ value: 'meal_takeaway', label: '테이크아웃' },
	{ value: 'meal_delivery', label: '배달' }
] as const;

// Transport modes
export const TRANSPORT_MODES = [
	{ value: 'WALKING', label: '도보', icon: '🚶' },
	{ value: 'DRIVING', label: '운전', icon: '🚗' },
	{ value: 'TRANSIT', label: '대중교통', icon: '🚌' }
] as const;

// Search radius options (in meters) - 도보 기준 최대 1km
export const RADIUS_OPTIONS = [
	{ value: 300, label: '300m' },
	{ value: 500, label: '500m' },
	{ value: 800, label: '800m' },
	{ value: 1000, label: '1km' }
] as const;

// Rating options
export const RATING_OPTIONS = [
	{ value: 0, label: '전체' },
	{ value: 3.0, label: '3.0+' },
	{ value: 3.5, label: '3.5+' },
	{ value: 4.0, label: '4.0+' },
	{ value: 4.5, label: '4.5+' }
] as const;

// Number of random recommendations to show
export const RECOMMENDATION_COUNT = 6;

// Google Maps configuration
export const GOOGLE_MAPS_CONFIG = {
	mapId: 'FOODLICA_MAP', // Required for Advanced Markers API
	defaultZoom: 15,
	defaultCenter: { lat: 37.5665, lng: 126.978 }, // Seoul default
	styles: [
		// Hide all POI icons and labels
		{
			featureType: 'poi',
			elementType: 'labels.icon',
			stylers: [{ visibility: 'off' }]
		},
		{
			featureType: 'poi',
			elementType: 'labels.text',
			stylers: [{ visibility: 'off' }]
		},
		{
			featureType: 'poi',
			stylers: [{ visibility: 'off' }]
		},
		// Hide all business POIs
		{
			featureType: 'poi.business',
			stylers: [{ visibility: 'off' }]
		},
		// Hide transit icons
		{
			featureType: 'transit',
			elementType: 'labels.icon',
			stylers: [{ visibility: 'off' }]
		},
		{
			featureType: 'transit.station',
			stylers: [{ visibility: 'off' }]
		}
	] as google.maps.MapTypeStyle[]
};

// LocalStorage keys
export const STORAGE_KEYS = {
	USER_SETTINGS: 'foodlica_user_settings',
	USER_LOCATION: 'foodlica_user_location',
	REVIEWS: 'foodlica_reviews'
} as const;

// API configuration
export const API_CONFIG = {
	placesSearchFields: [
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
	],
	maxSearchResults: 60, // Google Places API max
	requestTimeout: 10000 // 10 seconds
} as const;

// Helper function to calculate zoom level based on search radius
export function getZoomLevelForRadius(radius: number): number {
	if (radius <= 300) return 17;
	if (radius <= 500) return 16;
	if (radius <= 800) return 15;
	return 15; // 1000m (1km) max
}
