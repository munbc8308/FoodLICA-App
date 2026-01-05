import { db } from './db';
import { visitHistory } from './db/schema';
import { eq, desc, and, gte } from 'drizzle-orm';
import type { NewVisitHistory } from './db/schema';

// Get all visit history for a user
export async function getUserVisitHistory(userId: number) {
	return await db
		.select()
		.from(visitHistory)
		.where(eq(visitHistory.userId, userId))
		.orderBy(desc(visitHistory.visitDate));
}

// Get visit history statistics
export async function getUserVisitStats(userId: number) {
	const allVisits = await db
		.select()
		.from(visitHistory)
		.where(eq(visitHistory.userId, userId));

	// Calculate this month's visits
	const now = new Date();
	const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
	const thisMonthVisits = await db
		.select()
		.from(visitHistory)
		.where(
			and(
				eq(visitHistory.userId, userId),
				gte(visitHistory.visitDate, firstDayOfMonth)
			)
		);

	// Count visits without reviews
	const visitsWithoutReviews = allVisits.filter((visit) => !visit.hasReview).length;

	return {
		totalVisits: allVisits.length,
		thisMonthVisits: thisMonthVisits.length,
		visitsWithoutReviews
	};
}

// Create a visit history entry
export async function createVisitHistory(data: NewVisitHistory) {
	const [visit] = await db.insert(visitHistory).values(data).returning();
	return visit;
}

// Update visit history when review is created
export async function updateVisitHistoryWithReview(
	userId: number,
	restaurantId: string,
	reviewId: number
) {
	// Find the most recent visit to this restaurant without a review
	const [visit] = await db
		.select()
		.from(visitHistory)
		.where(
			and(
				eq(visitHistory.userId, userId),
				eq(visitHistory.restaurantId, restaurantId),
				eq(visitHistory.hasReview, false)
			)
		)
		.orderBy(desc(visitHistory.visitDate))
		.limit(1);

	if (visit) {
		await db
			.update(visitHistory)
			.set({
				hasReview: true,
				reviewId
			})
			.where(eq(visitHistory.id, visit.id));
	}
}

// Update visit history when review is deleted
export async function removeReviewFromVisitHistory(reviewId: number) {
	await db
		.update(visitHistory)
		.set({
			hasReview: false,
			reviewId: null
		})
		.where(eq(visitHistory.reviewId, reviewId));
}
