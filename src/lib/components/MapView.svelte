<script lang="ts">
	import { onMount } from 'svelte';
	import type { Restaurant, Location, RouteInfo } from '$lib/types';
	import { initGoogleMaps } from '$lib/services/googleMaps';
	import { GOOGLE_MAPS_CONFIG, getZoomLevelForRadius } from '$lib/constants';

	let {
		center,
		restaurants = [],
		selectedRestaurant = null,
		route = null,
		showUserMarker = true,
		searchRadius = 1000
	}: {
		center: Location;
		restaurants?: Restaurant[];
		selectedRestaurant?: Restaurant | null;
		route?: RouteInfo | null;
		showUserMarker?: boolean;
		searchRadius?: number;
	} = $props();

	// Log props when they change
	$effect(() => {
		console.log('[MapView Props] center:', center);
		console.log('[MapView Props] restaurants:', restaurants);
		console.log('[MapView Props] selectedRestaurant:', selectedRestaurant);
		console.log('[MapView Props] route:', route);
	});

	let mapContainer: HTMLDivElement;
	let map = $state<google.maps.Map | null>(null);
	let markers: google.maps.Marker[] = [];
	let userMarker: google.maps.Marker | null = null;
	let routePolyline: google.maps.Polyline | null = null;
	let currentInfoWindow: google.maps.InfoWindow | null = null;

	onMount(async () => {
		try {
			await initGoogleMaps();
			initMap();
		} catch (error) {
			console.error('Failed to initialize map:', error);
		}
	});

	function initMap() {
		if (!mapContainer) return;

		map = new google.maps.Map(mapContainer, {
			center: { lat: center.lat, lng: center.lng },
			zoom: GOOGLE_MAPS_CONFIG.defaultZoom,
			styles: GOOGLE_MAPS_CONFIG.styles,
			disableDefaultUI: false,
			zoomControl: true,
			mapTypeControl: false,
			streetViewControl: true,
			fullscreenControl: false,
			clickableIcons: false,
			zoomControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT
			},
			streetViewControlOptions: {
				position: google.maps.ControlPosition.TOP_RIGHT
			}
		});

		if (showUserMarker) {
			addUserMarker();
		}
	}

	function addUserMarker() {
		if (!map) return;

		userMarker = new google.maps.Marker({
			map,
			position: { lat: center.lat, lng: center.lng },
			title: '현재 위치',
			icon: {
				path: google.maps.SymbolPath.CIRCLE,
				scale: 12,
				fillColor: '#FFB4AB',
				fillOpacity: 1,
				strokeColor: '#FFFFFF',
				strokeWeight: 3
			}
		});
	}

	function clearMarkers() {
		// Close any open InfoWindow
		if (currentInfoWindow) {
			currentInfoWindow.close();
			currentInfoWindow = null;
		}
		// Clear all markers
		markers.forEach((marker) => marker.setMap(null));
		markers = [];
	}

	function addRestaurantMarkers() {
		if (!map) {
			console.error('[addRestaurantMarkers] Map is null!');
			return;
		}

		console.log('=== [addRestaurantMarkers] START ===');
		console.log('[addRestaurantMarkers] restaurants.length:', restaurants.length);
		console.log('[addRestaurantMarkers] restaurants:', restaurants);

		clearMarkers();

		restaurants.forEach((restaurant, index) => {
			console.log(`[addRestaurantMarkers] Creating marker ${index + 1}/${restaurants.length}`);
			console.log(`[addRestaurantMarkers] Restaurant:`, {
				name: restaurant.name,
				lat: restaurant.location.lat,
				lng: restaurant.location.lng
			});

			const markerPosition = { lat: restaurant.location.lat, lng: restaurant.location.lng };
			console.log(`[addRestaurantMarkers] Marker position:`, markerPosition);

			const marker = new google.maps.Marker({
				map,
				position: markerPosition,
				title: restaurant.name,
				icon: {
					path: google.maps.SymbolPath.CIRCLE,
					scale: 16,
					fillColor: '#B2E0D4',
					fillOpacity: 1,
					strokeColor: '#FFFFFF',
					strokeWeight: 3
				}
			});

			console.log('[addRestaurantMarkers] Marker created:', marker);
			console.log('[addRestaurantMarkers] Marker position on map:', marker.getPosition()?.toString());

			// Build info window content with available data
			let infoContent = `
				<div style="padding: 12px; min-width: 200px; font-family: system-ui, -apple-system, sans-serif;">
					<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #4A4A4A;">${restaurant.name}</h3>
					<p style="margin: 0 0 6px 0; font-size: 13px; color: #666;">${restaurant.address}</p>
					<div style="margin: 6px 0; font-size: 13px;">
						<span style="color: #FFB4AB; font-weight: 600;">⭐ ${restaurant.rating.toFixed(1)}</span>
						<span style="color: #999; margin-left: 4px;">(${restaurant.userRatingsTotal}개 리뷰)</span>
					</div>
			`;

			if (restaurant.priceLevel) {
				const priceSymbols = '₩'.repeat(restaurant.priceLevel);
				infoContent += `<p style="margin: 4px 0; font-size: 13px; color: #FFB4AB; font-weight: 600;">${priceSymbols}</p>`;
			}

			if (restaurant.openingHours) {
				const statusColor = restaurant.openingHours.isOpen ? '#2D6A4F' : '#999';
				const statusBg = restaurant.openingHours.isOpen ? '#C7EFCF' : '#F5F5F5';
				const statusText = restaurant.openingHours.isOpen ? '영업중' : '영업종료';
				infoContent += `<p style="margin: 4px 0; padding: 2px 8px; display: inline-block; background: ${statusBg}; color: ${statusColor}; border-radius: 4px; font-size: 11px; font-weight: 600;">${statusText}</p>`;
			}

			if (restaurant.distance) {
				const distanceKm = (restaurant.distance / 1000).toFixed(1);
				const distanceText = restaurant.distance >= 1000 ? `${distanceKm}km` : `${restaurant.distance}m`;
				infoContent += `<p style="margin: 6px 0 0 0; font-size: 12px; color: #666;">📍 ${distanceText}</p>`;
			}

			if (restaurant.phoneNumber) {
				infoContent += `<p style="margin: 4px 0; font-size: 12px; color: #666;">📞 ${restaurant.phoneNumber}</p>`;
			}

			if (restaurant.website) {
				infoContent += `<p style="margin: 4px 0; font-size: 12px;"><a href="${restaurant.website}" target="_blank" style="color: #FFB4AB; text-decoration: none;">🔗 웹사이트</a></p>`;
			}

			infoContent += `</div>`;

			const infoWindow = new google.maps.InfoWindow({
				content: infoContent
			});

			marker.addListener('click', () => {
				// Close currently open InfoWindow if exists
				if (currentInfoWindow) {
					currentInfoWindow.close();
				}
				// Open new InfoWindow
				infoWindow.open({ map, anchor: marker });
				// Update current InfoWindow reference
				currentInfoWindow = infoWindow;
			});

			console.log(`[addRestaurantMarkers] Adding marker to markers array, current count:`, markers.length);
			markers.push(marker);
			console.log(`[addRestaurantMarkers] Marker added, new count:`, markers.length);
		});

		console.log('=== [addRestaurantMarkers] COMPLETE ===');
		console.log(`[addRestaurantMarkers] Total markers created: ${markers.length}`);
		console.log('[addRestaurantMarkers] All markers:', markers);
	}

	function highlightSelectedRestaurant() {
		console.log('[MapView highlightSelectedRestaurant] Called with selectedRestaurant:', selectedRestaurant?.name);

		if (!map || !selectedRestaurant) {
			console.log('[MapView highlightSelectedRestaurant] Skipping - map or selectedRestaurant missing');
			return;
		}

		console.log('[MapView highlightSelectedRestaurant] Panning to:', selectedRestaurant.location);

		// Pan to selected restaurant
		map.panTo({ lat: selectedRestaurant.location.lat, lng: selectedRestaurant.location.lng });
		map.setZoom(16);

		// Find the matching marker
		console.log('[MapView highlightSelectedRestaurant] Searching for marker among', markers.length, 'markers');
		const selectedMarker = markers.find((marker) => {
			const position = marker.getPosition();
			return (
				position &&
				position.lat() === selectedRestaurant.location.lat &&
				position.lng() === selectedRestaurant.location.lng
			);
		});

		// Animate the selected marker
		if (selectedMarker) {
			console.log('[MapView highlightSelectedRestaurant] Found matching marker, animating');
			selectedMarker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(() => selectedMarker.setAnimation(null), 2000);
		} else {
			console.log('[MapView highlightSelectedRestaurant] No matching marker found');
		}
	}

	function drawRoute() {
		console.log('[MapView drawRoute] Called with map:', map ? 'exists' : 'null', 'route:', route ? 'exists' : 'null');

		if (!map || !route) {
			console.log('[MapView drawRoute] Skipping - map or route missing');
			return;
		}

		console.log('[MapView drawRoute] Route polyline:', route.polyline?.substring(0, 50) + '...');

		// Clear existing polyline
		if (routePolyline) {
			console.log('[MapView drawRoute] Clearing existing polyline');
			routePolyline.setMap(null);
		}

		try {
			// Decode polyline
			const path = google.maps.geometry.encoding.decodePath(route.polyline);
			console.log('[MapView drawRoute] Decoded path with', path.length, 'points');

			routePolyline = new google.maps.Polyline({
				path,
				geodesic: true,
				strokeColor: '#FFB4AB',
				strokeOpacity: 0.9,
				strokeWeight: 6,
				map
			});

			console.log('[MapView drawRoute] Polyline created and added to map');

			// Fit bounds to show entire route
			const bounds = new google.maps.LatLngBounds();
			path.forEach((point) => bounds.extend(point));
			map.fitBounds(bounds);
			console.log('[MapView drawRoute] Map bounds fitted to route');
		} catch (error) {
			console.error('[MapView drawRoute] Error drawing route:', error);
		}
	}

	function recenterMap() {
		if (!map) return;
		map.setCenter({ lat: center.lat, lng: center.lng });
		map.setZoom(GOOGLE_MAPS_CONFIG.defaultZoom);
	}

	$effect(() => {
		if (map && center) {
			map.setCenter({ lat: center.lat, lng: center.lng });
			if (userMarker) {
				userMarker.setPosition({ lat: center.lat, lng: center.lng });
			}
		}
	});

	$effect(() => {
		console.log('[MapView $effect] map:', map ? 'exists' : 'null', 'restaurants:', restaurants.length);

		if (!map) {
			console.log('[MapView $effect] Map not ready yet');
			return;
		}

		if (restaurants.length > 0) {
			console.log('[MapView $effect] Calling addRestaurantMarkers for', restaurants.length, 'restaurants');
			addRestaurantMarkers();
		} else {
			console.log('[MapView $effect] No restaurants, clearing markers');
			clearMarkers();
		}
	});

	$effect(() => {
		if (selectedRestaurant) {
			highlightSelectedRestaurant();
		}
	});

	$effect(() => {
		console.log('[MapView $effect route] route:', route ? 'exists' : 'null', 'map:', map ? 'exists' : 'null');
		if (route) {
			console.log('[MapView $effect route] Calling drawRoute');
			drawRoute();
		}
	});

	// Update map zoom when search radius changes
	$effect(() => {
		if (map && searchRadius) {
			const newZoom = getZoomLevelForRadius(searchRadius);
			console.log('[MapView $effect searchRadius] Updating zoom to', newZoom, 'for radius', searchRadius);
			map.setZoom(newZoom);
		}
	});
</script>

<div class="map-wrapper">
	<div bind:this={mapContainer} class="map-container"></div>

	<!-- Recenter Button -->
	<button type="button" class="recenter-button" onclick={recenterMap} title="현재 위치로 이동">
		📍
	</button>
</div>

<style>
	.map-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		min-height: 400px;
	}

	.map-container {
		width: 100%;
		height: 100%;
		min-height: 400px;
	}

	.recenter-button {
		position: absolute;
		top: 160px;
		right: 16px;
		width: 48px;
		height: 48px;
		border: none;
		border-radius: 50%;
		background: white;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
		font-size: 24px;
		cursor: pointer;
		transition: all 0.2s;
		z-index: 10;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.recenter-button:hover {
		background: #FFB4AB;
		transform: scale(1.1);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.recenter-button:active {
		transform: scale(0.95);
	}
</style>
