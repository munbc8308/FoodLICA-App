import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export const POST: RequestHandler = async ({ request, locals }) => {
	// Check if user is authenticated
	if (!locals.user) {
		return json({ error: '로그인이 필요합니다.' }, { status: 401 });
	}

	try {
		const { currentPassword, newPassword } = await request.json();

		// Validation
		if (!currentPassword || !newPassword) {
			return json({ error: '모든 필드를 입력해주세요.' }, { status: 400 });
		}

		if (newPassword.length < 6) {
			return json({ error: '새 비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
		}

		// Get current user from database
		const [user] = await db.select().from(users).where(eq(users.id, locals.user.id)).limit(1);

		if (!user) {
			return json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
		}

		// Verify current password
		const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash);

		if (!isValidPassword) {
			return json({ error: '현재 비밀번호가 올바르지 않습니다.' }, { status: 400 });
		}

		// Hash new password
		const newPasswordHash = await bcrypt.hash(newPassword, 10);

		// Update password in database
		await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, user.id));

		return json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
	} catch (error) {
		console.error('Password change error:', error);
		return json({ error: '비밀번호 변경 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
