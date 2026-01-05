import { db } from './db';
import { reviews } from './db/schema';
import { eq, and, desc } from 'drizzle-orm';
import type { Review, NewReview } from './db/schema';

/**
 * Create a new review
 */
export async function createReview(data: NewReview): Promise<Review> {
	const result = await db.insert(reviews).values(data).returning();
	return result[0];
}

/**
 * Get all reviews by user ID
 */
export async function getReviewsByUserId(userId: number): Promise<Review[]> {
	return db.select().from(reviews).where(eq(reviews.userId, userId)).orderBy(desc(reviews.createdAt));
}

/**
 * Get review by ID
 */
export async function getReviewById(id: number): Promise<Review | null> {
	const result = await db.select().from(reviews).where(eq(reviews.id, id)).limit(1);
	return result.length > 0 ? result[0] : null;
}

/**
 * Get review by user ID and restaurant ID (check if user already reviewed this restaurant)
 */
export async function getReviewByUserAndRestaurant(
	userId: number,
	restaurantId: string
): Promise<Review | null> {
	const result = await db
		.select()
		.from(reviews)
		.where(and(eq(reviews.userId, userId), eq(reviews.restaurantId, restaurantId)))
		.limit(1);
	return result.length > 0 ? result[0] : null;
}

/**
 * Update review
 */
export async function updateReview(
	id: number,
	data: Partial<Omit<NewReview, 'userId' | 'createdAt'>>
): Promise<Review | null> {
	const result = await db
		.update(reviews)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(reviews.id, id))
		.returning();
	return result.length > 0 ? result[0] : null;
}

/**
 * Delete review
 */
export async function deleteReview(id: number): Promise<boolean> {
	const result = await db.delete(reviews).where(eq(reviews.id, id)).returning();
	return result.length > 0;
}

/**
 * Get review statistics for a user
 */
export async function getUserReviewStats(userId: number): Promise<{
	totalReviews: number;
	averageRating: number;
	wouldVisitAgainCount: number;
}> {
	const userReviews = await getReviewsByUserId(userId);

	if (userReviews.length === 0) {
		return {
			totalReviews: 0,
			averageRating: 0,
			wouldVisitAgainCount: 0
		};
	}

	const totalRating = userReviews.reduce((sum, review) => sum + review.rating, 0);
	const wouldVisitAgainCount = userReviews.filter((review) => review.wouldVisitAgain).length;

	return {
		totalReviews: userReviews.length,
		averageRating: totalRating / userReviews.length,
		wouldVisitAgainCount
	};
}
