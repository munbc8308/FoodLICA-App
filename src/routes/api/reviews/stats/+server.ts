import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getUserReviewStats } from '$lib/server/reviews';

/**
 * GET /api/reviews/stats - Get review statistics for the current user
 */
export const GET: RequestHandler = async ({ locals }) => {
	try {
		// Check authentication
		if (!locals.user) {
			return json({ error: '인증이 필요합니다.' }, { status: 401 });
		}

		const stats = await getUserReviewStats(locals.user.id);

		return json({
			success: true,
			stats
		});
	} catch (error) {
		console.error('[GET /api/reviews/stats] Error:', error);
		return json({ error: '통계 조회 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
