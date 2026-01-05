<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let status = $derived($page.status);
	let message = $derived($page.error?.message || '알 수 없는 오류가 발생했습니다.');

	function handleGoHome() {
		goto('/');
	}

	function handleGoBack() {
		window.history.back();
	}
</script>

<div class="error-page">
	<div class="error-container">
		<div class="error-icon">
			{#if status === 404}
				🔍
			{:else}
				⚠️
			{/if}
		</div>

		<h1 class="error-code">{status}</h1>

		<h2 class="error-title">
			{#if status === 404}
				페이지를 찾을 수 없습니다
			{:else if status === 500}
				서버 오류가 발생했습니다
			{:else}
				오류가 발생했습니다
			{/if}
		</h2>

		<p class="error-message">{message}</p>

		<div class="error-actions">
			<button type="button" class="action-button primary" onclick={handleGoHome}>
				🏠 홈으로 가기
			</button>
			<button type="button" class="action-button secondary" onclick={handleGoBack}>
				← 뒤로 가기
			</button>
		</div>
	</div>
</div>

<style>
	.error-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 2rem;
	}

	.error-container {
		text-align: center;
		max-width: 500px;
		width: 100%;
		background: white;
		border-radius: 20px;
		padding: 3rem 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.error-icon {
		font-size: 5rem;
		margin-bottom: 1rem;
		animation: bounce 2s ease-in-out infinite;
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

	.error-code {
		font-size: 4rem;
		font-weight: 700;
		color: #ffb4ab;
		margin: 0 0 1rem 0;
		line-height: 1;
	}

	.error-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 1rem 0;
	}

	.error-message {
		font-size: 1rem;
		color: #999;
		margin: 0 0 2rem 0;
	}

	.error-actions {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.action-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.action-button.primary {
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
	}

	.action-button.primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.action-button.secondary {
		background: white;
		border: 2px solid #f5f5f5;
		color: #4a4a4a;
	}

	.action-button.secondary:hover {
		background: #fafafa;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	@media (max-width: 480px) {
		.error-container {
			padding: 2rem 1.5rem;
		}

		.error-code {
			font-size: 3rem;
		}

		.error-title {
			font-size: 1.25rem;
		}
	}
</style>
