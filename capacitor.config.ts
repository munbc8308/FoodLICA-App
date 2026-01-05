import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
	appId: 'com.foodLica.prod',
	appName: 'foodLica-app',
	webDir: 'build', // ⭐ SvelteKit static output
	server: {
		// 개발 시 로컬 서버 사용
		// Capacitor 앱에서 외부 서버 호출 허용
		androidScheme: 'https',
		// iOS에서 cleartext HTTP 허용 (개발용)
		cleartext: true,
		// CORS 허용
		allowNavigation: [
			'localhost:5173',
			'localhost:*',
			'127.0.0.1:*',
			// 로컬 IP 주소 (개발용)
			'192.168.*.*',
			'10.0.*.*'
		]
	},
	plugins: {
		// 필요한 플러그인 설정
	}
};

export default config;
