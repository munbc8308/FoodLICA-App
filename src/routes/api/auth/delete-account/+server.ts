import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, sessions, reviews } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const DELETE: RequestHandler = async ({ locals, cookies }) => {
	// Check if user is authenticated
	if (!locals.user) {
		return json({ error: '로그인이 필요합니다.' }, { status: 401 });
	}

	try {
		const userId = locals.user.id;

		// Delete user's reviews
		await db.delete(reviews).where(eq(reviews.userId, userId));

		// Delete user's sessions
		await db.delete(sessions).where(eq(sessions.userId, userId));

		// Delete user account
		await db.delete(users).where(eq(users.id, userId));

		// Clear session cookie
		cookies.delete('session', { path: '/' });

		return json({ success: true, message: '계정이 성공적으로 삭제되었습니다.' });
	} catch (error) {
		console.error('Account deletion error:', error);
		return json({ error: '계정 삭제 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
