import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { reviews, visitHistory } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

/**
 * POST /api/migrate-visit-history
 * One-time migration script to create visit history records for existing reviews
 */
export const POST: RequestHandler = async ({ locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		// Get all reviews
		const allReviews = await db.select().from(reviews);

		let created = 0;
		let skipped = 0;

		// Create visit history for each review
		for (const review of allReviews) {
			// Check if visit history already exists for this review
			const [existing] = await db
				.select()
				.from(visitHistory)
				.where(eq(visitHistory.reviewId, review.id))
				.limit(1);

			if (existing) {
				skipped++;
				continue;
			}

			// Create visit history
			await db.insert(visitHistory).values({
				userId: review.userId,
				restaurantId: review.restaurantId,
				restaurantName: review.restaurantName,
				restaurantAddress: null, // We don't have this data from reviews
				visitDate: review.visitDate || review.createdAt, // Use visitDate or createdAt
				hasReview: true,
				reviewId: review.id
			});

			created++;
		}

		return json({
			success: true,
			message: `마이그레이션 완료: ${created}개 생성, ${skipped}개 건너뜀`,
			created,
			skipped,
			total: allReviews.length
		});
	} catch (error) {
		console.error('[POST /api/migrate-visit-history] Error:', error);
		return json({ error: '마이그레이션 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
