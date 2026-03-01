# ✅ Agora-X Frontend Initialization Guide 

```md
# Agora-X Frontend Initialization Guide

This document defines the **initial frontend setup standard**
for the Agora-X hackathon project.

Agora-X is an AI-assisted political discussion platform
built on curated news articles.

⚠️ Deployment is NOT required.
⚠️ Local execution level implementation only.

The goal of this phase is to establish a scalable UI foundation
so that additional pages can be added easily by other developers.

---

## ✅ Current Implementation Scope

This stage implements ONLY:

- Social Login UI
- News Article Rendering
- Navigation Structure
- Design System Foundation

NOT included yet:

- Backend server
- Real authentication validation
- Deployment
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
Discussion Topic Grid
Mock Chat Window for AI argumentation
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
│     ├── logo_dark.png
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
│     │     |        
│     │     └── news/
│     │            └── NewsList.tsx          
│     |
│     ├── lib/
│     │     └── claude.ts
│     |
│     ├── pages/                    ← 라우트 단위 뷰
│     │     ├── Community.tsx
│     │     ├── Detail.tsx
│     │     ├── DiscussionAI.tsx
│     │     ├── Guide.tsx
│     │     ├── Home.tsx
│     │     ├── Login.tsx
│     │     └── Profile.tsx
│     |
|     └── services/
│           └── ai/
│                └── claude.ts
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

Create:

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

---

## ✅ Development Order

1. Apply favicon & logo
2. Configure design/theme.ts
3. Build UI components (Buttons, Cards, Inputs)
4. Implement Contexts (AuthContext for Global Login State & Persistence)
5. Implement Router (with React.lazy)
6. Create Login Page & Modal (Google, Kakao)
7. Build Home Layout styled from code.html
8. Render News from JSON in Community Page
9. Add AI Discussion & Guide routing

---

## ✅ Goal of This Stage

After completion:

✅ Login persistence works
✅ Kakao & Google Initialized
✅ Home renders stunning curated articles interface
✅ Navigation unified
✅ Bundle optimized via Lazy Loading
✅ Design system intact

```

