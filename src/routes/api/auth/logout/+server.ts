import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { deleteSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies }) => {
	try {
		const sessionToken = cookies.get('session');

		if (sessionToken) {
			await deleteSession(sessionToken);
		}

		// Delete cookie
		cookies.delete('session', { path: '/' });

		return json({ success: true });
	} catch (error) {
		console.error('Logout error:', error);
		return json({ error: '로그아웃 중 오류가 발생했습니다.' }, { status: 500 });
	}
};
