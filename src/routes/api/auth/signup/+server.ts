import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createUser, findUserByEmail } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { email, password } = await request.json();

		// Validate input
		if (!email || !password) {
			return json({ error: '이메일과 비밀번호를 입력해주세요.' }, { status: 400 });
		}

		// Validate email format
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return json({ error: '올바른 이메일 형식이 아닙니다.' }, { status: 400 });
		}

		// Validate password length
		if (password.length < 6) {
			return json({ error: '비밀번호는 최소 6자 이상이어야 합니다.' }, { status: 400 });
		}

		// Check if user already exists
		const existingUser = await findUserByEmail(email);
		if (existingUser) {
			return json({ error: '이미 가입된 이메일입니다.' }, { status: 400 });
		}

		// Create user (don't create session - user must login)
		const user = await createUser(email, password);

		return json({
			success: true,
			message: '회원가입이 완료되었습니다. 로그인해주세요.',
			user: {
				id: user.id,
				email: user.email
			}
		});
	} catch (error) {
		console.error('Signup error:', error);
		return json({ error: '회원가입 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
