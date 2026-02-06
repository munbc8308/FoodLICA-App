<script lang="ts">
	import logo from '$lib/assets/logo.png';

	let { message = '위치를 찾고 있습니다...' }: { message?: string } = $props();
</script>

<div class="loading-screen">
	<div class="loading-content">
		<div class="logo">
			<img src={logo} alt="FoodLICA" class="logo-image" />
		</div>

		<div class="spinner"></div>

		<p class="loading-message">{message}</p>
	</div>
</div>

<style>
	.loading-screen {
		position: fixed;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #ffdab9 0%, #c7efcf 50%, #d4c5f9 100%);
		z-index: 9999;
	}

	.loading-content {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2rem;
	}

	.logo {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}

	.logo-image {
		width: 180px;
		height: auto;
		animation: bounce 1.5s ease-in-out infinite;
		mix-blend-mode: multiply;
		border-radius: 20px;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(255, 180, 171, 0.3);
		border-top-color: #ffb4ab;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-message {
		font-size: 1rem;
		color: #4a4a4a;
		opacity: 0.8;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-10px);
		}
	}
</style>
