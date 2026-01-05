import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import {
	createReview,
	getReviewsByUserId,
	getReviewByUserAndRestaurant
} from '$lib/server/reviews';
import { createVisitHistory } from '$lib/server/visit-history';

/**
 * POST /api/reviews - Create a new review
 */
export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		const data = await request.json();
		const { restaurantId, restaurantName, rating, comment, visitDate, wouldVisitAgain, photos } =
			data;

		// Validation
		if (!restaurantId || !restaurantName || !rating) {
			return json({ error: '필수 항목이 누락되었습니다.' }, { status: 400 });
		}

		if (rating < 1 || rating > 5) {
			return json({ error: '평점은 1-5 사이여야 합니다.' }, { status: 400 });
		}

		// Check if user already reviewed this restaurant
		const existingReview = await getReviewByUserAndRestaurant(locals.user.id, restaurantId);
		if (existingReview) {
			return json({ error: '이미 이 식당에 후기를 작성했습니다.' }, { status: 400 });
		}

		// Create review
		const review = await createReview({
			userId: locals.user.id,
			restaurantId,
			restaurantName,
			rating,
			comment: comment || null,
			visitDate: visitDate ? new Date(visitDate) : null,
			wouldVisitAgain: wouldVisitAgain || false,
			photos: photos ? JSON.stringify(photos) : null
		});

		// Create visit history record
		await createVisitHistory({
			userId: locals.user.id,
			restaurantId,
			restaurantName,
			restaurantAddress: data.restaurantAddress || null,
			visitDate: visitDate ? new Date(visitDate) : new Date(),
			hasReview: true,
			reviewId: review.id
		});

		return json({
			success: true,
			message: '후기가 작성되었습니다.',
			review
		});
	} catch (error) {
		console.error('[POST /api/reviews] Error:', error);
		return json({ error: '후기 작성 중 오류가 발생했습니다.' }, { status: 500 });
	}
};

/**
 * GET /api/reviews - Get all reviews for the current user
 */
export const GET: RequestHandler = async ({ locals, url }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		// Get all reviews for this user
		const reviews = await getReviewsByUserId(locals.user.id);

		// Parse photos JSON string back to array
		const parsedReviews = reviews.map((review) => ({
			...review,
			photos: review.photos ? JSON.parse(review.photos) : []
		}));

		return json({
			success: true,
			reviews: parsedReviews
		});
	} catch (error) {
		console.error('[GET /api/reviews] Error:', error);
		return json({ error: '후기 조회 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
