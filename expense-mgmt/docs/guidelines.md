# Development Guidelines

## General Principles

- Build features step by step with testing
- Follow minimal code principles - keep it simple
- Focus on core functionality
- Maintain clean, readable code structure
- Write clean, readable, maintainable code
- Comment complex logic, but prefer self-documenting code
- Use meaningful variable and function names
- Follow DRY (Don't Repeat Yourself) principle
- Refactor when needed, but don't over-engineer

---

## Tech Stack Standards

- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js App Router best practices
- Validate all inputs with Zod schemas
- Use Drizzle ORM for database operations
- Implement proper file upload restrictions (PDF, PNG, JPEG, HEIC; max 10MB; max 5 files)
- Use centralized error tracking
- Maintain audit trails for all operations
- Follow security best practices

---

## Multi-Tenancy Rules

**CRITICAL**: Every database query MUST include `tenant_id` filtering.

```typescript
// CORRECT - Always filter by tenant_id
const expenses = await db.query.expenses.findMany({
  where: eq(expenses.tenantId, currentUser.tenantId),
});

// INCORRECT - Never query without tenant_id
const expenses = await db.query.expenses.findMany(); // DANGEROUS!
```

---

## Git & Version Control

- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Use conventional commit format:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation
  - `refactor:` - Code refactoring
  - `test:` - Adding tests
  - `chore:` - Maintenance tasks

---

## Environment Configuration

- Use centralized configuration management
- Never commit sensitive data (use environment variables)
- Provide example env files for reference
- Document all required environment variables

---

## Performance

- Optimize database queries
- Implement proper caching where appropriate
- Use Next.js optimization features (Image, Link, etc.)
- Minimize bundle size
- Implement lazy loading where beneficial

---

## When Writing Code

1. **Always validate inputs** - Use Zod schemas
2. **Handle errors gracefully** - Never let errors crash the app
3. **Log important operations** - Use structured logging
4. **Write tests** - Especially for business logic
5. **Follow TypeScript best practices** - Use proper types
6. **Keep components small** - Single responsibility principle
7. **Use environment variables** - Never hardcode config
8. **Document complex logic** - But prefer self-documenting code
9. **Follow Next.js conventions** - App Router patterns
10. **Maintain consistency** - Follow existing code patterns
11. **Update prompt history** - Document all changes in the appropriate milestone-specific prompt history file (`prompts/milestone-{N}.md`)

---

## API Response Format

Use standardized API response format:

```typescript
// Success Response
{
  success: true,
  data: { ... },
  message?: "Optional success message"
}

// Error Response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Human-readable error message"
  }
}
```

---

## File Upload Restrictions

- **Allowed types**: PDF, PNG, JPEG, HEIC
- **Max file size**: 10 MB per file
- **Max files per submission**: 5 files
- Store files in S3 (local folder for development)
- Validate file types on both client and server

---

## Code Review Checklist

- [ ] TypeScript types are properly defined
- [ ] Input validation is implemented (Zod)
- [ ] Error handling is in place
- [ ] Logging is implemented for important operations
- [ ] Tests are written (unit/integration)
- [ ] Security considerations are addressed
- [ ] Performance is considered
- [ ] Code follows project patterns
- [ ] Environment variables are used (no hardcoded values)
- [ ] Documentation is updated if needed
- [ ] Multi-tenancy rules are followed (tenant_id in all queries)
- [ ] Prompt history is updated in the appropriate milestone file

---

## Questions to Ask Before Coding

- Is this the simplest solution?
- Are all edge cases handled?
- Is error handling appropriate?
- Are inputs validated?
- Is logging in place?
- Are tests written?
- Is security considered?
- Does it follow project patterns?
- Is tenant isolation maintained?

---

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes (login)
│   ├── (dashboard)/       # Protected routes
│   │   ├── expenses/      # Expense management
│   │   ├── approvals/     # Approval workflow
│   │   ├── reports/       # Report generation
│   │   └── settings/      # Settings (if needed)
│   ├── api/               # API routes
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # UI Components
│   ├── atoms/            # Basic elements
│   ├── molecules/        # Composite components
│   └── organisms/        # Complex components
├── lib/                   # Utilities
│   ├── db.ts             # Database client
│   ├── auth.ts           # Auth utilities
│   ├── s3.ts             # S3 client
│   └── email.ts          # SES client
├── services/              # Business logic
├── schemas/               # Zod schemas
├── types/                 # TypeScript types
└── middleware.ts          # Auth + tenant middleware
```

