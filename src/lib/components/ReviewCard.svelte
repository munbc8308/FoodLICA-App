<script lang="ts">
	import type { Review } from '$lib/types';

	let {
		review,
		onEdit = null,
		onDelete = null
	}: {
		review: Review;
		onEdit?: ((review: Review) => void) | null;
		onDelete?: ((reviewId: number) => void) | null;
	} = $props();

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

	// Format relative time
	function formatRelativeTime(date: Date): string {
		const now = new Date();
		const diff = now.getTime() - new Date(date).getTime();
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));

		if (days === 0) return '오늘';
		if (days === 1) return '어제';
		if (days < 7) return `${days}일 전`;
		if (days < 30) return `${Math.floor(days / 7)}주 전`;
		if (days < 365) return `${Math.floor(days / 30)}개월 전`;
		return `${Math.floor(days / 365)}년 전`;
	}

	function handleEdit() {
		if (onEdit) onEdit(review);
	}

	function handleDelete() {
		if (onDelete && confirm('이 후기를 삭제하시겠습니까?')) {
			onDelete(review.id);
		}
	}
</script>

<div class="review-card">
	<!-- Header -->
	<div class="card-header">
		<div class="header-left">
			<h3 class="restaurant-name">{review.restaurantName}</h3>
			<div class="star-rating">
				{#each Array(5) as _, i}
					<span class="star" class:filled={i < review.rating}>
						{i < review.rating ? '⭐' : '☆'}
					</span>
				{/each}
				<span class="rating-number">{review.rating}.0</span>
			</div>
		</div>
		{#if onEdit || onDelete}
			<div class="header-right">
				{#if onEdit}
					<button type="button" class="icon-btn" onclick={handleEdit} title="수정">
						✏️
					</button>
				{/if}
				{#if onDelete}
					<button type="button" class="icon-btn" onclick={handleDelete} title="삭제">
						🗑️
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Visit Date -->
	{#if review.visitDate}
		<div class="visit-date">
			<span class="date-icon">📅</span>
			<span>{formatDate(review.visitDate)} 방문</span>
		</div>
	{/if}

	<!-- Comment -->
	{#if review.comment}
		<p class="comment">{review.comment}</p>
	{/if}

	<!-- Would Visit Again Badge -->
	{#if review.wouldVisitAgain}
		<div class="badge">
			<span class="badge-icon">💚</span>
			<span>다시 방문하고 싶어요</span>
		</div>
	{/if}

	<!-- Footer -->
	<div class="card-footer">
		<span class="created-at">{formatRelativeTime(review.createdAt)} 작성</span>
		{#if review.updatedAt && new Date(review.updatedAt).getTime() !== new Date(review.createdAt).getTime()}
			<span class="updated-badge">수정됨</span>
		{/if}
	</div>
</div>

<style>
	.review-card {
		background: white;
		padding: 1.5rem;
		border-radius: 12px;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
		transition: all 0.2s;
		border: 2px solid transparent;
	}

	.review-card:hover {
		box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
		border-color: #ffb4ab;
	}

	/* Header */
	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
	}

	.header-left {
		flex: 1;
	}

	.header-right {
		display: flex;
		gap: 0.5rem;
	}

	.restaurant-name {
		font-size: 1.125rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.5rem 0;
	}

	.star-rating {
		display: flex;
		align-items: center;
		gap: 0.25rem;
	}

	.star {
		font-size: 1.25rem;
		line-height: 1;
	}

	.star.filled {
		filter: drop-shadow(0 1px 2px rgba(255, 180, 171, 0.3));
	}

	.rating-number {
		margin-left: 0.5rem;
		font-size: 0.875rem;
		font-weight: 600;
		color: #ffb4ab;
	}

	/* Icon Buttons */
	.icon-btn {
		background: none;
		border: none;
		font-size: 1.25rem;
		cursor: pointer;
		padding: 0.25rem;
		opacity: 0.6;
		transition: all 0.2s;
		line-height: 1;
	}

	.icon-btn:hover {
		opacity: 1;
		transform: scale(1.1);
	}

	/* Visit Date */
	.visit-date {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #666;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background: #f5f5f5;
		border-radius: 8px;
		width: fit-content;
	}

	.date-icon {
		font-size: 1rem;
	}

	/* Comment */
	.comment {
		font-size: 0.9375rem;
		color: #4a4a4a;
		line-height: 1.6;
		margin: 0 0 1rem 0;
		white-space: pre-wrap;
		word-break: break-word;
	}

	/* Badge */
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: linear-gradient(135deg, #c7efcf 0%, #b2e0d4 100%);
		border-radius: 20px;
		font-size: 0.875rem;
		font-weight: 600;
		color: #2d6a4f;
		margin-bottom: 1rem;
	}

	.badge-icon {
		font-size: 1rem;
	}

	/* Footer */
	.card-footer {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding-top: 1rem;
		border-top: 1px solid #f5f5f5;
	}

	.created-at {
		font-size: 0.75rem;
		color: #999;
	}

	.updated-badge {
		font-size: 0.75rem;
		color: #ffb4ab;
		font-weight: 600;
		padding: 0.125rem 0.5rem;
		background: #fff5f4;
		border-radius: 4px;
	}

	/* Responsive */
	@media (max-width: 768px) {
		.review-card {
			padding: 1.25rem;
		}

		.restaurant-name {
			font-size: 1rem;
		}

		.star {
			font-size: 1.125rem;
		}

		.comment {
			font-size: 0.875rem;
		}
	}
</style>
