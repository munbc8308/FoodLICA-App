<script lang="ts">
	import { goto } from '$app/navigation';
	import MapView from '$lib/components/MapView.svelte';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import { locationStore } from '$lib/stores/location.svelte';
	import { restaurantsStore } from '$lib/stores/restaurants.svelte';
	import { settingsStore } from '$lib/stores/settings.svelte';
	import { RECOMMENDATION_COUNT } from '$lib/constants';

	let location = $derived(locationStore.location);
	let restaurants = $derived(restaurantsStore.restaurants);
	let loadingState = $derived(restaurantsStore.loadingState);
	let searchRadius = $derived(settingsStore.settings.radius);

	function handleGetRecommendations() {
		if (restaurants.length === 0) {
			alert('먼저 식당을 검색해주세요!');
			return;
		}

		// Generate recommendations
		restaurantsStore.generateRecommendations(RECOMMENDATION_COUNT);

		// Navigate to recommendations page
		goto('/recommend');
	}
</script>

<div class="main-page">
	{#if location}
		<MapView center={location} {restaurants} {searchRadius} />
	{/if}

	<BottomSheet>
		<FilterPanel />

		{#if restaurants.length > 0}
			<button type="button" class="recommend-button" onclick={handleGetRecommendations}>
				🎲 랜덤 추천 받기 ({RECOMMENDATION_COUNT}개)
			</button>
		{/if}

		{#if loadingState === 'error'}
			<div class="error-message">
				{restaurantsStore.error}
			</div>
		{/if}
	</BottomSheet>
</div>

<style>
	.main-page {
		position: relative;
		width: 100%;
		height: 100vh;
		overflow: hidden;
	}

	.recommend-button {
		width: 100%;
		padding: 1rem;
		margin-top: 1rem;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #b2e0d4 0%, #c7efcf 100%);
		color: #2d6a4f;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.recommend-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(178, 224, 212, 0.4);
	}

	.error-message {
		padding: 1rem;
		margin-top: 1rem;
		border-radius: 8px;
		background: #fee;
		color: #c33;
		font-size: 0.875rem;
		text-align: center;
	}
</style>
