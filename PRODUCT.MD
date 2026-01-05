# Foodlica - 식당 랜덤 추천 앱

## 프로젝트 개요

FoodLica는 "오늘 뭐 먹지?" 고민을 해결해주는 위치 기반 식당 랜덤 추천 서비스입니다. 사용자의 현재 위치를 기반으로 주변 맛집 6곳을 무작위로 추천하고, 선택한 식당까지의 경로를 안내하며, 방문 후기를 남길 수 있는 간단하면서도 실용적인 웹 애플리케이션입니다.

## 핵심 컨셉

**"선택의 피로를 줄이고, 새로운 맛집을 발견하는 즐거움을 선사한다"**

- 너무 많은 선택지는 오히려 결정을 어렵게 만듭니다
- 랜덤 추천을 통해 선택의 부담을 줄이고 새로운 식당을 발견할 기회를 제공합니다
- 평점 기반 필터링으로 신뢰할 수 있는 맛집만 추천합니다

## 주요 기능

### 1. 위치 기반 검색
- 사용자의 현재 위치 자동 감지 (Geolocation API)
- 검색 반경 설정 (300m, 500m, 800m, 1km, 1.5km, 2km - 걸어갈 수 있는 거리)
- 구글맵 API를 통한 실시간 식당 정보 조회
- 지도 컨트롤 (확대/축소, Street View, 현재 위치) 오른쪽 상단 배치
- 기본 POI 마커 완전 제거 (호텔, 교회, 공원 등 불필요한 아이콘 숨김)

### 2. 스마트 필터링
- 최소 평점 설정 (예: 4.0점 이상)
- 영업 중인 식당만 표시 옵션
- 음식 카테고리 선택 (한식, 중식, 일식, 양식, 카페 등)

### 3. 랜덤 추천
- 조건에 맞는 식당 중 랜덤하게 6곳 선정
- 각 식당의 기본 정보 표시
  - 식당명
  - 평점 및 리뷰 수
  - 거리 정보
  - 대표 사진
  - 영업 상태 (영업중/영업종료)
- 다시 추천 받기 버튼 (새로운 6곳 추천)
- 레이아웃 선택 (타일형 3x2 그리드/리스트형)

### 4. 경로 안내
- 선택한 식당까지의 경로 표시
- 예상 소요 시간 및 거리
- 도보/차량/대중교통 경로 옵션
- 구글맵 연동하여 상세 내비게이션 제공

### 5. 후기 관리
- 방문한 식당에 대한 개인 후기 작성
- 별점 및 간단한 메모
- 방문 날짜 자동 기록
- 내가 작성한 후기 목록 조회
- 재방문 의사 체크

## 기술 스택

### Frontend
- **Framework**: SvelteKit 2.x
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4.x
- **State Management**: Svelte Stores
- **Build Tool**: Vite 7.x

### APIs & Services
- **Maps**: Google Maps API
  - Places API (식당 검색)
  - Geocoding API (위치 변환)
  - Directions API (경로 안내)
  - Maps JavaScript API (지도 표시)
- **Geolocation**: Browser Geolocation API

### Backend (필요시)
- **Runtime**: Node.js
- **Database**: 로컬 스토리지 (초기) → PostgreSQL/Supabase (확장)
- **Deployment**: Vercel / Netlify

## 아키텍처

### 디렉토리 구조

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
│   │   ├── BottomSheet.svelte
│   │   └── ReviewForm.svelte
│   ├── stores/             # 상태 관리
│   │   ├── location.ts
│   │   ├── settings.ts
│   │   ├── reviews.ts
│   │   └── ui.ts          # UI 상태 (패널 열림/닫힘, 레이아웃 모드 등)
│   ├── services/           # 외부 API 연동
│   │   ├── googleMaps.ts
│   │   └── geolocation.ts
│   ├── types/              # TypeScript 타입 정의
│   │   └── index.ts
│   └── utils/              # 유틸리티 함수
│       └── helpers.ts
├── routes/
│   ├── +page.svelte        # 메인 페이지 (지도 + 검색 패널)
│   ├── +layout.svelte      # 공통 레이아웃
│   ├── recommend/          # 추천 결과 페이지
│   │   └── +page.svelte
│   ├── route/              # 경로 안내 페이지
│   │   └── +page.svelte
│   └── reviews/            # 후기 관리 페이지
│       └── +page.svelte
└── app.html
```

## 데이터 구조

### Restaurant (식당 정보)
```typescript
interface Restaurant {
  id: string;                    // Google Place ID
  name: string;                  // 식당명
  rating: number;                // 평점 (0-5)
  reviewCount: number;           // 리뷰 수
  category: string[];            // 카테고리
  address: string;               // 주소
  location: {
    lat: number;
    lng: number;
  };
  distance: number;              // 사용자로부터의 거리 (m)
  photoUrl?: string;             // 대표 사진
  openNow?: boolean;             // 영업 중 여부
  openingHours?: string[];       // 영업 시간
  priceLevel?: number;           // 가격대 (0-4)
}
```

### UserSettings (사용자 설정)
```typescript
interface UserSettings {
  radius: number;                // 검색 반경 (m)
  minRating: number;             // 최소 평점
  categories: string[];          // 선호 카테고리
  transportMode: 'WALKING' | 'DRIVING' | 'TRANSIT';
  onlyOpenNow: boolean;          // 영업중만 표시
  layoutMode: 'tile' | 'list';   // 추천 결과 레이아웃 모드
}
```

### Review (후기)
```typescript
interface Review {
  id: string;
  restaurantId: string;
  restaurantName: string;
  rating: number;                // 개인 별점 (1-5)
  comment: string;               // 후기 내용
  visitDate: Date;               // 방문 일자
  wouldVisitAgain: boolean;      // 재방문 의사
  createdAt: Date;
}
```

### UserLocation (사용자 위치)
```typescript
interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;              // 정확도 (m)
  timestamp: Date;
}
```

## 사용자 플로우

### 메인 플로우
```
1. 앱 접속 & 로딩 화면 (최소 2초, Google Maps 초기화)
   ↓
2. 로그인 페이지
   - 이메일/패스워드 로그인
   - 회원가입 (회원가입 후 로그인 페이지로 리다이렉트)
   ↓
3. 위치 권한 요청 & 현재 위치 감지
   ↓
4. 메인 화면 진입
   - 전체 화면 구글 맵 (POI 마커 제거)
   - 좌측 상단: 햄버거 메뉴 버튼 (≡)
   - 우측 상단: 지도 컨트롤 (확대/축소, Street View, 현재 위치)
   ↓
5. 하단 검색 패널에서 설정 조정
   - 반경 (300m~1km, 100m 단위 - 도보 고정)
   - 최소 평점 (0~4.5)
   - 카테고리 (레스토랑, 카페, 베이커리 등) - OR 조건
   - 현재 영업중인 곳만
   ↓
6. "식당 찾기" 버튼 클릭
   → 조건에 맞는 식당들이 지도에 민트색 마커로 표시됨
   → 버튼 텍스트가 "식당 찾기 (15개)"로 변경되어 검색 완료 표시
   ↓
7. "🎲 랜덤 추천 받기 (6개)" 버튼 클릭
   ↓
8. 추천 결과 페이지
   - 6개 식당 랜덤 추천 (타일형 3x2 또는 리스트형)
   - 레이아웃 전환 버튼 (▦ ⇄ 📋)
   ↓
9-a. 마음에 안들면 "🎲 다시 뽑기" 클릭 → 새로운 6개 추천
9-b. 식당 선택
   ↓
10. 경로 안내 페이지로 이동
    - 선택한 식당 정보 (이름, 주소, 평점, 거리)
    - 경로 거리/시간 표시
    - 지도에 경로 폴리라인 표시 (피치 색상)
   ↓
11. "🗺️ Google Maps로 길찾기" 버튼
    → Google Maps 앱/웹으로 연결
   ↓
12. "✏️ 후기 작성하기" 버튼 클릭
    ↓
13. 후기 작성 모달
    - 별점 선택 (필수)
    - 방문일 (기본값: 오늘)
    - 후기 내용 (선택, 500자 제한)
    - 다시 방문하고 싶어요 (체크박스)
    ↓
14. 후기 작성 완료 → /reviews 페이지로 이동
```

### 사이드 메뉴 플로우
```
메인 화면 좌측 상단 햄버거 메뉴 (≡) 클릭
   ↓
사이드바 열림 (왼쪽에서 슬라이드)
   ↓
메뉴 선택:
   - 👤 내 정보 → /profile (Phase 2.5)
   - 📝 내 후기 → /reviews
   - 📍 방문한 내역 → /history (Phase 2.5)
   - 🚪 로그아웃 → /login
```

### 후기 관리 플로우
```
/reviews 페이지
   ↓
통계 대시보드 확인
   - 총 후기 수
   - 평균 평점
   - 재방문 의사 비율
   ↓
후기 목록 확인 (그리드 레이아웃)
   ↓
옵션:
   - ✏️ 버튼 → 후기 수정 모달
   - 🗑️ 버튼 → 후기 삭제 (확인 다이얼로그)
   - "← 메인으로" 링크 → /main
```

## UI/UX 컨셉

### 디자인 원칙
1. **단순함**: 복잡한 UI 없이 직관적인 흐름
2. **빠른 결정**: 6가지 선택지로 적절한 의사결정 범위 제공
3. **시각적 매력**: 음식 사진을 중심으로 한 카드 디자인
4. **모바일 우선**: 외출 시 사용하는 시나리오에 최적화
5. **부드러운 경험**: 파스텔 톤의 편안한 인터페이스
6. **깨끗한 지도**: 불필요한 POI 마커 제거로 식당 마커만 집중 표시

### 컬러 스킴 (파스텔 톤)
- Primary: 부드러운 피치/코랄 파스텔 (#FFB4AB, #FFDAB9)
- Secondary: 민트 그린 파스텔 (#B2E0D4, #C7EFCF)
- Accent: 라벤더 파스텔 (#E6D9F2, #D4C5F9)
- Neutral: 아이보리/라이트 그레이 배경 (#FAFAFA, #F5F5F5)
- Text: 소프트 차콜 (#4A4A4A)

### 주요 화면 구성

#### 로딩 화면
- Foodlica 로고 애니메이션
- 위치 정보 로딩 인디케이터
- "주변 맛집을 찾고 있어요..." 메시지

#### 메인 화면
- **전체 화면 구글 맵** (기본 레이아웃)
  - 검색한 식당들만 민트 색상 마커로 표시 (기본 POI 완전 제거)
  - 마커 클릭 시 식당 상세 정보 표시 (InfoWindow)
    - 이름, 주소, 평점, 리뷰 수, 가격대, 영업 상태, 거리, 전화번호, 웹사이트
  - 현재 위치 마커 (피치 색상 원형 마커)
  - 우측 상단: 지도 컨트롤 (확대/축소, Street View, 현재 위치 버튼)
- 상단: 로고 & 설정 버튼 (반투명 오버레이)
- 하단: 검색 설정 패널 (접었다/펼쳤다 가능)
  - 펼치기 전: "식당 찾기 (X개)" 버튼만 표시 (검색 후 개수 표시)
  - 펼친 후: 반경, 평점, 카테고리 필터 표시
  - 드래그하여 높이 조절 가능

#### 추천 결과 화면
- 상단: 레이아웃 전환 버튼 (타일형 ⇄ 리스트형)
- **타일형 레이아웃**
  - 6개 식당 카드를 2열 그리드로 배치 (3x2 배열)
  - 각 카드: 사진(상단), 이름, 평점, 거리, 영업상태
  - 카드 호버/탭 시 확대 애니메이션
- **리스트형 레이아웃**
  - 6개 식당을 세로로 나열
  - 각 항목: 사진(좌측), 상세 정보(우측)
  - 스와이프로 즐겨찾기 추가 가능 (Phase 2)
- 하단: "다시 뽑기" 버튼

#### 경로 안내 화면
- 전체 화면 지도
- 상단: 식당 정보 요약 카드
- 하단: 경로 옵션 & "구글맵으로 열기" 버튼

#### 후기 관리 화면
- 방문 기록 리스트
- 각 항목 클릭 시 상세 후기 보기
- FAB 버튼으로 새 후기 작성

## 개발 로드맵

### Phase 1: MVP (v0.1) - ✅ 완료 (2025-12-31)
- [x] 로딩 화면 구현 (최소 2초 표시)
- [x] **인증 시스템 구현**
  - [x] 이메일/패스워드 회원가입 및 로그인
  - [x] SQLite 데이터베이스 (Drizzle ORM)
  - [x] bcrypt 비밀번호 해싱
  - [x] 세션 기반 인증 (httpOnly 쿠키)
  - [x] hooks.server.ts 인증 미들웨어
  - [x] 회원가입 후 로그인 페이지 리다이렉트
  - [x] 커스텀 에러 페이지 (404, 500)
- [x] 위치 기반 식당 검색 (Google Places API - legacy, 안정적)
- [x] 메인 화면 전체 화면 구글 맵 표시
- [x] 지도 기본 POI 마커 완전 제거 (호텔, 교회, 공원 등 모든 아이콘/라벨)
- [x] 검색 후 식당 마커만 표시 (민트 색상 원형 마커)
- [x] 마커 클릭 시 상세 정보 InfoWindow (이름, 주소, 평점, 가격, 영업상태, 거리, 전화, 웹사이트)
- [x] 지도 컨트롤 우측 상단 배치 (확대/축소, Street View)
- [x] 현재 위치로 이동 버튼 (우측 상단, 피치 색상)
- [x] Street View 기능 활성화
- [x] 드래그 가능한 하단 검색 패널 (접었다/반/전체 3단계)
- [x] **검색 반경 1km로 제한** (300m~1km, 100m 단위 - 도보 기준)
- [x] **이동수단 도보 고정** (운전/대중교통 옵션 제거)
- [x] 식당 찾기 버튼에 검색 결과 개수 표시 ("식당 찾기 (15개)")
- [x] 랜덤 6곳 추천 (타일형 3x2 레이아웃)
- [x] 추천 결과 레이아웃 전환 (타일형/리스트형)
- [x] **필터링 기능** (반경, 평점, 카테고리, 영업시간)
  - [x] 카테고리 OR 로직 구현 (체크한 모든 카테고리 통합 검색)
- [x] **경로 안내 시스템**
  - [x] 서버사이드 API 프록시 (/api/routes) - CORS 해결
  - [x] Google Directions API (REST) 연동
  - [x] ZERO_RESULTS 자동 재시도 (available_travel_modes 활용)
  - [x] 경로 폴리라인 지도 표시 (피치 색상, 가시성 개선)
- [x] Svelte 5 Runes 기반 상태 관리
- [x] 파스텔 톤 컬러 스킴 적용 (피치, 민트, 라벤더)

### Phase 2: 핵심 기능 (v0.5) - ✅ 완료 (2025-12-31)
#### 후기 시스템
- [x] 후기 데이터베이스 스키마 추가 (SQLite)
  - [x] reviews 테이블 (user_id, restaurant_id, rating, comment, visit_date, would_visit_again, photos)
  - [x] Drizzle ORM 스키마 정의 및 마이그레이션
- [x] 후기 작성 기능
  - [x] 경로 페이지에서 "후기 작성" 버튼 (경로 확인 후에만 작성 가능)
  - [x] ReviewForm 컴포넌트 (별점 필수, 코멘트/방문일/재방문 의사 선택)
  - [x] 모달 UI로 구현
  - [x] 중복 후기 방지 (같은 식당에 이미 후기 작성 시 에러)
  - [x] photos 필드 추가 (Phase 3에서 업로드 구현 예정)
- [x] 후기 조회 및 관리
  - [x] 내가 쓴 후기 목록 페이지 (/reviews)
  - [x] ReviewCard 컴포넌트 (수정/삭제 버튼 포함)
  - [x] 후기 수정 기능 (모달)
  - [x] 후기 삭제 기능 (확인 다이얼로그)
  - [x] 상대 시간 표시 ("오늘", "2일 전", "3개월 전")
- [x] 방문 통계
  - [x] 총 방문 식당 수
  - [x] 평균 평점
  - [x] 재방문 의사 비율 (%)
  - [x] 통계 대시보드 (3개 카드, 호버 애니메이션)
- [x] 백엔드 API
  - [x] POST /api/reviews - 후기 작성
  - [x] GET /api/reviews - 내 후기 목록
  - [x] GET /api/reviews/[id] - 후기 상세
  - [x] PUT /api/reviews/[id] - 후기 수정
  - [x] DELETE /api/reviews/[id] - 후기 삭제
  - [x] GET /api/reviews/stats - 통계 조회
  - [x] 인증 확인 및 소유권 검증

#### UI/UX 개선
- [x] 로딩 상태 (스피너 + 메시지)
- [x] 에러 상태 (에러 메시지 + 재시도 버튼)
- [x] 빈 상태 디자인 (후기 없음 - 아이콘 + CTA 버튼)
- [x] 모달 오버레이 (ReviewForm)
- [x] 카드 호버 애니메이션
- [x] 버튼 호버/액티브 애니메이션
- [x] 부드러운 그라데이션 배경

#### 반응형 디자인
- [x] 모바일 최적화 (ReviewForm, ReviewCard, /reviews 페이지)
- [x] 태블릿/데스크톱 그리드 레이아웃
- [x] 반응형 통계 카드
- [x] 모바일 모달 스크롤

#### 사이드 메뉴
- [x] 햄버거 메뉴 버튼 (메인 페이지 좌측 상단)
- [x] 슬라이드 사이드바 (왼쪽에서 열림)
- [x] 사용자 정보 표시 (이메일)
- [x] 메뉴 항목 (내 정보, 내 후기, 방문한 내역)
- [x] 로그아웃 기능

### Phase 2.5: 추가 페이지 (v0.6) - 🚧 진행 중 (2025-12-31)
#### 내 정보 페이지 (/profile) - ✅ 완료
- [x] 사용자 프로필 표시
  - [x] 이메일
  - [x] 가입일
  - [x] 활동 통계 (총 후기, 평균 평점, 재방문 의사)
- [x] 비밀번호 변경 기능
  - [x] 현재 비밀번호 확인
  - [x] 새 비밀번호 검증 (최소 6자)
  - [x] API 엔드포인트 (/api/auth/change-password)
- [x] 계정 삭제 기능
  - [x] 이중 확인 다이얼로그
  - [x] 관련 데이터 삭제 (후기, 세션)
  - [x] API 엔드포인트 (/api/auth/delete-account)
- [ ] 계정 설정 (Phase 3)
  - [ ] 알림 설정
  - [ ] 개인정보 처리방침

#### 방문한 내역 페이지 (/history) - ✅ 기본 기능 완료
- [x] 방문 기록 목록
  - [x] 식당명, 방문일, 위치 정보
  - [x] 후기 작성 여부 표시
- [x] 월별 그룹화
  - [x] 월별로 방문 기록 시각화
  - [x] 그룹별 리스트 표시
- [x] 통계
  - [x] 총 방문 횟수
  - [x] 이번 달 방문 횟수
  - [x] 후기 미작성 수
  - [ ] 가장 많이 방문한 식당 (Phase 3)
  - [ ] 평균 이동 거리 (Phase 3)
- [x] 방문 기록에서 바로 후기 작성
  - [x] 후기 미작성 식당 구분 표시
  - [x] 원클릭 후기 작성 버튼
- [ ] 달력 뷰 (Phase 3)
  - [ ] 캘린더 UI
  - [ ] 날짜별 필터링

#### 데이터베이스
- [x] visit_history 테이블 추가
  - [x] user_id, restaurant_id, restaurant_name
  - [x] restaurant_address (주소)
  - [x] visit_date (방문 시간)
  - [x] has_review (후기 작성 여부)
  - [x] review_id (작성된 후기 ID)
  - [x] created_at (기록 생성 시간)
- [x] 방문 기록 헬퍼 함수
  - [x] getUserVisitHistory() - 사용자 방문 기록 조회
  - [x] getUserVisitStats() - 방문 통계 조회
  - [x] createVisitHistory() - 방문 기록 생성
  - [x] updateVisitHistoryWithReview() - 후기 작성 시 업데이트
- [ ] 경로 페이지에서 방문 기록 자동 저장 (Phase 3)

### Phase 3: 고도화 (v1.0)
- [ ] 소셜 로그인 (Google/Kakao OAuth)
- [ ] 프로필 사진 업로드
- [ ] 후기 사진 업로드 (현재는 photos 필드만 존재)
- [ ] 즐겨찾기 기능
- [ ] 친구 기능 기반

### Phase 4: 확장 (v2.0)
- [ ] 친구 기능 (함께 갈 사람 초대)
- [ ] 소셜 공유
- [ ] 맛집 컬렉션
- [ ] AI 기반 개인화 추천

## API 및 환경 설정

### 필요한 API 서비스

#### 1. Google Maps Platform
프로젝트에서 사용하는 Google Maps API 목록:

- **Places API (Legacy)**
  - 용도: 주변 식당 검색, 식당 상세 정보 조회
  - 주요 기능: `PlacesService.nearbySearch`, `PlacesService.getDetails`
  - 상태: Deprecated이지만 최소 12개월 이상 지원 보장, 안정적으로 작동
  - 요금: 월 $200 무료 크레딧 제공
  - 참고: https://developers.google.com/maps/documentation/javascript/places
  - 참고: New Places API로 마이그레이션 가이드 https://developers.google.com/maps/documentation/javascript/places-migration-overview

- **Maps JavaScript API**
  - 용도: 지도 표시, 마커 표시, Street View
  - 주요 기능: `Map`, `Marker`, `InfoWindow`, `StreetViewPanorama`
  - 마커 타입: 일반 `google.maps.Marker` 사용 (Advanced Markers 대신)
  - POI 제거: Map styles를 통한 모든 POI 아이콘/라벨 숨김
  - 요금: 월 $200 무료 크레딧 제공
  - 참고: https://developers.google.com/maps/documentation/javascript

- **Directions API**
  - 용도: 경로 계산 및 표시
  - 주요 기능: 출발지-목적지 경로, 소요시간 계산
  - 요금: 1000건/월 무료, 이후 $5/1000건
  - 참고: https://developers.google.com/maps/documentation/directions

- **Geocoding API** (선택사항)
  - 용도: 주소 ↔ 좌표 변환
  - 요금: 월 $200 무료 크레딧 제공
  - 참고: https://developers.google.com/maps/documentation/geocoding

**API 키 발급 방법:**
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 생성 또는 선택
3. API 및 서비스 → 사용자 인증 정보
4. API 키 생성
5. 사용할 API 활성화 (Places API, Maps JavaScript API, Directions API)
6. API 키 제한 설정 (권장: HTTP 리퍼러 제한)

**API 사용량 제한 (무료 티어 기준):**
- 월 $200 무료 크레딧
- Places API: ~28,500건/월 (검색 기준)
- Directions API: 40,000건/월
- Maps JavaScript API: 28,500건/월 (지도 로드 기준)

#### 2. 데이터베이스 (Phase 3 이후)

**Supabase (권장)**
- PostgreSQL 기반 BaaS (Backend as a Service)
- 실시간 구독, 인증, 스토리지 제공
- 무료 티어: 500MB DB, 1GB 파일 스토리지, 2GB 대역폭
- 가격: 무료 / Pro $25/월
- 설정 방법:
  1. [Supabase](https://supabase.com/) 가입
  2. 새 프로젝트 생성
  3. Database URL 및 API 키 복사
  4. .env 파일에 설정

**대안: PostgreSQL (직접 호스팅)**
- Railway, Render, Neon 등의 서비스 활용 가능
- 무료 티어 제공 (Railway: $5 무료 크레딧/월)

### 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력하세요:

```bash
# Google Maps API
PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# 앱 설정
PUBLIC_APP_NAME=Foodlica
PUBLIC_APP_URL=http://localhost:5173

# 데이터베이스 (Phase 3 이후)
DATABASE_URL=postgresql://user:password@host:port/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_key

# 개발 환경
NODE_ENV=development
```

**주의사항:**
- `.env` 파일은 절대 Git에 커밋하지 마세요
- `.gitignore`에 `.env`가 포함되어 있는지 확인하세요
- 프로덕션 배포 시 환경변수는 호스팅 플랫폼에서 직접 설정하세요
- `PUBLIC_` 접두사가 있는 변수만 클라이언트에서 접근 가능합니다

### 데이터베이스 스키마 (Phase 3)

#### users 테이블
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### reviews 테이블
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  visit_date DATE,
  would_visit_again BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
```

#### favorites 테이블
```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id VARCHAR(255) NOT NULL,
  restaurant_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, restaurant_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
```

#### user_settings 테이블
```sql
CREATE TABLE user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  default_radius INTEGER DEFAULT 1000,
  default_min_rating DECIMAL(2,1) DEFAULT 4.0,
  preferred_categories TEXT[],
  transport_mode VARCHAR(20) DEFAULT 'WALKING',
  only_open_now BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 로컬 개발 환경 구성

#### Phase 1-2 (로컬 스토리지 사용)
```typescript
// src/lib/services/storage.ts
// 브라우저 localStorage를 사용한 간단한 저장소
export const storage = {
  reviews: {
    getAll: () => JSON.parse(localStorage.getItem('reviews') || '[]'),
    save: (reviews) => localStorage.setItem('reviews', JSON.stringify(reviews))
  },
  settings: {
    get: () => JSON.parse(localStorage.getItem('settings') || '{}'),
    save: (settings) => localStorage.setItem('settings', JSON.stringify(settings))
  }
};
```

#### Phase 3 (Supabase 연동)
```typescript
// src/lib/db/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '$env/static/public';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

## 기술적 고려사항

### Google Maps API 구현
- **Places API**: Legacy 버전 사용 (PlacesService)
  - Deprecated 경고가 있지만 최소 12개월 지원 보장
  - New API보다 안정적이고 검증됨
  - 향후 New Places API로 마이그레이션 고려
- **Markers**: 일반 Marker 사용
  - Advanced Markers 대신 `google.maps.Marker` 사용
  - 커스텀 아이콘 (SVG path를 사용한 원형 마커)
  - 피치 색상 (사용자 위치), 민트 색상 (식당)
- **POI 제거**: Map styles를 통한 모든 POI 숨김
  - featureType: 'poi' 전체 visibility: 'off'
  - clickableIcons: false 설정

### API 사용량 최적화
- Google Maps API는 사용량 제한이 있으므로 효율적 호출 필요
- 검색 결과 캐싱 (같은 위치/설정이면 재사용)
- Debouncing/Throttling 적용
- 개발 중에는 API 호출 횟수 모니터링 (Google Cloud Console)
- 검색 반경 최대 2km로 제한하여 API 호출 효율성 향상

### 오프라인 지원
- Service Worker를 통한 기본 캐싱
- 마지막 검색 결과 저장
- 오프라인 시 로컬 스토리지 데이터만 표시

### 성능 최적화
- 이미지 Lazy Loading
- 지도 로딩 최적화 (필요시에만 로드)
- 코드 스플리팅
- Google Maps API 라이브러리 동적 로드

### 보안
- API 키 환경변수 관리
- Google Maps API 키에 HTTP 리퍼러 제한 설정
- Supabase Row Level Security (RLS) 정책 적용
- CORS 설정
- 사용자 위치 정보 암호화 저장
- XSS, CSRF 방어

## 성공 지표

- 일일 활성 사용자 (DAU)
- 추천 수락률 (6개 중 선택한 비율)
- 재방문율 (앱 재사용 빈도)
- 레이아웃 전환 사용률 (타일형 vs 리스트형 선호도)
- 검색 반경 분포 (사용자들이 선호하는 거리)
- 식당 마커 클릭률 (지도 상호작용)
- Street View 사용률
- 후기 작성률 (Phase 2)
- 평균 세션 시간

---

**Last Updated**: 2025-12-31
**Version**: 0.6.0 (Phase 2.5 진행 중 - 내 정보 & 방문한 내역)
**Framework**: SvelteKit 2.x + Svelte 5.45.6
**Tech Stack**: TypeScript, Tailwind CSS 4.x, SQLite + Drizzle ORM, Google Maps API (Legacy Places API, Directions API)
**Auth**: 이메일/패스워드 인증, 세션 기반 (bcrypt + httpOnly cookies)
**Features**:
- 위치 기반 식당 검색 및 랜덤 추천 (1km 도보 기준)
- 경로 안내 (Google Directions API, 자동 재시도)
- 후기 작성/수정/삭제 (별점, 코멘트, 방문일, 재방문 의사)
- 통계 대시보드 (총 후기, 평균 평점, 재방문 의사 비율)
- 내 정보 페이지 (프로필, 활동 통계, 비밀번호 변경, 계정 삭제)
- 방문한 내역 페이지 (방문 기록 목록, 월별 그룹화, 방문 통계, 후기 작성 버튼)