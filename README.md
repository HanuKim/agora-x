# Agora-X

Agora-X는 큐레이션된 뉴스 기사를 바탕으로 구축된 AI 기반 정치/사회 토론 플랫폼입니다. 이 플랫폼은 성숙한 시민 토론 문화를 장려하고, 균형 잡힌 사고를 독려하며, 개인의 신호보다는 '아이디어' 자체에 집중하도록 설계되었습니다. AI를 중립적인 사회자로 활용하여, Agora-X는 간결한 기사 요약을 제공하고 찬반 양론을 구조화하여 보여주며, 심지어 안전하게 중재되는 "국민 제안" 토론 기능을 지원합니다.

> ⚠️ **해커톤 프로토타입**: 현재 단계에서 이 프로젝트는 로컬 JSON 모의 데이터와 상태 유지를 위한 IndexedDB/Local Storage를 활용하여 작동합니다. 실제 백엔드 서버 없이 전적으로 로컬 개발 환경에서 실행됩니다.

---

## 🏗 시스템 아키텍처

Agora-X는 프론트엔드 중심(Frontend-First) 아키텍처로 엔지니어링되었습니다. 최신 React 기능과 로컬 스토리지 도구를 강력하게 통합하여 캐싱 및 데이터 영속성을 관리함으로써, 로컬 환경에서도 완전한 앱 경험을 제공하도록 구현되었습니다.

### 시스템 구성도 (Block Diagram)

```mermaid
graph TD
    subgraph "프론트엔드 애플리케이션 (React + Vite + TS)"
        Router[React Router]
        
        subgraph "페이지 (View Layer)"
            Home[홈]
            Community[국민 토론]
            AITalk[AI 토론 연습]
            Proposals["국민 제안 (UGC)"]
            Profile[마이페이지]
        end
        
        subgraph "기능 로직 (Business Logic Hooks)"
            Auth[Auth Context]
            NewsHook[useNewsWithAISummary]
            PropHook[useProposals]
            AIHook[useIssueWithAI]
        end
        
        subgraph "서비스 및 데이터 영속성 계층 (Persistence Layer)"
            ClaudeAPI[Claude AI 서비스]
            ProposalDB[(proposalDB<br/>IndexedDB)]
            AICacheDB[(aiCacheDB<br/>IndexedDB)]
            HistoryDB[(historyDB<br/>LocalStorage)]
        end
        
        Router --> 페이지
        페이지 --> 기능 로직
        기능 로직 --> 서비스 및 데이터 영속성 계층
    end

    LocalMock[(로컬 JSON 모의 데이터)]
    Anthropic[Anthropic Claude API]
    
    ClaudeAPI <-->|요약 생성 및 적절성 검증| Anthropic
    NewsHook --> LocalMock
```

### 주요 기술적 특징 (Key Technical Pillars)

#### 1. 데이터 및 영속성 계층 (Data & Persistence Layer)
백엔드가 없는 환경에서 Agora-X는 브라우저의 로컬 스토리지를 적극적으로 활용하여 백엔드 역할을 에뮬레이션합니다.
- **IndexedDB (`proposalDB.ts`)**: "국민 제안"과 "의견" 등 UGC(사용자 생성 콘텐츠)를 위한 주요 데이터 저장소입니다. 좋아요, 스크랩 및 댓글 관계 매핑을 처리합니다.
- **IndexedDB (`aiCacheDB.ts`)**: 반복적이고 값비싼 API 호출을 피하기 위해, 무겁고 복잡한 AI 생성 요약 및 쟁점 논거들을 캐싱합니다.
- **Local Storage (`historyDB.ts`)**: 개인의 AI 토론 채팅 기록과 커스텀 주제 토론 내역을 관리합니다.
- **Mock Service Data**: 핵심 뉴스 기사 및 카테고리별 사회적 쟁점들은 `src/data/*.json` 형태로 제공됩니다.

#### 2. 핵심 기능 세트 (Core Feature Sets)
- **AI 요약 및 토론**: Claude Haiku API를 활용해 뉴스 기사의 핵심 구조(찬반 논거 등)를 추출합니다. 사용자는 반대 의견을 가진 AI와 1대1로 직접 대화하며 논리력을 연습하고 발전시킬 수 있습니다.
- **국민 제안 (People's Proposals)**: 완전한 형태의 게시판 포럼으로, 사용자가 직접 ‘문제 정의, 원인, 현재 상황, 해결책’ 구조로 제안을 발행할 수 있습니다.
- **주제 기반 익명 신원 시스템**: 사용자 이름(닉네임)에 따른 편향을 제거하기 위해, 특정 제안에 참여하는 모든 사용자에게 동적으로 큐레이션된 임시 닉네임(예: "용감한 호랑이")이 부여됩니다. 프로필 ID와 제안 ID에 기반한 해시 방식으로 결정되어 익명성을 보장합니다.
- **AI 모더레이션 (안전성 검증)**: 사용자가 등록하는 всех "의견(의견)"은 저장되기 전 Claude 프롬프트를 통해 비속어 필터링 및 인신공격 여부에 대해 철저히 검증 및 차단됩니다.

#### 3. 스타일링 및 테마 시스템 (Styling & Theme System)
모든 레이아웃은 커스텀 Tailwind 설정을 기반으로 구현되었습니다.
- `src/design/theme.ts`를 통해 `text-primary` 및 `bg-surface`와 같은 커스텀 디자인 토큰을 활용하며, 하드코딩된 색상값의 사용을 엄격히 제한합니다.
- Document Root를 수정하는 `useTheme` 훅을 통해 Tailwind 네이티브 다크 모드를 완벽하게 지원합니다.
- 일관된 시각적 리듬(Visual Rhythm)을 유지하기 위해, 모든 메인 뷰 레이아웃은 기본적으로 `max-w-[1200px] mx-auto` 제약을 따르는 반응형 뼈대를 사용합니다.

---

## 💻 사용 기술 스택 (Tech Stack)

- **프레임워크**: React 18, Vite, TypeScript
- **라우팅**: React Router DOM (v6)
- **스타일링**: Tailwind CSS
- **로컬 데이터베이스 엔진**: IndexedDB (`idb` 라이브러리) 및 LocalStorage 인터페이스 Wrapper 역할
- **AI 엔진**: Anthropic Claude (`claude-3-haiku-20240307` 모델)
- **애니메이션/인터랙션**: Framer Motion

---

## 🚀 프로젝트 시작하기 (Getting Started)

### 1. 사전 요구사항 (Prerequisites)
- Node.js (v18 및 이상 버전)
- Claude 서비스를 위한 활성화된 Anthropic API Key.

### 2. 환경 변수 설정 (Environment Setup)
프로젝트 루트 디렉토리에 `.env` 파일을 생성하고 Claude API 키를 추가하세요:
```
VITE_CLAUDE_API_KEY=your_api_key_here
```

### 3. 패키지 설치 (Installation)
```bash
npm install
```

### 4. 개발 서버 실행 (Run Development Server)
```bash
npm run dev
```

터미널에 표시되는 개발 서버 링크 (일반적으로 `http://localhost:5173`)로 접속하여 브라우저에서 애플리케이션을 확인하세요.

---

## 📁 디렉토리 구조 (Directory Structure)

```text
src/
├── app/               # 메인 애플리케이션 설정 (React Router 매핑)
├── components/        # 재사용 가능한 UI 프레젠테이션 컴포넌트
│   ├── auth/          # 인증 및 로그인 모달 관련
│   ├── common/        # 공통 사용 컴포넌트 (검색, 모달 등)
│   ├── layout/        # 페이지 공유 레이아웃 (Header, Footer 등)
│   └── ui/            # 비즈니스 로직이 배제된 순수 원시 컴포넌트 (Button, Card, Input)
├── data/              # 뉴스 및 카테고리에 대한 로컬 JSON 모의 데이터
├── design/            # 프로젝트 메인 테마 토큰 및 컬러 환경설정
├── features/          # 도메인 주도 단위의 핵심 비즈니스 로직 연동 (Hooks 및 Context)
├── pages/             # 각 라우트에 연결된 전체 페이지 뷰 컨테이너
├── services/          # 내부 Local DB 통신, 캐싱 및 외부 AI API 호출 레이어
│   ├── ai/            # Claude 통합 로직 및 AI 응답 관련 캐싱 서비스
│   └── db/            # IndexedDB 구조에 맞는 데이터베이스 엔티티 스키마
└── utils/             # 헬퍼 함수 및 문자열 생성 유틸리티 (닉네임 알고리즘 등)
```

---

## ✅ 개발 원칙 세부 가이드 (Development Principles)

1. **프론트엔드 중심 철학 (Frontend-First Context)**: 백엔드가 당장 서비스되지 않는 상황에서도 원활히 동작하도록 IndexedDB 계층을 통해 데이터 관리가 안전하게 이루어져야 합니다.
2. **컴포넌트 재사용성 (Component Reusability)**: 모든 UI 요소는 여러 페이지 컴포넌트에서 재사용 가능하게 캡슐화되어야 합니다.
3. **디자인 시스템 융합 (Design System Integration)**: 일반적인 Tailwind 유틸리티 클래스가 아닌 `theme.ts`에 정의된 토큰 기반 클래스 중심의 스타일링을 지향하세요. 동적인 인터랙션에 의한 위치(absolute positioning)나 수학적 스케일 변경에 한해서만 `inline-styles`를 허용합니다.

*시스템 초기화 과정에서 설정된 보다 구체적인 아키텍처 규칙과 디자인 규약에 대해서는 필히 `src/docs/DEVELOPMENT_GUIDE.md` 문서를 참조하시길 바랍니다.*
