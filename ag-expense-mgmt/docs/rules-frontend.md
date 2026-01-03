# Frontend Rules

# Frontend Rules

## Tech Stack
- **Framework**: Next.js (App Router).
- **Language**: TypeScript.
- **Styling**: TailwindCSS.
- **State Management**: React Context / Hooks.
- **Validation**: Zod (Client-side form validation).
- **Testing**: Jest, React Testing Library, Storybook.

## Guidelines
1.  **Component Structure (Atomic Design)**:
    - `components/atoms`: Basic building blocks (Buttons, Inputs, Labels).
    - `components/molecules`: Simple groups of UI elements (InputGroup, SearchBar).
    - `components/organisms`: Complex UI sections (Header, ExpenseForm).
    - `components/templates`: Page layouts.
    - `app/`: Pages (Next.js App Router).
    - Use Server Components by default; add `"use client"` only when interactivity is needed.
2.  **Validation**:
    - Use `react-hook-form` + `zod` resolver.
    - Share Zod schemas with backend types if possible.
3.  **Authentication**:
    - Implement Protected Routes / Middleware in Next.js.
4.  **Multi-tenancy**:
    - Extract tenant info from Host header or User Session.
