# Development Guidelines

## General
- Build features step by step with testing
- Follow minimal code principles - keep it simple
- Focus on core functionality
- Maintain clean, readable code structure
- Write clean, readable, maintainable code
- Comment complex logic, but prefer self-documenting code
- Use meaningful variable and function names
- Follow DRY (Don't Repeat Yourself) principle
- Refactor when needed, but don't over-engineer
- Use TypeScript for type safety
- Implement proper error handling
- Follow Next.js best practices
- Validate all inputs with Zod schemas
- Implement proper file upload restrictions (allowed types: PDF, PNG, JPEG, HEIC; max size: 10 MB per file; max 5 files per submission)
- Use centralized error tracking
- Maintain audit trails for all operations
- Follow security best practices

## Git & Version Control
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Use conventional commit format when possible

## Environment Configuration
- Use centralized configuration management
- Never commit sensitive data (use environment variables)
- Provide example env files for reference
- Document all required environment variables

## Performance
- Optimize database queries
- Implement proper caching where appropriate
- Use Next.js optimization features (Image, Link, etc.)
- Minimize bundle size
- Implement lazy loading where beneficial

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
11. **Update prompt history** - Document all changes in the appropriate milestone-specific prompt history file (`prompts-history-milestone-{N}.md`) after each prompt execution

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
- [ ] Prompt history is updated in the appropriate milestone file (`prompts-history-milestone-{N}.md`)

## Questions to Ask

- Is this the simplest solution?
- Are all edge cases handled?
- Is error handling appropriate?
- Are inputs validated?
- Is logging in place?
- Are tests written?
- Is security considered?
- Does it follow project patterns?
