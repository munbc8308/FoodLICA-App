/**
 * App Bridge Service
 * LICA-App 네이티브 앱과의 통신을 담당하는 서비스
 */

// 앱에서 주입하는 전역 변수 타입 선언
declare global {
	interface Window {
		isNativeApp?: boolean;
		appVersion?: string;
		sendToApp?: (type: string, payload: object, requestId?: string) => void;
		ReactNativeWebView?: {
			postMessage: (message: string) => void;
		};
	}
}

export interface BridgeResponse<T = unknown> {
	success: boolean;
	data?: T;
	error?: string;
	requestId?: string;
}

export interface DeviceInfo {
	os: 'ios' | 'android';
	osVersion: string;
	model: string;
	appVersion: string;
	uniqueId: string;
}

/**
 * 앱 환경인지 확인
 */
export function isInApp(): boolean {
	if (typeof window === 'undefined') return false;

	// 1. window.isNativeApp 플래그 확인
	if (window.isNativeApp === true) return true;

	// 2. User-Agent 확인
	const userAgent = navigator.userAgent || '';
	if (userAgent.includes('LICA-App/')) return true;

	// 3. ReactNativeWebView 객체 존재 확인
	if (window.ReactNativeWebView) return true;

	return false;
}

/**
 * 앱 버전 가져오기
 */
export function getAppVersion(): string | null {
	if (typeof window === 'undefined') return null;

	// window.appVersion에서 가져오기
	if (window.appVersion) return window.appVersion;

	// User-Agent에서 파싱
	const userAgent = navigator.userAgent || '';
	const match = userAgent.match(/LICA-App\/([0-9.]+)/);
	if (match) return match[1];

	return null;
}

/**
 * 앱으로 메시지 전송하고 응답 대기
 */
export function sendToApp<T = unknown>(
	type: string,
	payload: object = {},
	timeout = 5000
): Promise<BridgeResponse<T>> {
	return new Promise((resolve, reject) => {
		if (!isInApp()) {
			reject(new Error('Not running in app'));
			return;
		}

		const requestId = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

		// 응답 리스너 설정
		const handleResponse = (event: CustomEvent<BridgeResponse<T>>) => {
			if (event.detail.requestId === requestId) {
				window.removeEventListener('nativeMessage', handleResponse as EventListener);
				clearTimeout(timeoutId);
				resolve(event.detail);
			}
		};

		// 타임아웃 설정
		const timeoutId = setTimeout(() => {
			window.removeEventListener('nativeMessage', handleResponse as EventListener);
			reject(new Error('Bridge request timeout'));
		}, timeout);

		// 리스너 등록
		window.addEventListener('nativeMessage', handleResponse as EventListener);

		// 메시지 전송
		if (window.sendToApp) {
			window.sendToApp(type, payload, requestId);
		} else if (window.ReactNativeWebView) {
			window.ReactNativeWebView.postMessage(
				JSON.stringify({
					type,
					payload,
					requestId
				})
			);
		} else {
			clearTimeout(timeoutId);
			window.removeEventListener('nativeMessage', handleResponse as EventListener);
			reject(new Error('No bridge available'));
		}
	});
}

/**
 * 앱 서명 가져오기
 */
export async function getAppSignature(): Promise<string | null> {
	try {
		const response = await sendToApp<string>('app.getSignature');
		if (response.success && response.data) {
			return response.data;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * 세션 토큰 가져오기
 */
export async function getSessionToken(): Promise<string | null> {
	try {
		const response = await sendToApp<string>('app.getSessionToken');
		if (response.success && response.data) {
			return response.data;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * 디바이스 정보 가져오기
 */
export async function getDeviceInfo(): Promise<DeviceInfo | null> {
	try {
		const response = await sendToApp<DeviceInfo>('device.getInfo');
		if (response.success && response.data) {
			return response.data;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * 앱 준비 완료 이벤트 대기
 */
export function waitForAppReady(timeout = 3000): Promise<boolean> {
	return new Promise((resolve) => {
		// 이미 준비된 경우
		if (isInApp() && window.sendToApp) {
			resolve(true);
			return;
		}

		const handleReady = () => {
			window.removeEventListener('nativeAppReady', handleReady);
			clearTimeout(timeoutId);
			resolve(true);
		};

		const timeoutId = setTimeout(() => {
			window.removeEventListener('nativeAppReady', handleReady);
			resolve(isInApp());
		}, timeout);

		window.addEventListener('nativeAppReady', handleReady);
	});
}
