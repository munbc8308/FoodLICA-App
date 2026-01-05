<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Password change form
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	let passwordChangeError = $state('');
	let passwordChangeSuccess = $state('');
	let isChangingPassword = $state(false);

	// Account deletion
	let isDeletingAccount = $state(false);

	// Format date
	function formatDate(date: Date | null | undefined): string {
		if (!date) return '';
		const d = new Date(date);
		return d.toLocaleDateString('ko-KR', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		});
	}

	async function handlePasswordChange() {
		passwordChangeError = '';
		passwordChangeSuccess = '';

		// Validation
		if (!currentPassword || !newPassword || !confirmPassword) {
			passwordChangeError = '모든 필드를 입력해주세요.';
			return;
		}

		if (newPassword !== confirmPassword) {
			passwordChangeError = '새 비밀번호가 일치하지 않습니다.';
			return;
		}

		if (newPassword.length < 6) {
			passwordChangeError = '비밀번호는 최소 6자 이상이어야 합니다.';
			return;
		}

		isChangingPassword = true;

		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/auth/change-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || '비밀번호 변경 실패');
			}

			passwordChangeSuccess = '비밀번호가 성공적으로 변경되었습니다.';
			currentPassword = '';
			newPassword = '';
			confirmPassword = '';
		} catch (error) {
			passwordChangeError = error instanceof Error ? error.message : '오류가 발생했습니다.';
		} finally {
			isChangingPassword = false;
		}
	}

	async function handleDeleteAccount() {
		const confirmed = confirm(
			'정말로 계정을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.'
		);

		if (!confirmed) return;

		const doubleConfirm = confirm('다시 한번 확인합니다. 계정을 삭제하시겠습니까?');

		if (!doubleConfirm) return;

		isDeletingAccount = true;

		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/auth/delete-account`, {
				method: 'DELETE',
				credentials: 'include'
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || '계정 삭제 실패');
			}

			alert('계정이 삭제되었습니다.');
			goto('/login');
		} catch (error) {
			alert(error instanceof Error ? error.message : '오류가 발생했습니다.');
		} finally {
			isDeletingAccount = false;
		}
	}
</script>

<div class="profile-page">
	<!-- Header -->
	<header class="page-header">
		<h1 class="page-title">내 정보</h1>
		<a href="/main" class="back-link">← 메인으로</a>
	</header>

	<!-- Profile Section -->
	{#if data.user}
		<div class="profile-section">
			<div class="profile-icon">👤</div>
			<div class="profile-info">
				<h2 class="user-email">{data.user.email}</h2>
				<p class="join-date">가입일: {formatDate(data.user.createdAt)}</p>
			</div>
		</div>

		<!-- Statistics -->
		{#if data.stats}
			<div class="stats-section">
				<h3 class="section-title">활동 통계</h3>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">📝</div>
						<div class="stat-value">{data.stats.totalReviews}</div>
						<div class="stat-label">총 후기</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">⭐</div>
						<div class="stat-value">{data.stats.averageRating.toFixed(1)}</div>
						<div class="stat-label">평균 평점</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">💚</div>
						<div class="stat-value">{data.stats.wouldVisitAgainCount}</div>
						<div class="stat-label">재방문 의사</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Password Change Section -->
		<div class="section">
			<h3 class="section-title">비밀번호 변경</h3>
			<div class="password-form">
				<div class="form-group">
					<label class="form-label" for="current-password">현재 비밀번호</label>
					<input
						id="current-password"
						type="password"
						class="form-input"
						bind:value={currentPassword}
						placeholder="현재 비밀번호를 입력하세요"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="new-password">새 비밀번호</label>
					<input
						id="new-password"
						type="password"
						class="form-input"
						bind:value={newPassword}
						placeholder="새 비밀번호를 입력하세요 (최소 6자)"
					/>
				</div>
				<div class="form-group">
					<label class="form-label" for="confirm-password">새 비밀번호 확인</label>
					<input
						id="confirm-password"
						type="password"
						class="form-input"
						bind:value={confirmPassword}
						placeholder="새 비밀번호를 다시 입력하세요"
					/>
				</div>

				{#if passwordChangeError}
					<div class="error-message">{passwordChangeError}</div>
				{/if}

				{#if passwordChangeSuccess}
					<div class="success-message">{passwordChangeSuccess}</div>
				{/if}

				<button
					type="button"
					class="btn btn-primary"
					onclick={handlePasswordChange}
					disabled={isChangingPassword}
				>
					{isChangingPassword ? '변경 중...' : '비밀번호 변경'}
				</button>
			</div>
		</div>

		<!-- Danger Zone -->
		<div class="section danger-zone">
			<h3 class="section-title danger-title">위험 구역</h3>
			<p class="danger-description">
				계정을 삭제하면 모든 데이터가 영구적으로 삭제되며, 복구할 수 없습니다.
			</p>
			<button
				type="button"
				class="btn btn-danger"
				onclick={handleDeleteAccount}
				disabled={isDeletingAccount}
			>
				{isDeletingAccount ? '삭제 중...' : '계정 삭제'}
			</button>
		</div>
	{:else}
		<div class="error-state">
			<p>사용자 정보를 불러올 수 없습니다.</p>
			<button type="button" onclick={() => goto('/login')}>로그인으로 이동</button>
		</div>
	{/if}
</div>

<style>
	.profile-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 2rem;
	}

	/* Header */
	.page-header {
		max-width: 800px;
		margin: 0 auto 2rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.page-title {
		font-size: 2rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
	}

	.back-link {
		font-size: 0.9375rem;
		color: #ffb4ab;
		text-decoration: none;
		font-weight: 600;
		transition: color 0.2s;
	}

	.back-link:hover {
		color: #ff9b91;
	}

	/* Profile Section */
	.profile-section {
		max-width: 800px;
		margin: 0 auto 2rem;
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		display: flex;
		align-items: center;
		gap: 1.5rem;
	}

	.profile-icon {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 3rem;
		flex-shrink: 0;
	}

	.profile-info {
		flex: 1;
	}

	.user-email {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.5rem 0;
	}

	.join-date {
		font-size: 0.875rem;
		color: #999;
		margin: 0;
	}

	/* Statistics Section */
	.stats-section {
		max-width: 800px;
		margin: 0 auto 2rem;
	}

	.section-title {
		font-size: 1.125rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 1rem 0;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.stat-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		text-align: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.stat-card:hover {
		transform: translateY(-4px);
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
	}

	.stat-icon {
		font-size: 2rem;
		margin-bottom: 0.5rem;
	}

	.stat-value {
		font-size: 2rem;
		font-weight: 700;
		color: #ffb4ab;
		margin-bottom: 0.25rem;
	}

	.stat-label {
		font-size: 0.875rem;
		color: #666;
		font-weight: 600;
	}

	/* Section */
	.section {
		max-width: 800px;
		margin: 0 auto 2rem;
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
	}

	/* Password Form */
	.password-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a4a4a;
	}

	.form-input {
		padding: 0.75rem;
		border: 2px solid #f5f5f5;
		border-radius: 8px;
		font-size: 0.9375rem;
		color: #4a4a4a;
		transition: border-color 0.2s;
	}

	.form-input:focus {
		outline: none;
		border-color: #ffb4ab;
	}

	.error-message {
		background: #ffe5e5;
		color: #d32f2f;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.875rem;
	}

	.success-message {
		background: #e8f5e9;
		color: #2d6a4f;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.875rem;
	}

	/* Buttons */
	.btn {
		padding: 0.875rem 1.5rem;
		border: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
	}

	.btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.btn-primary {
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
	}

	.btn-primary:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.btn-danger {
		background: #d32f2f;
		color: white;
	}

	.btn-danger:hover:not(:disabled) {
		background: #b71c1c;
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(211, 47, 47, 0.4);
	}

	/* Danger Zone */
	.danger-zone {
		border: 2px solid #ffcdd2;
		background: #fff5f5;
	}

	.danger-title {
		color: #d32f2f;
	}

	.danger-description {
		color: #666;
		font-size: 0.875rem;
		margin: 0 0 1rem 0;
		line-height: 1.6;
	}

	/* Error State */
	.error-state {
		max-width: 600px;
		margin: 4rem auto;
		text-align: center;
		background: white;
		padding: 3rem 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.error-state p {
		color: #666;
		margin-bottom: 1.5rem;
	}

	.error-state button {
		padding: 0.75rem 2rem;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
		border: none;
		border-radius: 12px;
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.error-state button:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.profile-page {
			padding: 1rem;
		}

		.page-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 1rem;
		}

		.page-title {
			font-size: 1.5rem;
		}

		.profile-section {
			padding: 1.5rem;
		}

		.profile-icon {
			width: 64px;
			height: 64px;
			font-size: 2.5rem;
		}

		.user-email {
			font-size: 1.25rem;
		}

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.section {
			padding: 1.5rem;
		}
	}
</style>