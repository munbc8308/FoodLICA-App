import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { findUserByEmail, verifyPassword, createSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
		}

		// Find user
		const user = await findUserByEmail(email);
		if (!user) {
			return json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
		}

		// Verify password
		const isValidPassword = await verifyPassword(password, user.password);
		if (!isValidPassword) {
			return json({ error: '이메일 또는 비밀번호가 일치하지 않습니다.' }, { status: 401 });
		}

		// Create session
		const session = await createSession(user.id);

		// Set cookie
		cookies.set('session', session.token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 30 // 30 days
		});

		return json({
			success: true,
			user: {
				id: user.id,
				email: user.email
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		return json({ error: '로그인 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
