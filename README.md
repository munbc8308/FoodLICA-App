# FoodLICA - 식당 랜덤 추천 앱

## 프로젝트 개요

FoodLICA는 "오늘 뭐 먹지?" 고민을 해결해주는 위치 기반 식당 랜덤 추천 서비스입니다. 사용자의 현재 위치를 기반으로 주변 맛집 6곳을 무작위로 추천하고, 선택한 식당까지의 경로를 안내하는 간단하면서도 실용적인 웹 애플리케이션입니다.

## 핵심 컨셉

**"선택의 피로를 줄이고, 새로운 맛집을 발견하는 즐거움을 선사한다"**

- 너무 많은 선택지는 오히려 결정을 어렵게 만듭니다
- 랜덤 추천을 통해 선택의 부담을 줄이고 새로운 식당을 발견할 기회를 제공합니다
- 평점 기반 필터링으로 신뢰할 수 있는 맛집만 추천합니다

## 주요 기능

### 1. 위치 기반 검색
- 사용자의 현재 위치 자동 감지 (Geolocation API)
- 검색 반경 설정 (300m ~ 1km, 도보 거리 기준)
- 구글맵 API를 통한 실시간 식당 정보 조회
- 지도 컨트롤 (확대/축소, Street View, 현재 위치)
- 기본 POI 마커 완전 제거 (식당 마커만 표시)

### 2. 스마트 필터링
- 최소 평점 설정 (예: 4.0점 이상)
- 영업 중인 식당만 표시 옵션
- 음식 카테고리 선택 (한식, 중식, 일식, 양식, 카페 등)

### 3. 랜덤 추천
- 조건에 맞는 식당 중 랜덤하게 6곳 선정
- 각 식당의 기본 정보 표시 (식당명, 평점, 거리, 사진, 영업 상태)
- 다시 추천 받기 버튼 (새로운 6곳 추천)
- 레이아웃 선택 (타일형 3x2 그리드/리스트형)

### 4. 경로 안내
- 선택한 식당까지의 경로 표시
- 예상 소요 시간 및 거리
- 구글맵 연동하여 상세 내비게이션 제공

## 기술 스택

### Frontend
- **Framework**: SvelteKit 2.x with Svelte 5 (Runes 기반 상태 관리)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **Build Tool**: Vite 7.x

### APIs & Services
- **Maps**: Google Maps API
  - Places API (식당 검색)
  - Directions API (경로 안내)
  - Maps JavaScript API (지도 표시)
- **Geolocation**: Browser Geolocation API

### Deployment
- **Web**: Vercel (adapter-vercel)
- **Mobile**: Capacitor 8 (iOS/Android)

## 프로젝트 구조

```
src/
├── lib/
│   ├── components/          # 재사용 컴포넌트
│   │   ├── LoadingScreen.svelte
│   │   ├── RestaurantCard.svelte
│   │   ├── RestaurantList.svelte
│   │   ├── RestaurantTileGrid.svelte
│   │   ├── MapView.svelte
│   │   ├── FilterPanel.svelte
│   │   └── BottomSheet.svelte
│   ├── stores/              # Svelte 5 Runes 기반 상태 관리
│   │   ├── location.svelte.ts
│   │   ├── settings.svelte.ts
│   │   ├── restaurants.svelte.ts
│   │   └── route.svelte.ts
│   ├── services/            # 외부 API 연동
│   │   ├── googleMaps.ts
│   │   ├── places.ts
│   │   ├── directions.ts
│   │   └── geolocation.ts
│   ├── types/               # TypeScript 타입 정의
│   │   └── index.ts
│   └── constants/           # 상수 정의
│       └── index.ts
├── routes/
│   ├── +page.svelte         # 로딩 페이지 (위치 초기화)
│   ├── +layout.svelte       # 공통 레이아웃
│   ├── main/                # 메인 페이지 (지도 + 검색 패널)
│   │   └── +page.svelte
│   ├── recommend/           # 추천 결과 페이지
│   │   └── +page.svelte
│   ├── route/               # 경로 안내 페이지
│   │   └── +page.svelte
│   └── api/
│       └── routes/          # Directions API 프록시
│           └── +server.ts
└── app.html
```

## 사용자 플로우

```
1. 앱 접속 & 로딩 화면 (Google Maps 초기화)
   ↓
2. 위치 권한 요청 & 현재 위치 감지
   ↓
3. 메인 화면 진입
   - 전체 화면 구글 맵 (POI 마커 제거)
   - 우측 상단: 지도 컨트롤 (확대/축소, Street View, 현재 위치)
   ↓
4. 하단 검색 패널에서 설정 조정
   - 반경 (300m~1km)
   - 최소 평점 (0~4.5)
   - 카테고리 (레스토랑, 카페, 베이커리 등)
   - 현재 영업중인 곳만
   ↓
5. "식당 찾기" 버튼 클릭
   → 조건에 맞는 식당들이 지도에 민트색 마커로 표시
   ↓
6. "🎲 랜덤 추천 받기 (6개)" 버튼 클릭
   ↓
7. 추천 결과 페이지
   - 6개 식당 랜덤 추천 (타일형/리스트형)
   ↓
8. 식당 선택 → 경로 안내 페이지
   - 선택한 식당 정보 (이름, 주소, 평점, 거리)
   - 경로 거리/시간 표시
   - 지도에 경로 폴리라인 표시
   ↓
9. "🗺️ Google Maps로 길찾기" 버튼
   → Google Maps 앱/웹으로 연결
```

## UI/UX 컨셉

### 디자인 원칙
1. **단순함**: 복잡한 UI 없이 직관적인 흐름
2. **빠른 결정**: 6가지 선택지로 적절한 의사결정 범위 제공
3. **시각적 매력**: 음식 사진을 중심으로 한 카드 디자인
4. **모바일 우선**: 외출 시 사용하는 시나리오에 최적화
5. **부드러운 경험**: 파스텔 톤의 편안한 인터페이스

### 컬러 스킴 (파스텔 톤)
- **Primary**: 피치/코랄 (#FFB4AB, #FFDAB9)
- **Secondary**: 민트 그린 (#B2E0D4, #C7EFCF)
- **Accent**: 라벤더 (#E6D9F2, #D4C5F9)
- **Neutral**: 아이보리/라이트 그레이 (#FAFAFA, #F5F5F5)
- **Text**: 소프트 차콜 (#4A4A4A)

## 시작하기

### 환경 설정

1. 저장소 클론
```bash
git clone https://github.com/your-repo/foodlica-app.git
cd foodlica-app
```

2. 의존성 설치
```bash
npm install
```

3. 환경 변수 설정
```bash
cp .env.example .env
```

`.env` 파일에 Google Maps API 키 설정:
```bash
PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
PUBLIC_APP_NAME=Foodlica
PUBLIC_APP_URL=http://localhost:5173
```

4. 개발 서버 실행
```bash
npm run dev
```

### 주요 명령어

```bash
npm run dev          # 개발 서버 실행 (localhost:5173)
npm run build        # 프로덕션 빌드
npm run preview      # 빌드 결과 미리보기
npm run check        # TypeScript 타입 체크
npm run lint         # ESLint + Prettier 검사
npm run format       # 코드 포맷팅
```

### 모바일 빌드 (Capacitor)

```bash
npm run build        # 웹 빌드
npx cap sync         # 네이티브 프로젝트 동기화
npx cap run ios      # iOS 시뮬레이터 실행
npx cap run android  # Android 에뮬레이터 실행
```

## Google Maps API 설정

### 필요한 API
- Places API
- Maps JavaScript API
- Directions API

### API 키 발급
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 → 사용자 인증 정보
4. API 키 생성
5. 사용할 API 활성화
6. API 키 제한 설정 (권장: HTTP 리퍼러 제한)

### 사용량 (무료 티어)
- 월 $200 무료 크레딧 제공
- Places API: ~28,500건/월
- Directions API: 40,000건/월
- Maps JavaScript API: 28,500건/월

## 배포

### Vercel 배포
프로젝트는 Vercel 환경을 자동 감지하여 `adapter-vercel`을 사용합니다.

```bash
# Vercel CLI로 배포
vercel --prod
```

### 환경 변수 설정 (Vercel)
Vercel 대시보드에서 다음 환경 변수를 설정하세요:
- `PUBLIC_GOOGLE_MAPS_API_KEY`
- `PUBLIC_APP_NAME`
- `PUBLIC_APP_URL`

---

**Version**: 1.0.0 (Lite)
**Framework**: SvelteKit 2.x + Svelte 5
**Tech Stack**: TypeScript, Tailwind CSS 4.x, Google Maps API
**Features**: 위치 기반 식당 검색, 랜덤 추천, 경로 안내
