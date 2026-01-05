<script lang="ts">
	import { onMount } from 'svelte';
	import ReviewCard from '$lib/components/ReviewCard.svelte';
	import ReviewForm from '$lib/components/ReviewForm.svelte';
	import type { Review, ReviewFormData } from '$lib/types';

	// State
	let reviews = $state<Review[]>([]);
	let stats = $state({
		totalReviews: 0,
		averageRating: 0,
		wouldVisitAgainCount: 0
	});
	let isLoading = $state(true);
	let errorMessage = $state('');

	// Edit modal state
	let editingReview = $state<Review | null>(null);
	let showEditModal = $state(false);

	onMount(() => {
		loadReviews();
		loadStats();
	});

	async function loadReviews() {
		try {
			isLoading = true;
			errorMessage = '';

			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/reviews`, {
				credentials: 'include'
			});
			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '후기 조회 실패');
			}

			reviews = data.reviews;
		} catch (error) {
			console.error('Load reviews error:', error);
			errorMessage = error instanceof Error ? error.message : '후기를 불러올 수 없습니다.';
		} finally {
			isLoading = false;
		}
	}

	async function loadStats() {
		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/reviews/stats`, {
				credentials: 'include'
			});
			const data = await response.json();

			if (response.ok) {
				stats = data.stats;
			}
		} catch (error) {
			console.error('Load stats error:', error);
		}
	}

	async function handleDelete(reviewId: number) {
		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/reviews/${reviewId}`, {
				method: 'DELETE',
				credentials: 'include'
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '후기 삭제 실패');
			}

			// Reload reviews and stats
			await loadReviews();
			await loadStats();
		} catch (error) {
			console.error('Delete review error:', error);
			alert(error instanceof Error ? error.message : '후기 삭제에 실패했습니다.');
		}
	}

	function handleEdit(review: Review) {
		editingReview = review;
		showEditModal = true;
	}

	async function handleEditSubmit(formData: ReviewFormData) {
		if (!editingReview) return;

		try {
			const API_URL = import.meta.env.PUBLIC_API_URL || '';
			const response = await fetch(`${API_URL}/api/reviews/${editingReview.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include',
				body: JSON.stringify(formData)
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '후기 수정 실패');
			}

			// Close modal and reload
			showEditModal = false;
			editingReview = null;
			await loadReviews();
			await loadStats();
		} catch (error) {
			console.error('Edit review error:', error);
			throw error; // Let ReviewForm handle the error
		}
	}

	function closeEditModal() {
		showEditModal = false;
		editingReview = null;
	}

	// Computed
	let wouldVisitAgainPercentage = $derived(
		stats.totalReviews > 0 ? Math.round((stats.wouldVisitAgainCount / stats.totalReviews) * 100) : 0
	);
</script>

<div class="reviews-page">
	<!-- Header -->
	<header class="page-header">
		<h1 class="page-title">내 후기</h1>
		<a href="/main" class="back-link">← 메인으로</a>
	</header>

	<!-- Stats Section -->
	{#if !isLoading && stats.totalReviews > 0}
		<div class="stats-section">
			<div class="stat-card">
				<div class="stat-icon">📝</div>
				<div class="stat-value">{stats.totalReviews}</div>
				<div class="stat-label">총 후기</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">⭐</div>
				<div class="stat-value">{stats.averageRating.toFixed(1)}</div>
				<div class="stat-label">평균 평점</div>
			</div>
			<div class="stat-card">
				<div class="stat-icon">💚</div>
				<div class="stat-value">{wouldVisitAgainPercentage}%</div>
				<div class="stat-label">재방문 의사</div>
			</div>
		</div>
	{/if}

	<!-- Loading State -->
	{#if isLoading}
		<div class="loading-state">
			<div class="spinner"></div>
			<p>후기를 불러오는 중...</p>
		</div>
	{/if}

	<!-- Error State -->
	{#if errorMessage}
		<div class="error-state">
			<p class="error-icon">⚠️</p>
			<p class="error-text">{errorMessage}</p>
			<button type="button" class="retry-btn" onclick={loadReviews}>다시 시도</button>
		</div>
	{/if}

	<!-- Empty State -->
	{#if !isLoading && !errorMessage && reviews.length === 0}
		<div class="empty-state">
			<p class="empty-icon">📝</p>
			<h2 class="empty-title">아직 작성한 후기가 없습니다</h2>
			<p class="empty-text">식당을 방문하고 첫 후기를 작성해보세요!</p>
			<a href="/main" class="cta-btn">식당 찾으러 가기</a>
		</div>
	{/if}

	<!-- Reviews List -->
	{#if !isLoading && !errorMessage && reviews.length > 0}
		<div class="reviews-list">
			{#each reviews as review (review.id)}
				<ReviewCard {review} onEdit={handleEdit} onDelete={handleDelete} />
			{/each}
		</div>
	{/if}

	<!-- Edit Modal -->
	{#if showEditModal && editingReview}
		<div class="modal-overlay" role="presentation" onclick={closeEditModal} onkeydown={(e) => e.key === 'Escape' && closeEditModal()}>
			<div class="modal-content" role="dialog" aria-modal="true" tabindex="-1" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()}>
				<ReviewForm
					restaurant={{
						id: editingReview.restaurantId,
						name: editingReview.restaurantName
					}}
					initialData={{
						restaurantId: editingReview.restaurantId,
						restaurantName: editingReview.restaurantName,
						rating: editingReview.rating,
						comment: editingReview.comment || undefined,
						visitDate: editingReview.visitDate || undefined,
						wouldVisitAgain: editingReview.wouldVisitAgain
					}}
					onSubmit={handleEditSubmit}
					onCancel={closeEditModal}
				/>
			</div>
		</div>
	{/if}
</div>

<style>
	.reviews-page {
		min-height: 100vh;
		background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
		padding: 2rem;
	}

	/* Header */
	.page-header {
		max-width: 1200px;
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

	/* Stats Section */
	.stats-section {
		max-width: 1200px;
		margin: 0 auto 2rem;
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

	/* Loading State */
	.loading-state {
		max-width: 1200px;
		margin: 4rem auto;
		text-align: center;
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid #f5f5f5;
		border-top-color: #ffb4ab;
		border-radius: 50%;
		animation: spin 1s linear infinite;
		margin: 0 auto 1rem;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-state p {
		color: #666;
		font-size: 0.9375rem;
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

	.error-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	.error-text {
		color: #d32f2f;
		font-size: 1rem;
		margin-bottom: 1.5rem;
	}

	.retry-btn {
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

	.retry-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	/* Empty State */
	.empty-state {
		max-width: 600px;
		margin: 4rem auto;
		text-align: center;
		background: white;
		padding: 4rem 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.empty-icon {
		font-size: 5rem;
		margin-bottom: 1.5rem;
	}

	.empty-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 1rem 0;
	}

	.empty-text {
		font-size: 1rem;
		color: #666;
		margin: 0 0 2rem 0;
	}

	.cta-btn {
		display: inline-block;
		padding: 1rem 2.5rem;
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
		text-decoration: none;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.cta-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	/* Reviews List */
	.reviews-list {
		max-width: 1200px;
		margin: 0 auto;
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 500px), 1fr));
	}

	/* Modal */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.reviews-page {
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

		.stats-section {
			grid-template-columns: 1fr;
		}

		.reviews-list {
			grid-template-columns: 1fr;
		}

		.empty-state,
		.error-state {
			padding: 2rem 1.5rem;
		}

		.empty-icon {
			font-size: 4rem;
		}

		.empty-title {
			font-size: 1.25rem;
		}
	}
</style>
