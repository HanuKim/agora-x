# ✅ Agora-X Frontend Initialization Guide 

This document defines the **initial frontend setup standard**
for the Agora-X hackathon project.

Agora-X is an AI-assisted political discussion platform
built on curated news articles.

Agora-X is an AI-assisted political discussion platform
built around curated news articles.

The AI serves as a moderator,
providing concise summaries and generating balanced
pros and cons arguments to foster meaningful discussion.

At this stage, the project operates using mock data
and runs exclusively in a local development environment.

Our goal is to deliver a polished, high-quality prototype
and win the hackathon.

⚠️ Deployment is NOT required.
⚠️ Local execution level implementation only.

---

## 📖 Overview

Agora-X is a debate platform leveraging Claude AI to synthesize news, host 1-on-1 AI debates, and facilitate constructive public discourse through "People's Proposals". The project uses React, Tailwind CSS, IndexedDB for caching/offline storage, and Vite.

## 🏗 Architecture

### 1. Data Layer
The application relies extensively on local JSON mock data (`src/data/*.json`) and IndexedDB for state persistence without a real backend.
- `aiCacheDB.ts`: Caches Claude AI responses to minimize API calls and latency.
- `proposalDB.ts`: An IndexedDB wrapper that manages the User Generated Content (UGC) for the "People's Proposal" feature, including `Proposals` and `Opinions`.
  - **Proposal Schema**: Includes `problem`, `reason`, `currentSituation`, `solution`, `category`, ` opinionCount`, `relatedArticleCount`, `likes`, `scraps`, and arrays for `likedBy`/`scrapedBy`.
  - **Opinion Schema**: Includes `likes` and `likedBy`.
- `useProposals.ts`: Custom hooks to access `proposalDB` seamlessly inside React components, including toggle functions for likes and scraps.

### 2. Core Features
- **AI Summary & Debates**: Uses Claude Haiku API to extract pros and cons from news articles. Users can engage in an interactive chat with an AI holding opposing views.
- **People's Proposals (국민 제안)**: A feature allowing users to surface societal issues and propose solutions. Other users can provide feedback ("opinions").
  - *Identities are protected:* All users participating in a proposal are assigned deterministic random nicknames (e.g., "용감한 호랑이" / Brave Tiger) generated dynamically via `nicknameGenerator.ts` based on their profile ID and the proposal ID.
  - *AI Moderation:* Opinions are validated against profanity and inappropriate content using a specialized Claude prompt before submission via `validateOpinion()`.
  - *Interactions:* Users can 'Like' and 'Scrap' proposals, and 'Like' individual opinions. These are tracked via unique user IDs in IndexedDB arrays to prevent duplicates.
  - *My Page:* Scrapped and liked proposals are displayed in the user profile for quick access.

### 3. Styling & Theme System
All styles are tokenized and managed via Tailwind within `src/design/theme.ts`.
- Components should rarely define raw utility strings. Instead, import `theme.button.primary`, etc.
- Dark mode is supported natively via Tailwind's `dark:` classes and toggled via the `useTheme` hook modifying the HTML root element.
- **Layout Standard**: All main pages (Home, Community, Proposal List/Create/Detail) follow a consistent `max-w-[1200px] mx-auto px-xl py-xl` layout to maintain visual rhythm.
- **Category Colors**: Content categories are color-coded in both badges and buttons using the `getActiveCategoryColorClass` utility.

---

## 🧠 Problem Statement

Online political discussions are often polarized,
emotion-driven, and dominated by identity rather than ideas.

Users tend to argue from fixed positions,
rarely encountering structured counterarguments.

There is a lack of systems that:

- Encourage balanced reasoning
- Promote civil discourse
- Separate ideas from identity

---

## 🤖 Why AI as a Moderator?

Agora-X introduces AI as a neutral moderator.

The AI:

- Summarizes articles to reduce misinformation
- Presents structured pros and cons
- Encourages evidence-based reasoning
- Reduces emotional escalation

The AI does NOT replace users.
It structures the discussion.

---

## 🌍 Social Impact

Agora-X aims to:

- Reduce ideological polarization
- Encourage critical thinking
- Promote constructive civic dialogue
- Experiment with AI-assisted democratic discourse

This project explores how AI can improve
the quality of public conversation,
not replace human participation.

---

## 🎭 Anonymous Topic-Based Identity

To reduce identity-based bias,
users are assigned a random nickname
for each discussion topic.

This ensures:

- Arguments are evaluated by content, not reputation
- Reduced personal targeting
- Topic-focused participation

---

## 🎯 Core Functional Goals

1. AI Article Summarization
   - Provide concise neutral summaries

2. Structured Argument Generation
   - Present pros and cons positions

3. AI-Moderated Discussion
   - Encourage balanced reasoning

4. Topic-Based Anonymous Identity
   - Assign random nickname per topic

5. Community Discussion Layer
   - Enable structured thread-based debate

---

## 🚀 Vision Beyond the Hackathon

Agora-X is a prototype exploring
how AI can improve democratic dialogue.

Future directions may include:

- Fact-checking integration
- Sentiment moderation
- Bias detection
- Public policy simulation debates

---

## ✅ Current Implementation Scope
NOT included yet:

- Backend server
- Database connection

---

## ✅ Project Principles

### 1. Frontend-First Architecture
Backend is optional.

All features must work using:
- local state
- mock data
- JSON news dataset

## ✅ AI Development Constraints

All AI-generated code MUST follow registered development skills.

Required skills:

- @vercel-react-best-practices
- @find-skills
- @web-design-guidelines
- @frontend-design

AI MUST prioritize architectural correctness
over rapid implementation.
---

### 2. Extensible Structure
New contributors must be able to:

- add pages easily
- reuse UI components
- follow consistent design rules

---

### 3. Design System Driven Development

All styling MUST use design tokens.

❌ Hardcoded values forbidden  
✅ theme.ts only

## Styling Rule

Pages MUST NOT contain inline styles.

All styling MUST be encapsulated inside:
- UI components
- Feature components
- Design system layer

Inline styles are allowed ONLY for dynamic runtime values.

---

## ✅ Branding Assets

Assets already exist in `/public`.

```

public/
├── favicon.png
├── logo.png
└── code.html   (Stitch prototype)

````

### Favicon

Update:

```html
<link rel="icon" href="/favicon.png" />
````

### Logo Usage

Use `/logo.png` inside:

* Header
* Login Page
* Navigation Area

---

## ✅ Stitch Prototype Rule (VERY IMPORTANT)

`/public/code.html` is **REFERENCE ONLY**.

DO NOT:

* copy HTML
* convert directly into React
* reuse inline styles

ONLY reference:

* layout feeling
* banner composition
* spacing
* visual hierarchy

Agora-X UI architecture is the source of truth.

---

## ✅ Navigation Flow

### Root `/`

```
Top Navigation: 홈 | 커뮤니티 | AI와의 토론 | 이용 가이드
Not Logged In → /login
Logged In → Home
```

---

### `/login`

Social login UI only.

Providers:

* Google
* Kakao
* Naver

Component:

```
features/auth/SocialLoginPage (Implemented as LoginModal mapped under AuthContext, and /login route)
```

---

### `/` (Home)

Structure:

```
Header
Hero Section
Trending Discussions
Featured Issue Grid Section
```

Displays curated news topics mapped from JSON and design concepts from `code.html`.

---

### `/detail`

```
Article Content
AI Summary Area
Discussion Section
```

---

### `/community`

```
News Article Grid List
Forum Thread Elements
```
Displays loaded mock news list.

---

### `/ai-discussion`

```
Discussion Topic Grid (List of curated issues with short summaries)
```

---

### `/ai-discussion/:id`

```
Detailed Issue Page
AI Background, 쟁점 분석

```

---

### `/proposals`

```
국민 제안 목록 전시 (List of user-submitted proposals)
```

---

### `/proposals/new`

```
새로운 국민 제안 작성 폼 UI (Form to create a new proposal)
```

---

### `/proposals/:id`

```
국민 제안 상세 내용 및 시민들의 의견(댓글) 토론 영역
AI 비속어/비방 필터링 적용
```

---

### `/guide`

```
General Site Instructions
Main feature descriptions
```

---

### `/profile`

```
User Info
Settings
Logout
```

---

## ✅ File Structure

```
agora-x/
├── .agent/ 
|     └── skills/
|          └── vercel-react-best-practices/ 
|               ├── rules/
|               ├── AGENTS.md
|               ├── README.md
|               └── SKILLS.md
|        
├── public/
│     ├── code.html
│     ├── favicon.png
│     ├── logo-dark.png
│     └── logo.png
│
├── src/
│     |
│     ├── app/
│     │     └── router.tsx
│     |
│     ├── assets/
│     │     └── images/
|     |
│     ├── components/
│     │     ├── auth/               ← 도메인 UI 컴포넌트
│     │     │     ├── LoginModal.tsx
│     │     │     └── ProtectedRoute.tsx
│     │     ├── discussion/         ← 토론 도메인 모듈
│     │     │     └── IssueCard.tsx
│     │     ├── proposal/         ← 국민 제안 및 토론 도메인 모듈
│     │     │     ├── OpinionItem.tsx
│     │     │     └── ProposalCard.tsx
│     │     ├── layout/
│     │     │     ├── Footer.tsx
│     │     │     ├── Header.tsx
│     │     │     └── MainLayout.tsx
│     │     └── ui/
│     │           ├── Button.tsx
│     │           ├── Card.tsx
│     │           └── Input.tsx
│     |
│     ├── data/
│     │     ├── koreanSocialIssues.json
│     │     └── selectedNews.json
│     |     
│     ├── design/
│     │     └── theme.ts
│     |     
│     ├── docs/
│     │     └── DEVELOPMENT_GUIDE.md
│     |
│     ├── features/
│     │     ├── auth/               ← 비즈니스 로직만
│     │     |     ├── context/
│     │     |     |     └── AuthContext.tsx
│     │     |     ├── hooks/
│     │     |     |     └── useAuth.ts
│     │     |     └── index.ts      (barrel — re-exports components/auth/* 포함)
│     │     ├── discussion/         ← 국민 제안/토론 비즈니스 로직
│     │     │     └── useIssueWithAI.ts
│     │     ├── proposal/         ← 국민 제안/토론 비즈니스 로직
│     │     │     └──  useProposals.ts
│     │     └── news/  
│     │           └── useNewsWithAISummary.ts
│     |
│     ├── lib/
│     │     └── claude.ts
│     |
│     ├── pages/                    ← 라우트 단위 뷰
│     │     ├── Community.tsx
│     │     ├── Detail.tsx
│     │     ├── DiscussionAI.tsx
│     │     ├── DiscussionAIDetail.tsx
│     │     ├── Guide.tsx
│     │     ├── Home.tsx
│     │     ├── Login.tsx
│     │     ├── Profile.tsx
│     │     ├── ProposalCreate.tsx
│     │     ├── ProposalDetail.tsx
│     │     └── ProposalList.tsx
│     |
|     └── services/
│           ├── ai/
│           │    ├── aiCacheDB.ts
│           │    └── claudeService.ts
│           └── db/
│                └── proposalDB.ts
│     |
│     └── utils/
│           └── nicknameGenerator.ts
│ 
├── App.css
├── App.tsx
├── index.css
└── main.tsx

```

---

## ✅ Folder Responsibility Rules

각 폴더는 단일 책임을 가집니다. 경계를 벗어나면 아키텍처 위반입니다.

| 폴더 | 역할 | 포함 O | 포함 X |
|---|---|---|---|
| `features/` | 비즈니스 로직 | Context, hooks, types, service adapters, barrel index | 페이지 레이아웃, 순수 UI 컴포넌트 |
| `components/ui/` | 기본 UI 프리미티브 | Button, Card, Input 등 로직 없는 컴포넌트 | API 호출, Context 정의 |
| `components/layout/` | 구조 쉘 | Header, Footer, MainLayout | 비즈니스 로직 |
| `components/auth/` | 도메인 UI | LoginModal, ProtectedRoute (auth 관련 UI) | Context Provider 정의 |
| `pages/` | 라우트 뷰 | 컴포넌트 조합, 페이지 레이아웃, hook 호출 | 인라인 스타일, 직접 비즈니스 로직 |

### 데이터 흐름
```
features/ (hooks + context)
  ↓
pages/ (레이아웃 조합)
  ↓ 사용 ↓
components/ (UI 렌더링)
```

> **Note:** `features/auth/index.ts`는 barrel로, `components/auth/`의 UI 컴포넌트를
> re-export합니다. 외부에서는 항상 `import { … } from '../features/auth'`로 접근하세요.

---

## ✅ Design System (Maeil Business News CI)

All UI must follow Maeil Economy branding.

### design/theme.ts

```ts
export const tokens = {
  colors: {
    primary: '#F36F21',
    gray: '#58585a',
    dark: '#221e1f',

    background: '#ffffff',
    surface: '#f8f8f8',

    text: {
      primary: '#221e1f',
      secondary: '#58585a',
    },
  },

  radius: {
    sm: '6px',
    md: '10px',
    lg: '16px',
  },

  spacing: {
    sm: '8px',
    md: '16px',
    lg: '24px',
  }
}
```

---

## ✅ News Data Usage

News data is provided as JSON.

```
src/data/selectedNews.json
```

Only manually curated articles should be included.

Example:

```json
[
  {
    "id": 1,
    "title": "Example News",
    "summary": "Short summary",
    "content": "Article content",
    "category": "Politics"
  }
]
```

News must render without backend connection.

---

## ✅ Social Login Strategy

Hackathon prototype rule:

✅ UI + provider redirect only
❌ real authentication validation

Create buttons:

* Google
* Kakao
* Naver

inside:

```
features/auth/
```

---

## ✅ Antigravity Development Rule

Antigravity should:

✅ reuse UI components
✅ follow design/theme.ts
✅ reference stitch visually only
✅ extend via feature modules

Never generate isolated styling.


