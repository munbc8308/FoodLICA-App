import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getReviewById, updateReview, deleteReview } from '$lib/server/reviews';
import { removeReviewFromVisitHistory } from '$lib/server/visit-history';

/**
 * GET /api/reviews/[id] - Get a specific review
 */
export const GET: RequestHandler = async ({ params, locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		const reviewId = parseInt(params.id);
		if (isNaN(reviewId)) {
			return json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
		}

		const review = await getReviewById(reviewId);

		if (!review) {
			return json({ error: '후기를 찾을 수 없습니다.' }, { status: 404 });
		}

		// Check ownership
		if (review.userId !== locals.user.id) {
			return json({ error: '권한이 없습니다.' }, { status: 403 });
		}

		// Parse photos JSON
		const parsedReview = {
			...review,
			photos: review.photos ? JSON.parse(review.photos) : []
		};

		return json({
			success: true,
			review: parsedReview
		});
	} catch (error) {
		console.error('[GET /api/reviews/[id]] Error:', error);
		return json({ error: '후기 조회 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

/**
 * PUT /api/reviews/[id] - Update a review
 */
export const PUT: RequestHandler = async ({ params, request, locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		const reviewId = parseInt(params.id);
		if (isNaN(reviewId)) {
			return json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
		}

		// Get existing review
		const existingReview = await getReviewById(reviewId);
		if (!existingReview) {
			return json({ error: '후기를 찾을 수 없습니다.' }, { status: 404 });
		}

		// Check ownership
		if (existingReview.userId !== locals.user.id) {
			return json({ error: '권한이 없습니다.' }, { status: 403 });
		}

		const data = await request.json();
		const { rating, comment, visitDate, wouldVisitAgain, photos } = data;

		// Validation
		if (rating !== undefined && (rating < 1 || rating > 5)) {
			return json({ error: '평점은 1-5 사이여야 합니다.' }, { status: 400 });
		}

		// Update review
		const updatedReview = await updateReview(reviewId, {
			...(rating !== undefined && { rating }),
			...(comment !== undefined && { comment: comment || null }),
			...(visitDate !== undefined && { visitDate: visitDate ? new Date(visitDate) : null }),
			...(wouldVisitAgain !== undefined && { wouldVisitAgain }),
			...(photos !== undefined && { photos: photos ? JSON.stringify(photos) : null })
		});

		if (!updatedReview) {
			return json({ error: '후기 수정에 실패했습니다.' }, { status: 500 });
		}

		// Parse photos JSON
		const parsedReview = {
			...updatedReview,
			photos: updatedReview.photos ? JSON.parse(updatedReview.photos) : []
		};

		return json({
			success: true,
			message: '후기가 수정되었습니다.',
			review: parsedReview
		});
	} catch (error) {
		console.error('[PUT /api/reviews/[id]] Error:', error);
		return json({ error: '후기 수정 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

/**
 * DELETE /api/reviews/[id] - Delete a review
 */
export const DELETE: RequestHandler = async ({ params, locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		const reviewId = parseInt(params.id);
		if (isNaN(reviewId)) {
			return json({ error: '유효하지 않은 ID입니다.' }, { status: 400 });
		}

		// Get existing review
		const existingReview = await getReviewById(reviewId);
		if (!existingReview) {
			return json({ error: '후기를 찾을 수 없습니다.' }, { status: 404 });
		}

		// Check ownership
		if (existingReview.userId !== locals.user.id) {
			return json({ error: '권한이 없습니다.' }, { status: 403 });
		}

		// Update visit history (remove review reference)
		await removeReviewFromVisitHistory(reviewId);

		// Delete review
		const deleted = await deleteReview(reviewId);

		if (!deleted) {
			return json({ error: '후기 삭제에 실패했습니다.' }, { status: 500 });
		}

		return json({
			success: true,
			message: '후기가 삭제되었습니다.'
		});
	} catch (error) {
		console.error('[DELETE /api/reviews/[id]] Error:', error);
		return json({ error: '후기 삭제 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
