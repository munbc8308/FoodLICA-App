<script lang="ts">
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let passwordConfirm = $state('');
	let error = $state('');
	let loading = $state(false);

	async function handleSignup(e: Event) {
		e.preventDefault();
		error = '';

		// Validate password match
		if (password !== passwordConfirm) {
			error = '비밀번호가 일치하지 않습니다.';
			return;
		}

		// Validate password length
		if (password.length < 6) {
			error = '비밀번호는 최소 6자 이상이어야 합니다.';
			return;
		}

		loading = true;

		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/auth/signup`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({ email, password })
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.error || '회원가입에 실패했습니다.';
				loading = false;
				return;
			}

			// Redirect to login page with success message
			goto('/login?signup=success');
		} catch (err) {
			console.error('Signup error:', err);
			error = '회원가입 중 오류가 발생했습니다.';
			loading = false;
		}
	}
</script>

<div class="signup-page">
	<div class="signup-container">
		<div class="logo-section">
			<h1 class="app-name">🍴 Foodlica</h1>
			<p class="tagline">랜덤 맛집 추천 서비스</p>
		</div>

		<form class="signup-form" onsubmit={handleSignup}>
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
					placeholder="비밀번호를 입력하세요 (최소 6자)"
					required
					disabled={loading}
				/>
			</div>

			<div class="form-group">
				<label for="passwordConfirm">비밀번호 확인</label>
				<input
					id="passwordConfirm"
					type="password"
					bind:value={passwordConfirm}
					placeholder="비밀번호를 다시 입력하세요"
					required
					disabled={loading}
				/>
			</div>

			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<button type="submit" class="signup-button" disabled={loading}>
				{loading ? '가입 중...' : '회원가입'}
			</button>
		</form>

		<div class="login-link">
			<p>
				이미 계정이 있으신가요?
				<a href="/login">로그인</a>
			</p>
		</div>
	</div>
</div>

<style>
	.signup-page {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 1rem;
	}

	.signup-container {
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

	.signup-form {
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
		border-color: #b2e0d4;
		background: white;
	}

	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
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

	.signup-button {
		width: 100%;
		padding: 1rem;
		border: none;
		border-radius: 12px;
		background: linear-gradient(135deg, #b2e0d4 0%, #c7efcf 100%);
		color: #2d6a4f;
		font-size: 1rem;
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.signup-button:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(178, 224, 212, 0.4);
	}

	.signup-button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.login-link {
		margin-top: 1.5rem;
		text-align: center;
		font-size: 0.875rem;
		color: #999;
	}

	.login-link a {
		color: #b2e0d4;
		font-weight: 600;
		text-decoration: none;
		transition: color 0.2s;
	}

	.login-link a:hover {
		color: #95d3c2;
	}
</style>
