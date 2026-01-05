<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import RestaurantTileGrid from '$lib/components/RestaurantTileGrid.svelte';
	import RestaurantList from '$lib/components/RestaurantList.svelte';
	import { restaurantsStore } from '$lib/stores/restaurants.svelte';
	import { settingsStore } from '$lib/stores/settings.svelte';
	import type { Restaurant } from '$lib/types';
	import { RECOMMENDATION_COUNT } from '$lib/constants';

	let recommended = $derived(restaurantsStore.recommended);
	let layoutMode = $derived(settingsStore.settings.layoutMode);

	onMount(() => {
		// If no recommendations, redirect back to main
		if (recommended.length === 0) {
			alert('추천 식당이 없습니다. 먼저 검색해주세요.');
			goto('/main');
		}
	});

	function handleSelect(restaurant: Restaurant) {
		restaurantsStore.selectRestaurant(restaurant.id);
		goto('/route');
	}

	function handleReroll() {
		restaurantsStore.generateRecommendations(RECOMMENDATION_COUNT);
	}

	function handleBack() {
		goto('/main');
	}

	function toggleLayoutMode() {
		const newMode = layoutMode === 'tile' ? 'list' : 'tile';
		settingsStore.updateSettings({ layoutMode: newMode });
	}
</script>

<div class="recommend-page">
	<header class="page-header">
		<button type="button" class="back-button" onclick={handleBack}>
			← 뒤로
		</button>
		<h1 class="page-title">랜덤 추천 ({recommended.length}개)</h1>
		<button type="button" class="layout-toggle" onclick={toggleLayoutMode}>
			{layoutMode === 'tile' ? '📋' : '▦'}
		</button>
	</header>

	<div class="content">
		{#if layoutMode === 'tile'}
			<RestaurantTileGrid restaurants={recommended} onSelect={handleSelect} />
		{:else}
			<RestaurantList restaurants={recommended} onSelect={handleSelect} />
		{/if}
	</div>

	<div class="actions">
		<button type="button" class="reroll-button" onclick={handleReroll}>
			🎲 다시 뽑기
		</button>
	</div>
</div>

<style>
	.recommend-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		display: flex;
		flex-direction: column;
	}

	.page-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem;
		background: white;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		position: sticky;
		top: 0;
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
		font-size: 1.25rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
	}

	.layout-toggle {
		padding: 0.5rem;
		border: none;
		background: transparent;
		font-size: 1.5rem;
		cursor: pointer;
	}

	.content {
		flex: 1;
		padding: 1rem;
		overflow-y: auto;
	}

	.actions {
		padding: 1rem;
		background: white;
		box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
	}

	.reroll-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #e6d9f2 0%, #d4c5f9 100%);
		color: #6b21a8;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.reroll-button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(212, 197, 249, 0.4);
	}
</style>
