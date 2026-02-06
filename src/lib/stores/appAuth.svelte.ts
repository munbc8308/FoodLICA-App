/**
 * App Authentication Store
 * 앱 인증 상태를 관리하는 Svelte 5 Runes 기반 스토어
 */

import { isInApp, getAppVersion, waitForAppReady, getDeviceInfo } from '$lib/services/appBridge';
import type { DeviceInfo } from '$lib/services/appBridge';

export type AppAuthState = 'checking' | 'authorized' | 'unauthorized';

interface AppAuthStore {
	state: AppAuthState;
	isInApp: boolean;
	appVersion: string | null;
	deviceInfo: DeviceInfo | null;
	error: string | null;
}

function createAppAuthStore() {
	let state = $state<AppAuthState>('checking');
	let inApp = $state(false);
	let appVersion = $state<string | null>(null);
	let deviceInfo = $state<DeviceInfo | null>(null);
	let error = $state<string | null>(null);

	async function checkAuth(): Promise<boolean> {
		state = 'checking';
		error = null;

		try {
			// 브라우저 환경 확인
			if (typeof window === 'undefined') {
				state = 'unauthorized';
				error = '브라우저 환경이 아닙니다.';
				return false;
			}

			// 앱 준비 대기
			await waitForAppReady(2000);

			// 앱 환경 확인
			inApp = isInApp();

			if (!inApp) {
				state = 'unauthorized';
				error = '이 콘텐츠는 FoodLICA 앱에서만 이용할 수 있습니다.';
				return false;
			}

			// 앱 버전 확인
			appVersion = getAppVersion();

			// 디바이스 정보 가져오기 (선택적)
			try {
				deviceInfo = await getDeviceInfo();
			} catch {
				// 디바이스 정보 실패해도 계속 진행
				console.warn('Failed to get device info');
			}

			state = 'authorized';
			return true;
		} catch (e) {
			state = 'unauthorized';
			error = e instanceof Error ? e.message : '인증 확인 중 오류가 발생했습니다.';
			return false;
		}
	}

	return {
		get state() {
			return state;
		},
		get isInApp() {
			return inApp;
		},
		get appVersion() {
			return appVersion;
		},
		get deviceInfo() {
			return deviceInfo;
		},
		get error() {
			return error;
		},
		checkAuth
	};
}

export const appAuthStore = createAppAuthStore();
