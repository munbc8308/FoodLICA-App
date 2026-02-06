<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import { locationStore } from '$lib/stores/location.svelte';
	import { initGoogleMaps } from '$lib/services/googleMaps';

	let loadingMessage = $state('위치를 찾고 있습니다...');
	let error = $state<string | null>(null);

	onMount(async () => {
		const startTime = Date.now();

		try {
			// Initialize Google Maps first
			loadingMessage = 'Google Maps를 로드하는 중...';
			await initGoogleMaps();

			// Fetch current location
			loadingMessage = '위치를 찾고 있습니다...';
			await locationStore.fetchCurrentLocation();

			// Ensure minimum 2 seconds display time
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 2000 - elapsed);
			await new Promise((resolve) => setTimeout(resolve, remaining));

			// Check if location was successfully obtained
			if (locationStore.location) {
				// Redirect to main page
				goto('/main');
			} else {
				error = '위치를 가져올 수 없습니다. 기본 위치를 사용합니다.';
				// Use fallback location and redirect
				locationStore.useFallbackLocation();
				setTimeout(() => goto('/main'), 1500);
			}
		} catch (err) {
			console.error('Initialization error:', err);
			error = err instanceof Error ? err.message : '초기화 중 오류가 발생했습니다.';
			// Use fallback and redirect anyway
			locationStore.useFallbackLocation();

			// Ensure minimum 2 seconds display time
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 2000 - elapsed);
			setTimeout(() => goto('/main'), remaining);
		}
	});
</script>

{#if error}
	<LoadingScreen message={error} />
{:else}
	<LoadingScreen message={loadingMessage} />
{/if}
