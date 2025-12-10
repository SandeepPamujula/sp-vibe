# Common Patterns

## API Response Format
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}
```

## Error Handling Pattern
```typescript
try {
  // operation
} catch (error) {
  logger.error('Operation failed', { error, context });
  return errorResponse('User-friendly message');
}
```

## Validation Pattern
```typescript
const schema = z.object({ /* ... */ });
const validatedData = schema.parse(requestBody);
```
