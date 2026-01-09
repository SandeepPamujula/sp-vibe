# Frontend Architecture & Component Design

This document outlines the architectural patterns for the Next.js Frontend.

## 1. Directory Structure (Atomic Design)

```
app/
├── (auth)/             # Authentication Routes
├── (dashboard)/        # Main App Routes (Sidebar layout)
│   ├── expenses/       # Expense management
│   ├── approvals/      # Approval inbox
│   └── settings/       # Admin configurations
components/
├── atoms/              # Base UI elements (Button, Input, Badge)
├── molecules/          # Simple combinations (InputGroup, SearchBar)
├── organisms/          # Complex widgets (ExpenseForm, ExpenseTable)
├── templates/          # Page layouts (if reusable)
└── providers/          # Context Providers (AuthProvider, ThemeProvider)
lib/
├── api/                # API Client / Server Action wrappers
├── hooks/              # Custom React Hooks
└── utils/              # Helper functions
```

## 2. Key Components

### 2.1. Atoms
*   **`Button`**: Variants (Primary, Secondary, Danger, Ghost). Loading state support.
*   **`Input`**: Text, Number, Date inputs with error state styling.
*   **`Badge`**: For Status display (Green=Approved, Yellow=Pending, Red=Rejected).
*   **`Avatar`**: User profile image.

### 2.2. Organisms
*   **`ExpenseForm`**:
    *   Uses `react-hook-form` and `zodResolver`.
    *   Handles file upload manually before form submission (get presigned URL -> upload -> submit form with URL).
*   **`DataTable<T>`**:
    *   Reusable table component with internal pagination and sorting.
    *   Accepts `columns` definition and `data` prop.
*   **`WorkflowEditor`**:
    *   Drag-and-drop or list-based editor for defining workflow steps.
    *   Dynamic addition/removal of steps.

## 3. State Management

### 3.1. Server State (Data Fetching)
*   **Strategy**: Use **Server Components** for initial data fetching where possible.
*   **Client Updates**: Use `useTransition` with Server Actions to mutate data and revalidate paths (`revalidatePath`) to refresh Server Components without full page reloads.
*   *Alternative*: standard `SWR` or `TanStack Query` if real-time polling or complex client-side caching is needed. (Stick to Server Actions + Revalidation for simplicity initially).

### 3.2. UI State
*   **Global**: `SessionProvider` (User Auth), `ToastProvider` (Notifications).
*   **Local**: `useState` for form visibility, modal open/close states.

## 4. Error Handling
*   **Form Errors**: Inline validation messages from `useForm`.
*   **Server Errors**: Toast notifications triggered by parsing standard `ActionResponse` failures.
*   **Crash**: React Error Boundaries (`error.tsx`) for unhandled runtime exceptions.
