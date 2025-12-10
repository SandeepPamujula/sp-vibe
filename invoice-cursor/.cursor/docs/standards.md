# Code Standards

## TypeScript
- Use strict TypeScript configuration
- Define interfaces for all data models (User, Invoice, Response, InvoiceHistoryEntry)
- Organize types in separate files: `src/types/user.ts`, `src/types/invoice.ts`, `src/types/invoice-history.ts`, `src/types/response.ts`
- Use barrel export via `src/types/index.ts` for convenient imports
- Example imports:
  ```typescript
  // From barrel export
  import { User, Invoice, InvoiceHistoryEntry, InvoiceHistoryEntryType, ApiResponse } from '@/types';
  
  // Direct imports (better for tree-shaking)
  import { User, UserRole } from '@/types/user';
  import { Invoice, InvoiceStatus } from '@/types/invoice';
  import { InvoiceHistoryEntry, InvoiceHistoryEntryType } from '@/types/invoice-history';
  ```
- Avoid `any` types - use proper typing
- Use type inference where appropriate

## API Development
- All API endpoints must:
  - Validate input using Zod schemas
  - Return standardized response format
  - Include proper error handling
  - Log requests/responses using Winston wrapper
  - Implement CORS and rate limiting
- Use custom Axios wrapper with interceptors for HTTP calls
- Use custom DynamoDB client wrapper for database operations

## Component Development
- Use functional components with TypeScript
- Implement proper prop types/interfaces
- Follow React best practices (hooks, memoization where needed)
- Create Storybook stories for all reusable components
- Ensure accessibility (a11y) compliance

## File Organization
- Group related files together
- Use index files for clean imports
- Keep components small and focused
- Separate concerns (UI, logic, data)

## Error Handling
- Use try-catch blocks for async operations
- Implement proper error logging with Winston
- Return user-friendly error messages
- Use Sentry for production error tracking
- Never expose sensitive information in errors

## Security
- Validate all user inputs
- Implement file upload restrictions (allowed types: PDF, PNG, JPEG, HEIC; max size: 10 MB per file; max 5 files per submission)
- Use environment variables for sensitive data
- Implement proper authentication/authorization
- Sanitize data before database operations
- Follow OWASP security best practices

## Testing
- Write unit tests for all business logic
- Write integration tests for API endpoints
- Create Storybook stories for UI components
- Aim for good test coverage
- Use descriptive test names

## Database
- Use DynamoDB best practices (partition keys, sort keys)
- Implement proper indexing for queries
- Handle pagination correctly
- Maintain unified audit trail via InvoiceHistoryEntry history array
  - Track all state transitions (CREATED, SUBMITTED, APPROVED, REJECTED, RESUBMITTED)
  - Track field updates, file additions/removals via UPDATED, FILES_ADDED, FILES_REMOVED entry types
  - Include comments (COMMENT entry type) in same chronological timeline
  - Record who performed each action (createdBy, createdByRole), when (createdAt)
  - State transitions derived from entryType and chronological order (fromStatus/toStatus not stored)
  - All transactional data (submittedBy, approvedBy, rejectionReason, timestamps) derived from history
- Use transactions where appropriate

## Email Notifications
- Use Amazon SES for all email operations
- Implement proper email templates
- Handle email failures gracefully
- Log all email operations
