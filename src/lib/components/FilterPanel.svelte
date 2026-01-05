<script lang="ts">
	import { settingsStore } from '$lib/stores/settings.svelte';
	import { restaurantsStore } from '$lib/stores/restaurants.svelte';
	import { RADIUS_OPTIONS, RATING_OPTIONS, RESTAURANT_CATEGORIES } from '$lib/constants';

	let settings = $derived(settingsStore.settings);
	let isLoading = $derived(restaurantsStore.loadingState === 'loading');
	let restaurantCount = $derived(restaurantsStore.restaurants.length);

	function handleRadiusChange(e: Event) {
		const value = Number((e.target as HTMLInputElement).value);
		settingsStore.updateSettings({ radius: value });
	}

	function handleRatingChange(e: Event) {
		const value = Number((e.target as HTMLSelectElement).value);
		settingsStore.updateSettings({ minRating: value });
	}

	function handleCategoryToggle(categoryValue: string) {
		const currentCategories = settings.categories;
		const newCategories = currentCategories.includes(categoryValue)
			? currentCategories.filter((c) => c !== categoryValue)
			: [...currentCategories, categoryValue];
		settingsStore.updateSettings({ categories: newCategories });
	}

	function handleOpenNowToggle() {
		settingsStore.updateSettings({ onlyOpenNow: !settings.onlyOpenNow });
	}

	function handleLayoutModeToggle() {
		const newMode = settings.layoutMode === 'tile' ? 'list' : 'tile';
		settingsStore.updateSettings({ layoutMode: newMode });
	}

	async function handleSearch() {
		await restaurantsStore.searchRestaurants();
	}
</script>

<div class="filter-panel">
	<h2 class="panel-title">검색 필터</h2>

	<!-- Radius Slider -->
	<div class="filter-group">
		<label class="filter-label" for="radius-slider">
			검색 반경: <span class="filter-value">{settings.radius}m</span>
		</label>
		<input
			id="radius-slider"
			type="range"
			min="300"
			max="1000"
			step="100"
			value={settings.radius}
			oninput={handleRadiusChange}
			class="slider"
		/>
		<div class="range-labels">
			<span>300m</span>
			<span>1km</span>
		</div>
	</div>

	<!-- Minimum Rating -->
	<div class="filter-group">
		<label class="filter-label" for="min-rating">최소 평점</label>
		<select id="min-rating" value={settings.minRating} onchange={handleRatingChange} class="select">
			{#each RATING_OPTIONS as option}
				<option value={option.value}>{option.label}</option>
			{/each}
		</select>
	</div>

	<!-- Categories -->
	<div class="filter-group">
		<p class="filter-label">카테고리</p>
		<div class="checkbox-group">
			{#each RESTAURANT_CATEGORIES as category}
				<label class="checkbox-label">
					<input
						type="checkbox"
						checked={settings.categories.includes(category.value)}
						onchange={() => handleCategoryToggle(category.value)}
						class="checkbox"
					/>
					<span>{category.label}</span>
				</label>
			{/each}
		</div>
	</div>

	<!-- Additional Options -->
	<div class="filter-group">
		<label class="checkbox-label">
			<input
				type="checkbox"
				checked={settings.onlyOpenNow}
				onchange={handleOpenNowToggle}
				class="checkbox"
			/>
			<span>현재 영업중인 곳만</span>
		</label>
	</div>

	<!-- Layout Mode Toggle -->
	<div class="filter-group">
		<label class="checkbox-label">
			<input
				type="checkbox"
				checked={settings.layoutMode === 'list'}
				onchange={handleLayoutModeToggle}
				class="checkbox"
			/>
			<span>리스트 보기 (타일 보기는 체크 해제)</span>
		</label>
	</div>

	<!-- Search Button -->
	<button
		type="button"
		class="search-button"
		disabled={isLoading}
		onclick={handleSearch}
	>
		{#if isLoading}
			검색 중...
		{:else if restaurantCount > 0}
			식당 찾기 ({restaurantCount}개)
		{:else}
			식당 찾기
		{/if}
	</button>
</div>

<style>
	.filter-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.panel-title {
		font-size: 1.25rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.filter-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a4a4a;
	}

	.filter-value {
		color: #ffb4ab;
		font-weight: 700;
	}

	.slider {
		width: 100%;
		height: 6px;
		border-radius: 3px;
		background: #f5f5f5;
		outline: none;
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffb4ab;
		cursor: pointer;
	}

	.slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: #ffb4ab;
		cursor: pointer;
		border: none;
	}

	.range-labels {
		display: flex;
		justify-content: space-between;
		font-size: 0.75rem;
		color: #999;
	}

	.select {
		padding: 0.5rem;
		border: 2px solid #f5f5f5;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #4a4a4a;
		background: white;
		cursor: pointer;
	}

	.select:focus {
		outline: none;
		border-color: #ffb4ab;
	}

	.checkbox-group {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4a4a4a;
		cursor: pointer;
	}

	.checkbox {
		width: 18px;
		height: 18px;
		cursor: pointer;
	}

	.search-button {
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

	.search-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.search-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
</style>
