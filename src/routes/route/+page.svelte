<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import MapView from '$lib/components/MapView.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import { locationStore } from '$lib/stores/location.svelte';
	import { restaurantsStore } from '$lib/stores/restaurants.svelte';
	import { routeStore } from '$lib/stores/route.svelte';
	import { formatDistance } from '$lib/services/directions';
	import type { ReviewFormData } from '$lib/types';

	let location = $derived(locationStore.location);
	let selectedRestaurant = $derived(restaurantsStore.selected);
	let route = $derived(routeStore.route);
	let loadingState = $derived(routeStore.loadingState);

	// Review modal state
	let showReviewModal = $state(false);

	onMount(async () => {
		console.log('[Route Page] onMount - location:', location);
		console.log('[Route Page] onMount - selectedRestaurant:', selectedRestaurant);

		// If no selected restaurant, redirect back
		if (!selectedRestaurant) {
			console.error('[Route Page] No selected restaurant!');
			alert('선택된 식당이 없습니다.');
			goto('/recommend');
			return;
		}

		console.log('[Route Page] Selected restaurant:', {
			name: selectedRestaurant.name,
			location: selectedRestaurant.location
		});

		// Fetch route if user location is available
		if (location && selectedRestaurant) {
			console.log('[Route Page] Fetching route from', location, 'to', selectedRestaurant.location);
			await routeStore.fetchRoute(location, selectedRestaurant.location);
		} else if (!location) {
			console.warn('[Route Page] No user location available, skipping route fetch');
		}
	});

	function handleBack() {
		routeStore.clearRoute();
		goto('/recommend');
	}

	function handleStartNavigation() {
		if (!selectedRestaurant) return;

		// Open Google Maps with directions
		const destination = `${selectedRestaurant.location.lat},${selectedRestaurant.location.lng}`;
		const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
		window.open(url, '_blank');
	}

	function handleCompleteVisit() {
		showReviewModal = true;
	}

	function closeReviewModal() {
		showReviewModal = false;
	}

	async function handleReviewSubmit(formData: ReviewFormData) {
		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/reviews`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '후기 작성 실패');
			}

			// Success - close modal and navigate
			showReviewModal = false;
			alert('후기가 작성되었습니다! 🎉');
			goto('/reviews');
		} catch (error) {
			console.error('Review submit error:', error);
			throw error; // Let ReviewForm handle the error
		}
	}
</script>

<div class="route-page">
	<header class="page-header">
		<button type="button" class="back-button" onclick={handleBack}>
			← 뒤로
		</button>
		<h1 class="page-title">경로 안내</h1>
	</header>

	{#if selectedRestaurant}
		{@const restaurantArray = [selectedRestaurant]}
		{@const mapCenter = location || selectedRestaurant.location}
		{@const _ = console.log('[Route Page Render] restaurantArray:', restaurantArray)}
		{@const __ = console.log('[Route Page Render] location:', location)}
		{@const ___ = console.log('[Route Page Render] mapCenter:', mapCenter)}
		{@const ____ = console.log('[Route Page Render] selectedRestaurant:', selectedRestaurant)}
		<div class="map-container">
			<MapView
				center={mapCenter}
				restaurants={restaurantArray}
				selectedRestaurant={selectedRestaurant}
				{route}
				showUserMarker={location !== null}
			/>
		</div>

		<div class="info-panel">
			<div class="restaurant-info">
				<h2 class="restaurant-name">{selectedRestaurant.name}</h2>
				<div class="restaurant-meta">
					<span class="rating">⭐ {selectedRestaurant.rating.toFixed(1)}</span>
					{#if selectedRestaurant.distance && location}
						<span class="distance">📍 {formatDistance(selectedRestaurant.distance)}</span>
					{/if}
				</div>
				<p class="address">{selectedRestaurant.address}</p>
			</div>

			{#if loadingState === 'loading'}
				<div class="loading">경로를 계산하는 중...</div>
			{:else if loadingState === 'error'}
				<div class="error-box">
					<p class="error-title">경로 계산 실패</p>
					<p class="error-message">{routeStore.error}</p>
					{#if selectedRestaurant.distance && location}
						<div class="fallback-info">
							<p class="fallback-label">직선 거리</p>
							<p class="fallback-value">📍 {formatDistance(selectedRestaurant.distance)}</p>
						</div>
					{/if}
				</div>
			{:else if route}
				<div class="route-info">
					<h3 class="section-title">경로 정보</h3>
					<div class="route-stats">
						<div class="stat">
							<div class="stat-label">거리</div>
							<div class="stat-value">{route.distance}</div>
						</div>
						<div class="stat">
							<div class="stat-label">소요 시간</div>
							<div class="stat-value">{route.duration}</div>
						</div>
					</div>
				</div>
			{/if}

			<div class="actions">
				<button type="button" class="nav-button" onclick={handleStartNavigation}>
					🗺️ Google Maps로 길찾기
				</button>
				<button type="button" class="complete-button" onclick={handleCompleteVisit}>
					✏️ 후기 작성하기
				</button>
			</div>
		</div>
	{:else}
		<div class="error-state">
			<p>선택된 식당이 없습니다.</p>
			<button type="button" onclick={() => goto('/recommend')}>뒤로 가기</button>
		</div>
	{/if}

	<!-- Review Modal -->
	{#if showReviewModal && selectedRestaurant}
		<div class="modal-overlay" role="presentation" onclick={closeReviewModal} onkeydown={(e) => e.key === 'Escape' && closeReviewModal()}>
			<div class="modal-content" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
				<ReviewForm
					restaurant={{
						id: selectedRestaurant.placeId,
						name: selectedRestaurant.name
					}}
					onSubmit={handleReviewSubmit}
					onCancel={closeReviewModal}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.route-page {
		display: flex;
		flex-direction: column;
		height: 100vh;
		background: #fafafa;
	}

	.page-header {
		display: flex;
		align-items: center;
		padding: 1rem;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		z-index: 100;
	}

	.back-button {
		padding: 0.5rem 1rem;
		border: none;
		background: transparent;
		color: #4a4a4a;
		font-size: 1rem;
		cursor: pointer;
		font-weight: 600;
	}

	.page-title {
		flex: 1;
		text-align: center;
		font-size: 1.25rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
	}

	.map-container {
		flex: 1;
		min-height: 300px;
	}

	.info-panel {
		background: white;
		border-radius: 20px 20px 0 0;
		padding: 1.5rem;
		box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
	}

	.restaurant-info {
		margin-bottom: 1.5rem;
	}

	.restaurant-name {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.5rem 0;
	}

	.restaurant-meta {
		display: flex;
		gap: 1rem;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}

	.rating {
		color: #4a4a4a;
		font-weight: 600;
	}

	.distance {
		color: #666;
	}

	.address {
		color: #999;
		font-size: 0.875rem;
		margin: 0;
	}

	.loading {
		padding: 1rem;
		text-align: center;
		border-radius: 8px;
		margin-bottom: 1rem;
		background: #f0f0f0;
		color: #666;
	}

	.error-box {
		padding: 1rem;
		border-radius: 8px;
		margin-bottom: 1rem;
		background: #fff4f4;
		border: 1px solid #ffb4ab;
	}

	.error-title {
		font-size: 0.875rem;
		font-weight: 600;
		color: #c33;
		margin: 0 0 0.5rem 0;
	}

	.error-message {
		font-size: 0.75rem;
		color: #999;
		margin: 0 0 1rem 0;
	}

	.fallback-info {
		padding: 0.75rem;
		background: white;
		border-radius: 6px;
		text-align: center;
	}

	.fallback-label {
		font-size: 0.75rem;
		color: #999;
		margin: 0 0 0.25rem 0;
	}

	.fallback-value {
		font-size: 1.125rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
	}

	.route-info {
		margin-bottom: 1.5rem;
	}

	.section-title {
		font-size: 1rem;
		font-weight: 600;
		color: #4a4a4a;
		margin: 0 0 1rem 0;
	}

	.route-stats {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.stat {
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
		text-align: center;
	}

	.stat-label {
		font-size: 0.75rem;
		color: #999;
		margin-bottom: 0.25rem;
	}

	.stat-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #4a4a4a;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.nav-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.nav-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.complete-button {
		width: 100%;
		padding: 1rem;
		border: 2px solid #b2e0d4;
		border-radius: 12px;
		background: white;
		color: #2d6a4f;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s;
	}

	.complete-button:hover {
		background: #c7efcf;
	}

	.error-state {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		padding: 2rem;
		color: #999;
	}

	.error-state button {
		padding: 0.75rem 1.5rem;
		border: 2px solid #ffb4ab;
		border-radius: 8px;
		background: white;
		color: #ffb4ab;
		font-weight: 600;
		cursor: pointer;
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}
</style>
