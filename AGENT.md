# 🚨 AGORA-X ARCHITECTURE LOCK

This document defines NON-BREAKABLE architecture rules.

ALL AI agents (Antigravity, Cursor, Claude, Copilot)
MUST follow these rules BEFORE generating code.

---

## ✅ REQUIRED FIRST STEP

Before ANY implementation:

1. Read:
   - src/docs/DEVELOPMENT_GUIDE.md
2. Follow:
   - vercel-react-best-practices skill
3. Respect:
   - Feature-based architecture
   - Design Token system

If rules conflict:
DEVELOPMENT_GUIDE.md is ALWAYS correct.

---

# ✅ ARCHITECTURE RULES (LOCKED)

## ❌ NEVER DO THESE

AI MUST NEVER:

- add inline styles
- hardcode colors
- hardcode spacing
- fetch data inside pages
- place business logic inside UI components
- bypass reusable UI components
- directly style div elements
- duplicate layout structures
- modify tokens locally

---

## ✅ STYLING RULE

ALL styling MUST use:
design/theme.ts


Allowed:

✅ UI component styling  
✅ Tailwind mapped to tokens  
✅ shared component variants

Forbidden:

```tsx
<div style={{ margin: 12 }}>
<div style={{ color: '#F36F21' }}>

---

## ✅ DATA FLOW RULE

Correct flow:

Service
 → Hook
   → Feature Component
     → Page

Example:

newsService.ts
useNews.ts
NewsList.tsx
Home.tsx

Pages are layout ONLY.

---

## ✅ COMPONENT RESPONSIBILITY

### Pages

Routing + Layout only

### Features

Business logic

### UI Components

Pure presentation only

## ✅ DESIGN SYSTEM LOCK

All UI MUST use:
design/theme.ts

Brand colors:

Primary:
#F36F21
Sub:
#58585a
#221e1f

AI MUST NOT redefine colors.

---

## ✅ SKILLS REQUIREMENT

AI MUST actively apply:

@vercel-react-best-practices

@feature-based-architecture

@design-system-enforcement

---

## ✅ WHEN GENERATING CODE

AI MUST:

Reuse existing components first

Check folder responsibility

Prefer composition over duplication

Create hooks for logic

Keep UI declarative

---

## 🚨 ARCHITECTURE PRIORITY

Correct architecture

Fast implementation

Breaking architecture = INVALID OUTPUT