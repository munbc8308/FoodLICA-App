<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import LoadingScreen from '$lib/components/LoadingScreen.svelte';
	import UnauthorizedScreen from '$lib/components/UnauthorizedScreen.svelte';
	import { locationStore } from '$lib/stores/location.svelte';
	import { initGoogleMaps } from '$lib/services/googleMaps';
	import { appAuthStore } from '$lib/stores/appAuth.svelte';

	let loadingMessage = $state('앱 인증 확인 중...');
	let error = $state<string | null>(null);
	let authState = $derived(appAuthStore.state);
	let authError = $derived(appAuthStore.error);

	onMount(async () => {
		const startTime = Date.now();

		try {
			// 1. 앱 인증 확인
			loadingMessage = '앱 인증 확인 중...';
			const isAuthorized = await appAuthStore.checkAuth();

			if (!isAuthorized) {
				// 인증 실패 - UnauthorizedScreen이 표시됨
				return;
			}

			// 2. Google Maps 초기화
			loadingMessage = 'Google Maps를 로드하는 중...';
			await initGoogleMaps();

			// 3. 현재 위치 가져오기
			loadingMessage = '위치를 찾고 있습니다...';
			await locationStore.fetchCurrentLocation();

			// 최소 2초 표시 보장
			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 2000 - elapsed);
			await new Promise((resolve) => setTimeout(resolve, remaining));

			// 위치 확인 및 메인 페이지로 이동
			if (locationStore.location) {
				goto('/main');
			} else {
				error = '위치를 가져올 수 없습니다. 기본 위치를 사용합니다.';
				locationStore.useFallbackLocation();
				setTimeout(() => goto('/main'), 1500);
			}
		} catch (err) {
			console.error('Initialization error:', err);
			error = err instanceof Error ? err.message : '초기화 중 오류가 발생했습니다.';
			locationStore.useFallbackLocation();

			const elapsed = Date.now() - startTime;
			const remaining = Math.max(0, 2000 - elapsed);
			setTimeout(() => goto('/main'), remaining);
		}
	});
</script>

{#if authState === 'unauthorized'}
	<UnauthorizedScreen message={authError || '이 콘텐츠는 FoodLICA 앱에서만 이용할 수 있습니다.'} />
{:else if error}
	<LoadingScreen message={error} />
{:else}
	<LoadingScreen message={loadingMessage} />
{/if}
