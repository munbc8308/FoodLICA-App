<script lang="ts">
	import type { Restaurant } from '$lib/types';
	import RestaurantCard from './RestaurantCard.svelte';

	let {
		restaurants,
		onSelect
	}: {
		restaurants: Restaurant[];
		onSelect: (restaurant: Restaurant) => void;
	} = $props();
</script>

<div class="tile-grid">
	{#each restaurants as restaurant (restaurant.id)}
		<RestaurantCard {restaurant} onclick={() => onSelect(restaurant)} mode="tile" />
	{/each}
</div>

{#if restaurants.length === 0}
	<div class="empty-state">
		<p>추천할 식당이 없습니다.</p>
		<p class="empty-subtitle">검색 필터를 조정해보세요.</p>
	</div>
{/if}

<style>
	.tile-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 16px;
		padding: 16px 0;
	}

	@media (max-width: 1024px) {
		.tile-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 640px) {
		.tile-grid {
			grid-template-columns: 1fr;
		}
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: #999;
	}

	.empty-state p {
		margin: 0;
		font-size: 1rem;
	}

	.empty-subtitle {
		font-size: 0.875rem;
		margin-top: 0.5rem !important;
	}
</style>
