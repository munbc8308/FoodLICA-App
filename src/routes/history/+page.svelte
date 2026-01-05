<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

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

	// Group visits by month
	function groupByMonth(visits: typeof data.visits) {
		const groups = new Map<string, typeof data.visits>();

		visits.forEach((visit) => {
			const date = new Date(visit.visitDate);
			const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

			if (!groups.has(monthKey)) {
				groups.set(monthKey, []);
			}
			groups.get(monthKey)!.push(visit);
		});

		return Array.from(groups.entries()).map(([monthKey, visits]) => {
			const [year, month] = monthKey.split('-');
			return {
				monthKey,
				monthLabel: `${year}년 ${month}월`,
				visits
			};
		});
	}

	const groupedVisits = $derived(groupByMonth(data.visits));

	// Navigate to create review for a visit
	function handleCreateReview(restaurantId: string, restaurantName: string) {
		goto(`/main?createReview=${restaurantId}&name=${encodeURIComponent(restaurantName)}`);
	}
</script>

<div class="history-page">
	<!-- Header -->
	<header class="page-header">
		<h1 class="page-title">방문한 내역</h1>
		<a href="/main" class="back-link">← 메인으로</a>
	</header>

	{#if data.user}
		<!-- Statistics Section -->
		{#if data.stats}
			<div class="stats-section">
				<h3 class="section-title">방문 통계</h3>
				<div class="stats-grid">
					<div class="stat-card">
						<div class="stat-icon">📍</div>
						<div class="stat-value">{data.stats.totalVisits}</div>
						<div class="stat-label">총 방문</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">📅</div>
						<div class="stat-value">{data.stats.thisMonthVisits}</div>
						<div class="stat-label">이번 달</div>
					</div>
					<div class="stat-card">
						<div class="stat-icon">✍️</div>
						<div class="stat-value">{data.stats.visitsWithoutReviews}</div>
						<div class="stat-label">후기 미작성</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Visit History Section -->
		<div class="section">
			<h3 class="section-title">방문 기록</h3>

			{#if data.visits.length === 0}
				<div class="empty-state">
					<div class="empty-icon">🗺️</div>
					<p class="empty-text">아직 방문 기록이 없습니다.</p>
					<button type="button" class="btn btn-primary" onclick={() => goto('/main')}>
						음식점 찾기
					</button>
				</div>
			{:else}
				<div class="visits-container">
					{#each groupedVisits as { monthLabel, visits }}
						<div class="month-group">
							<h4 class="month-label">{monthLabel}</h4>
							<div class="visits-list">
								{#each visits as visit}
									<div class="visit-card">
										<div class="visit-info">
											<div class="visit-icon">🍽️</div>
											<div class="visit-details">
												<h5 class="restaurant-name">{visit.restaurantName}</h5>
												{#if visit.restaurantAddress}
													<p class="restaurant-address">{visit.restaurantAddress}</p>
												{/if}
												<p class="visit-date">{formatDate(visit.visitDate)}</p>
											</div>
										</div>
										<div class="visit-actions">
											{#if visit.hasReview}
												<div class="review-badge">
													<span class="badge-icon">✓</span>
													<span class="badge-text">후기 작성 완료</span>
												</div>
											{:else}
												<button
													type="button"
													class="btn btn-small btn-primary"
													onclick={() => handleCreateReview(visit.restaurantId, visit.restaurantName)}
												>
													후기 작성하기
												</button>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{:else}
		<div class="error-state">
			<p>로그인이 필요합니다.</p>
			<button type="button" onclick={() => goto('/login')}>로그인으로 이동</button>
		</div>
	{/if}
</div>

<style>
	.history-page {
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

	/* Empty State */
	.empty-state {
		text-align: center;
		padding: 3rem 2rem;
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.empty-text {
		color: #666;
		font-size: 1rem;
		margin-bottom: 1.5rem;
	}

	/* Visits Container */
	.visits-container {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.month-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.month-label {
		font-size: 1rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0;
		padding-bottom: 0.5rem;
		border-bottom: 2px solid #f5f5f5;
	}

	.visits-list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	/* Visit Card */
	.visit-card {
		background: #fafafa;
		padding: 1.25rem;
		border-radius: 12px;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		transition: background 0.2s;
	}

	.visit-card:hover {
		background: #f5f5f5;
	}

	.visit-info {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex: 1;
	}

	.visit-icon {
		width: 48px;
		height: 48px;
		border-radius: 50%;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		flex-shrink: 0;
	}

	.visit-details {
		flex: 1;
		min-width: 0;
	}

	.restaurant-name {
		font-size: 1rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.25rem 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.restaurant-address {
		font-size: 0.8125rem;
		color: #999;
		margin: 0 0 0.25rem 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.visit-date {
		font-size: 0.8125rem;
		color: #666;
		margin: 0;
	}

	.visit-actions {
		flex-shrink: 0;
	}

	/* Review Badge */
	.review-badge {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #e8f5e9;
		border-radius: 20px;
	}

	.badge-icon {
		color: #2d6a4f;
		font-weight: 700;
	}

	.badge-text {
		font-size: 0.8125rem;
		color: #2d6a4f;
		font-weight: 600;
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

	.btn-small {
		padding: 0.5rem 1rem;
		font-size: 0.8125rem;
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
		.history-page {
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

		.stats-grid {
			grid-template-columns: 1fr;
		}

		.section {
			padding: 1.5rem;
		}

		.visit-card {
			flex-direction: column;
			align-items: flex-start;
		}

		.visit-info {
			width: 100%;
		}

		.visit-actions {
			width: 100%;
		}

		.btn-small {
			width: 100%;
		}
	}
</style>
