# Capacitor 모바일 앱 개발 가이드

## 🎯 현재 구성

- **프론트엔드**: Capacitor 모바일 앱 (정적 빌드)
- **백엔드**: Node.js 서버 (별도 실행)
- **개발 모드**: 프론트엔드와 백엔드를 따로 실행

## 📋 사전 준비

### 1. 백엔드 서버 설정

백엔드는 기존 SvelteKit 프로젝트를 Node.js 서버로 실행합니다.

#### adapter-node로 백엔드 빌드

백엔드용 설정 파일 생성: `svelte.config.backend.js`

```javascript
import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter()
	}
};

export default config;
```

#### 백엔드 빌드 및 실행

```bash
# 백엔드 빌드 (adapter-node)
SVELTE_CONFIG=svelte.config.backend.js bun run build

# 백엔드 서버 실행
node build/index.js
# 또는
PORT=3000 node build/index.js
```

**또는 간단하게 개발 서버 사용:**

```bash
# 개발 모드로 백엔드 실행
bun run dev
# 기본 포트: 5173
```

### 2. 프론트엔드 (Capacitor) 설정

#### 환경변수 설정

`.env` 파일 확인:

```bash
# 백엔드 API URL 설정
# 개발: 로컬 서버
PUBLIC_API_URL=http://localhost:5173

# Capacitor 실제 기기 테스트 시: 컴퓨터의 IP 주소 사용
# PUBLIC_API_URL=http://192.168.0.10:5173
```

**로컬 IP 주소 확인:**

```bash
# macOS/Linux
ifconfig | grep "inet "

# Windows
ipconfig
```

#### 프론트엔드 빌드

```bash
# adapter-static으로 정적 빌드
bun run build

# build/ 폴더에 index.html 및 정적 파일 생성됨
```

### 3. Capacitor 동기화 및 실행

```bash
# Capacitor 플랫폼 동기화 (build 폴더 → 네이티브 프로젝트)
npx cap sync

# iOS 시뮬레이터 실행
npx cap run ios

# Android 에뮬레이터 실행
npx cap run android

# 또는 Xcode/Android Studio에서 직접 열기
npx cap open ios
npx cap open android
```

## 🔄 개발 워크플로우

### 일반적인 개발 프로세스

1. **백엔드 서버 실행** (터미널 1)
   ```bash
   bun run dev
   # http://localhost:5173 에서 실행됨
   ```

2. **프론트엔드 빌드** (터미널 2)
   ```bash
   bun run build
   ```

3. **Capacitor 동기화**
   ```bash
   npx cap sync
   ```

4. **모바일 앱 실행**
   ```bash
   npx cap run ios
   # 또는
   npx cap run android
   ```

### 빠른 개발 사이클

코드 변경 시마다:

```bash
# 1. 프론트엔드 리빌드
bun run build

# 2. Capacitor 동기화
npx cap sync

# 3. 앱 새로고침 (Hot Module Replacement는 지원 안 됨)
# iOS/Android 앱에서 수동으로 새로고침 필요
```

## 📱 실제 기기 테스트

### iOS (iPhone/iPad)

1. **.env 파일 수정**
   ```bash
   # 컴퓨터의 로컬 IP 주소로 변경
   PUBLIC_API_URL=http://192.168.0.10:5173
   ```

2. **빌드 및 동기화**
   ```bash
   bun run build
   npx cap sync ios
   ```

3. **Xcode에서 실행**
   ```bash
   npx cap open ios
   # Xcode에서 실제 기기 선택 후 실행
   ```

### Android (실제 기기)

1. **.env 파일 수정** (iOS와 동일)

2. **빌드 및 동기화**
   ```bash
   bun run build
   npx cap sync android
   ```

3. **Android Studio에서 실행**
   ```bash
   npx cap open android
   # Android Studio에서 실제 기기 선택 후 실행
   ```

## ⚠️ 주의사항

### 현재 제약사항

1. **인증 시스템**:
   - 현재 세션 기반 인증은 정적 앱에서 작동하지 않음
   - 로그인 페이지는 유지하되, 나중에 Firebase/Supabase 등으로 대체 예정

2. **서버 기능**:
   - `hooks.server.ts`는 정적 빌드에서 실행되지 않음
   - 모든 API 호출은 외부 백엔드 서버로 전달됨

3. **데이터베이스**:
   - SQLite는 백엔드 서버에서만 작동
   - 모바일 앱은 API를 통해 데이터 접근

### 보안 설정

**프로덕션 배포 전 필수:**

1. `capacitor.config.ts`에서 `cleartext: true` 제거
2. `allowNavigation`을 프로덕션 도메인만 허용
3. `.env`에서 `PUBLIC_API_URL`을 HTTPS 프로덕션 URL로 변경

## 🚀 프로덕션 배포

### 백엔드 배포

1. **Vercel/Render/Railway 등에 배포**
   ```bash
   # adapter-node로 빌드
   SVELTE_CONFIG=svelte.config.backend.js bun run build

   # 배포 (예: Vercel)
   vercel --prod
   ```

2. **배포된 URL 기록**
   ```
   예: https://api-foodlica.vercel.app
   ```

### 프론트엔드 (Capacitor) 배포

1. **.env 수정**
   ```bash
   PUBLIC_API_URL=https://api-foodlica.vercel.app
   ```

2. **프로덕션 빌드**
   ```bash
   bun run build
   npx cap sync
   ```

3. **앱스토어 제출**
   - iOS: Xcode에서 Archive → App Store Connect 업로드
   - Android: Android Studio에서 Signed APK/Bundle 생성

## 📚 추가 자료

- [Capacitor 공식 문서](https://capacitorjs.com/docs)
- [SvelteKit adapter-static](https://kit.svelte.dev/docs/adapter-static)
- [SvelteKit adapter-node](https://kit.svelte.dev/docs/adapter-node)
