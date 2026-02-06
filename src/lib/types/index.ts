// Core location type
export interface Location {
	lat: number;
	lng: number;
}

// Restaurant information from Google Places API
export interface Restaurant {
	id: string;
	placeId: string;
	name: string;
	address: string;
	location: Location;
	rating: number;
	userRatingsTotal: number;
	priceLevel?: number; // 0-4 ($ to $$$$)
	photos: string[]; // Photo URLs
	categories: string[]; // Types of food/cuisine
	openingHours?: {
		isOpen: boolean;
		weekdayText: string[];
	};
	distance?: number; // Distance from user in meters
	phoneNumber?: string;
	website?: string;
}

// User filter and preference settings
export interface UserSettings {
	radius: number; // Search radius in meters
	minRating: number; // Minimum rating (1-5)
	categories: string[]; // Restaurant categories to include
	transportMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
	onlyOpenNow: boolean;
	layoutMode: 'tile' | 'list'; // Display mode for recommendations
}

// Route information from Google Directions API
export interface RouteInfo {
	distance: string; // e.g., "2.5 km"
	distanceValue: number; // Distance in meters
	duration: string; // e.g., "15 mins"
	durationValue: number; // Duration in seconds
	steps: RouteStep[];
	polyline: string; // Encoded polyline for map display
	startLocation: Location;
	endLocation: Location;
}

// Individual step in a route
export interface RouteStep {
	instruction: string; // HTML instructions
	distance: string;
	duration: string;
	startLocation: Location;
	endLocation: Location;
}

// API error type
export interface APIError {
	message: string;
	code: string;
	details?: any;
}

// Loading state type
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
