<script lang="ts">
	import type { Restaurant, ReviewFormData } from '$lib/types';

	let {
		restaurant,
		initialData = null,
		onSubmit,
		onCancel
	}: {
		restaurant: { id: string; name: string };
		initialData?: ReviewFormData | null;
		onSubmit: (data: ReviewFormData) => void | Promise<void>;
		onCancel: () => void;
	} = $props();

	// Form state
	let rating = $state(0);
	let comment = $state('');
	let visitDate = $state(new Date().toISOString().split('T')[0]);
	let wouldVisitAgain = $state(false);
	let isSubmitting = $state(false);
	let errorMessage = $state('');

	// Initialize form state from initialData
	$effect(() => {
		if (initialData) {
			rating = initialData.rating || 0;
			comment = initialData.comment || '';
			visitDate = initialData.visitDate
				? new Date(initialData.visitDate).toISOString().split('T')[0]
				: new Date().toISOString().split('T')[0];
			wouldVisitAgain = initialData.wouldVisitAgain || false;
		} else {
			// Reset to defaults for new review
			rating = 0;
			comment = '';
			visitDate = new Date().toISOString().split('T')[0];
			wouldVisitAgain = false;
		}
	});

	// Computed
	let isValid = $derived(rating > 0);
	let isEditMode = $derived(initialData !== null);

	async function handleSubmit() {
		if (!isValid) {
			errorMessage = '별점을 선택해주세요.';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		try {
			const formData: ReviewFormData = {
				restaurantId: restaurant.id,
				restaurantName: restaurant.name,
				rating,
				comment: comment.trim() || undefined,
				visitDate: visitDate ? new Date(visitDate) : undefined,
				wouldVisitAgain
			};

			await onSubmit(formData);
		} catch (error) {
			errorMessage = '후기 저장 중 오류가 발생했습니다.';
			console.error('Review form error:', error);
		} finally {
			isSubmitting = false;
		}
	}

	function handleCancel() {
		onCancel();
	}

	function selectRating(value: number) {
		rating = value;
		errorMessage = '';
	}
</script>

<div class="review-form">
	<h2 class="form-title">
		{isEditMode ? '후기 수정' : '후기 작성'}
	</h2>

	<p class="restaurant-name">{restaurant.name}</p>

	<!-- Rating -->
	<div class="form-group">
		<p class="form-label">별점 <span class="required">*</span></p>
		<div class="star-rating">
			{#each [1, 2, 3, 4, 5] as star}
				<button
					type="button"
					class="star"
					class:filled={star <= rating}
					onclick={() => selectRating(star)}
					aria-label={`${star}점`}
				>
					{star <= rating ? '⭐' : '☆'}
				</button>
			{/each}
		</div>
		{#if rating > 0}
			<p class="rating-text">{rating}점</p>
		{/if}
	</div>

	<!-- Visit Date -->
	<div class="form-group">
		<label class="form-label" for="visit-date">방문일</label>
		<input id="visit-date" type="date" class="date-input" bind:value={visitDate} max={new Date().toISOString().split('T')[0]} />
	</div>

	<!-- Comment -->
	<div class="form-group">
		<label class="form-label" for="review-comment">후기</label>
		<textarea
			id="review-comment"
			class="comment-input"
			bind:value={comment}
			placeholder="이 식당에 대한 솔직한 후기를 남겨주세요..."
			rows="5"
			maxlength="500"
		></textarea>
		<p class="char-count">{comment.length}/500</p>
	</div>

	<!-- Would Visit Again -->
	<div class="form-group">
		<label class="checkbox-label">
			<input type="checkbox" class="checkbox" bind:checked={wouldVisitAgain} />
			<span>다시 방문하고 싶어요</span>
		</label>
	</div>

	<!-- Error Message -->
	{#if errorMessage}
		<div class="error-message">{errorMessage}</div>
	{/if}

	<!-- Actions -->
	<div class="form-actions">
		<button type="button" class="btn btn-cancel" onclick={handleCancel} disabled={isSubmitting}>
			취소
		</button>
		<button
			type="button"
			class="btn btn-submit"
			onclick={handleSubmit}
			disabled={!isValid || isSubmitting}
		>
			{#if isSubmitting}
				저장 중...
			{:else}
				{isEditMode ? '수정하기' : '작성하기'}
			{/if}
		</button>
	</div>
</div>

<style>
	.review-form {
		background: white;
		padding: 2rem;
		border-radius: 16px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
		max-width: 600px;
		width: 100%;
	}

	.form-title {
		font-size: 1.5rem;
		font-weight: 700;
		color: #4a4a4a;
		margin: 0 0 0.5rem 0;
	}

	.restaurant-name {
		font-size: 1rem;
		color: #ffb4ab;
		font-weight: 600;
		margin: 0 0 2rem 0;
	}

	.form-group {
		margin-bottom: 1.5rem;
	}

	.form-label {
		display: block;
		font-size: 0.875rem;
		font-weight: 600;
		color: #4a4a4a;
		margin-bottom: 0.5rem;
	}

	.required {
		color: #ffb4ab;
	}

	/* Star Rating */
	.star-rating {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
	}

	.star {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		padding: 0;
		transition: transform 0.2s;
		line-height: 1;
	}

	.star:hover {
		transform: scale(1.2);
	}

	.star.filled {
		filter: drop-shadow(0 2px 4px rgba(255, 180, 171, 0.3));
	}

	.rating-text {
		font-size: 0.875rem;
		color: #ffb4ab;
		font-weight: 600;
		margin: 0;
	}

	/* Date Input */
	.date-input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #f5f5f5;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #4a4a4a;
		transition: border-color 0.2s;
	}

	.date-input:focus {
		outline: none;
		border-color: #ffb4ab;
	}

	/* Comment Input */
	.comment-input {
		width: 100%;
		padding: 0.75rem;
		border: 2px solid #f5f5f5;
		border-radius: 8px;
		font-size: 0.875rem;
		color: #4a4a4a;
		font-family: inherit;
		resize: vertical;
		transition: border-color 0.2s;
	}

	.comment-input:focus {
		outline: none;
		border-color: #ffb4ab;
	}

	.comment-input::placeholder {
		color: #999;
	}

	.char-count {
		text-align: right;
		font-size: 0.75rem;
		color: #999;
		margin: 0.25rem 0 0 0;
	}

	/* Checkbox */
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.875rem;
		color: #4a4a4a;
		cursor: pointer;
	}

	.checkbox {
		width: 20px;
		height: 20px;
		cursor: pointer;
		accent-color: #ffb4ab;
	}

	/* Error Message */
	.error-message {
		background: #ffe5e5;
		color: #d32f2f;
		padding: 0.75rem;
		border-radius: 8px;
		font-size: 0.875rem;
		margin-bottom: 1rem;
	}

	/* Form Actions */
	.form-actions {
		display: flex;
		gap: 1rem;
		margin-top: 2rem;
	}

	.btn {
		flex: 1;
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

	.btn-cancel {
		background: #f5f5f5;
		color: #4a4a4a;
	}

	.btn-cancel:hover:not(:disabled) {
		background: #e0e0e0;
	}

	.btn-submit {
		background: linear-gradient(135deg, #ffb4ab 0%, #ffdab9 100%);
		color: white;
	}

	.btn-submit:hover:not(:disabled) {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(255, 180, 171, 0.4);
	}

	.btn-submit:active:not(:disabled) {
		transform: translateY(0);
	}

	/* Responsive */
	@media (max-width: 768px) {
		.review-form {
			padding: 1.5rem;
		}

		.form-title {
			font-size: 1.25rem;
		}

		.star {
			font-size: 1.75rem;
		}

		.form-actions {
			flex-direction: column;
		}
	}
</style>
