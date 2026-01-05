import type { PageServerLoad } from './$types';
import { getUserVisitHistory, getUserVisitStats } from '$lib/server/visit-history';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return {
			user: null,
			visits: [],
			stats: null
		};
	}

	// Get visit history and statistics
	const visits = await getUserVisitHistory(locals.user.id);
	const stats = await getUserVisitStats(locals.user.id);

	return {
		user: {
			id: locals.user.id,
			email: locals.user.email
		},
		visits,
		stats
	};
};
