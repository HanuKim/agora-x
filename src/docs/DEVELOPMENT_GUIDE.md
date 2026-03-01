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
│     │     ├── layout/
│     │     │     ├── BottomNavigation.tsx
│     │     │     ├── Header.tsx
│     │     │     └── MainLayout.tsx
│     │     │
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
|     |
│     ├── features/
│     │     ├── auth/
│     │     |     ├── components/
│     │     |     |     ├── LoginModal.tsx
│     │     |     |     └── ProtectedRoute.tsx
│     │     |     ├── context/
│     │     |     |     └── AuthContext.tsx
│     │     |     ├── hooks/
│     │     |     |     └── useAuth.ts
│     │     |     ├── index.ts
│     │     |     └── SocialLogin.tsx
│     │     |        
│     │     |      
│     │     └── news/
│     │            └── NewsList.tsx          
│     |
│     ├── lib/
│     │     └── claude.ts
│     |
│     ├── pages/
│     │     ├── Community.tsx
│     │     ├── Detail.tsx
│     │     ├── DiscussionAI.tsx
│     │     ├── Guide.tsx
│     │     ├── Home.tsx
│     │     └── Login.tsx
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

