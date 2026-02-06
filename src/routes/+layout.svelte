<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import './layout.css';
	import favicon from '$lib/assets/app-icon.png';
	import UnauthorizedScreen from '$lib/components/UnauthorizedScreen.svelte';
	import { appAuthStore } from '$lib/stores/appAuth.svelte';

	let { children } = $props();

	let isInitialized = $state(false);
	let authState = $derived(appAuthStore.state);
	let authError = $derived(appAuthStore.error);

	// 루트 경로는 자체적으로 인증 처리하므로 제외
	let isRootPath = $derived($page.url.pathname === '/');

	onMount(async () => {
		// 루트 경로가 아닌 경우 인증 체크
		if (!isRootPath && authState === 'checking') {
			await appAuthStore.checkAuth();
		}
		isInitialized = true;
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if !isInitialized && !isRootPath}
	<!-- 초기화 중 빈 화면 -->
	<div class="initializing"></div>
{:else if authState === 'unauthorized' && !isRootPath}
	<UnauthorizedScreen message={authError || '이 콘텐츠는 FoodLICA 앱에서만 이용할 수 있습니다.'} />
{:else}
	{@render children()}
{/if}

<style>
	.initializing {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: #fafafa;
	}
</style>
