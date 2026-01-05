<script lang="ts">
	import type { Restaurant } from '$lib/types';
	import { formatDistance } from '$lib/services/directions';

	let {
		restaurant,
		onclick = () => {},
		mode = 'tile'
	}: {
		restaurant: Restaurant;
		onclick?: () => void;
		mode?: 'tile' | 'list';
	} = $props();

	let photoUrl = $derived(restaurant.photos[0] || 'https://via.placeholder.com/400x300?text=No+Image');
	let priceSymbols = $derived(restaurant.priceLevel ? '₩'.repeat(restaurant.priceLevel) : '-');
</script>

<button type="button" class="restaurant-card" class:list-mode={mode === 'list'} {onclick}>
	<div class="card-image">
		<img src={photoUrl} alt={restaurant.name} />
		{#if restaurant.openingHours && restaurant.openingHours.isOpen}
			<div class="status-badge open">
				영업중
			</div>
		{/if}
	</div>

	<div class="card-content">
		<h3 class="restaurant-name">{restaurant.name}</h3>

		<div class="restaurant-info">
			<div class="rating">
				<span class="star">⭐</span>
				<span class="rating-value">{restaurant.rating.toFixed(1)}</span>
				<span class="rating-count">({restaurant.userRatingsTotal})</span>
			</div>

			<div class="price-level">
				{priceSymbols}
			</div>
		</div>

		{#if restaurant.distance}
			<div class="distance">
				📍 {formatDistance(restaurant.distance)}
			</div>
		{/if}

		<p class="address">{restaurant.address}</p>
	</div>
</button>

<style>
	.restaurant-card {
		display: flex;
		flex-direction: column;
		background: white;
		border-radius: 16px;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s, box-shadow 0.2s;
		cursor: pointer;
		border: 2px solid transparent;
		text-align: left;
		width: 100%;
	}

	.restaurant-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(255, 180, 171, 0.3);
		border-color: #ffb4ab;
	}

	.restaurant-card.list-mode {
		flex-direction: row;
	}

	.card-image {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		flex-shrink: 0;
	}

	.list-mode .card-image {
		width: 150px;
		height: 150px;
	}

	.card-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.status-badge {
		position: absolute;
		top: 12px;
		right: 12px;
		padding: 4px 12px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		background: rgba(255, 255, 255, 0.9);
		color: #666;
	}

	.status-badge.open {
		background: #c7efcf;
		color: #2d6a4f;
	}

	.card-content {
		padding: 16px;
		display: flex;
		flex-direction: column;
		gap: 8px;
		flex: 1;
	}

	.restaurant-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.restaurant-info {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	.rating {
		display: flex;
		align-items: center;
		gap: 4px;
	}

	.star {
		font-size: 1rem;
	}

	.rating-value {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a4a4a;
	}

	.rating-count {
		font-size: 0.75rem;
		color: #999;
	}

	.price-level {
		font-size: 0.875rem;
		font-weight: 600;
		color: #ffb4ab;
	}

	.distance {
		font-size: 0.875rem;
		color: #666;
	}

	.address {
		font-size: 0.75rem;
		color: #999;
		margin: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
	}
</style>
