<script lang="ts">
	import logo from '$lib/assets/logo.png';

	let { message = '이 콘텐츠는 FoodLICA 앱에서만 이용할 수 있습니다.' }: { message?: string } =
		$props();
</script>

<div class="unauthorized-screen">
	<div class="content">
		<img src={logo} alt="FoodLICA" class="logo" />
		<div class="icon">🔒</div>
		<h1 class="title">접근 제한</h1>
		<p class="message">{message}</p>
		<div class="info">
			<p>FoodLICA 앱을 설치하고 실행해주세요.</p>
		</div>
	</div>
</div>

<style>
	.unauthorized-screen {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 2rem;
	}

	.content {
		text-align: center;
		max-width: 400px;
	}

	.logo {
		width: 100px;
		height: auto;
		margin-bottom: 1.5rem;
	}

	.icon {
		font-size: 3rem;
		margin-bottom: 1rem;
	}

	.title {
		font-size: 1.75rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 1rem 0;
	}

	.message {
		font-size: 1rem;
		color: #666;
		margin: 0 0 2rem 0;
		line-height: 1.6;
	}

	.info {
		padding: 1.5rem;
		background: white;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	.info p {
		margin: 0;
		font-size: 0.875rem;
		color: #999;
	}
</style>
