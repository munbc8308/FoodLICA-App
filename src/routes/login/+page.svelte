<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	let email = $state('');
	let password = $state('');
	let error = $state('');
	let loading = $state(false);
	let successMessage = $state('');

	$effect(() => {
		// Check if redirected from signup
		if ($page.url.searchParams.get('signup') === 'success') {
			successMessage = '회원가입이 완료되었습니다. 로그인해주세요.';
			// Clear the URL parameter
			const url = new URL($page.url);
			url.searchParams.delete('signup');
			window.history.replaceState({}, '', url);
		}
	});

	async function handleLogin(e: Event) {
		e.preventDefault();
		error = '';
		loading = true;

		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const loginUrl = `${API_URL}/api/auth/login`;

			console.log('[Login] API URL:', API_URL);
			console.log('[Login] Full URL:', loginUrl);
			console.log('[Login] Email:', email);

			const response = await fetch(loginUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email, password })
			});

			console.log('[Login] Response status:', response.status);

			const data = await response.json();
			console.log('[Login] Response data:', data);

			if (!response.ok) {
				error = data.error || '로그인에 실패했습니다.';
				loading = false;
				return;
			}

			// Redirect to main page
			goto('/main');
		} catch (err) {
			console.error('[Login] Error:', err);
			error = '로그인 중 오류가 발생했습니다: ' + (err instanceof Error ? err.message : String(err));
			loading = false;
		}
	}
</script>

<div class="login-page">
	<div class="login-container">
		<div class="logo-section">
			<h1 class="app-name">🍴 Foodlica</h1>
			<p class="tagline">랜덤 맛집 추천 서비스</p>
		</div>

		<form class="login-form" onsubmit={handleLogin}>
			<div class="form-group">
				<label for="email">이메일</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="example@email.com"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="password">비밀번호</label>
				<input
					id="password"
					type="password"
					bind:value={password}
					placeholder="비밀번호를 입력하세요"
					required
					disabled={loading}
				/>
			</div>

			{#if successMessage}
				<div class="success-message">{successMessage}</div>
			{/if}

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<button type="submit" class="login-button" disabled={loading}>
				{loading ? '로그인 중...' : '로그인'}
			</button>
		</form>

		<div class="signup-link">
			<p>
				계정이 없으신가요?
				<a href="/signup">회원가입</a>
			</p>
		</div>
	</div>
</div>

<style>
	.login-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 1rem;
	}

	.login-container {
		width: 100%;
		max-width: 400px;
		background: white;
		border-radius: 20px;
		padding: 2rem;
		box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
	}

	.logo-section {
		text-align: center;
		margin-bottom: 2rem;
	}

	.app-name {
		font-size: 2rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.5rem 0;
	}

	.tagline {
		font-size: 0.875rem;
		color: #999;
		margin: 0;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a4a4a;
	}

	.form-group input {
		padding: 0.875rem 1rem;
		border: 2px solid #f5f5f5;
		border-radius: 12px;
		font-size: 1rem;
		transition: all 0.2s;
		background: #fafafa;
	}

	.form-group input:focus {
		outline: none;
		border-color: #ffb4ab;
		background: white;
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.success-message {
		padding: 0.875rem;
		background: #f0fdf4;
		border: 1px solid #b2e0d4;
		border-radius: 8px;
		color: #2d6a4f;
		font-size: 0.875rem;
		text-align: center;
	}

	.error-message {
		padding: 0.875rem;
		background: #fff4f4;
		border: 1px solid #ffb4ab;
		border-radius: 8px;
		color: #c33;
		font-size: 0.875rem;
		text-align: center;
	}

	.login-button {
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

	.login-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.login-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.signup-link {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.875rem;
		color: #999;
	}

	.signup-link a {
		color: #ffb4ab;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s;
	}

	.signup-link a:hover {
		color: #ff9a90;
	}
</style>
