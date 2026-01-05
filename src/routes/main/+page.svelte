<script lang="ts">
	import { goto } from '$app/navigation';
	import MapView from '$lib/components/MapView.svelte';
	import BottomSheet from '$lib/components/BottomSheet.svelte';
	import FilterPanel from '$lib/components/FilterPanel.svelte';
	import SideMenu from '$lib/components/SideMenu.svelte';
	import { locationStore } from '$lib/stores/location.svelte';
	import { restaurantsStore } from '$lib/stores/restaurants.svelte';
	import { settingsStore } from '$lib/stores/settings.svelte';
	import { RECOMMENDATION_COUNT } from '$lib/constants';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let location = $derived(locationStore.location);
	let restaurants = $derived(restaurantsStore.restaurants);
	let loadingState = $derived(restaurantsStore.loadingState);
	let searchRadius = $derived(settingsStore.settings.radius);

	// Side menu state
	let isSideMenuOpen = $state(false);

	function toggleSideMenu() {
		isSideMenuOpen = !isSideMenuOpen;
	}

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
	<!-- Hamburger Menu Button -->
	<button type="button" class="menu-button" onclick={toggleSideMenu} aria-label="메뉴 열기">
		<div class="hamburger">
			<span></span>
			<span></span>
			<span></span>
		</div>
	</button>

	<!-- Side Menu -->
	<SideMenu bind:isOpen={isSideMenuOpen} userEmail={data.user?.email || ''} />

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

	/* Hamburger Menu Button */
	.menu-button {
		position: fixed;
		top: 1rem;
		left: 1rem;
		z-index: 900;
		background: white;
		border: none;
		border-radius: 50%;
		width: 56px;
		height: 56px;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		cursor: pointer;
		transition: all 0.2s;
	}

	.menu-button:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
		transform: scale(1.05);
	}

	.menu-button:active {
		transform: scale(0.95);
	}

	.hamburger {
		width: 24px;
		height: 18px;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
	}

	.hamburger span {
		display: block;
		width: 100%;
		height: 3px;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		border-radius: 2px;
		transition: all 0.3s;
	}

	.menu-button:hover .hamburger span {
		background: linear-gradient(135deg, #ff9b91 0%, #ffcba4 100%);
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
