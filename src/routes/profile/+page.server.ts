import type { PageServerLoad } from './$types';
import { getUserReviewStats } from '$lib/server/reviews';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null,
			stats: null
		};
	}

	// Get review statistics
	const stats = await getUserReviewStats(locals.user.id);

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email,
			createdAt: locals.user.createdAt
		},
		stats
	};
};
