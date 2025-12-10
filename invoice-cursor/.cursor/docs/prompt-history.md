# Prompt History Documentation

**CRITICAL**: After completing each prompt/request, you MUST update the appropriate milestone-specific prompt history file to document the work done.

## Prompt History File Structure

Prompt history is organized by milestone for better readability:
- **Main Index**: `prompts-history.md` - Overview and links to milestone-specific files
- **Milestone Files**: `prompts-history-milestone-N.md` - Detailed prompts for each milestone (e.g., `prompts-history-milestone-1.md`)

**File Organization**:
- Each milestone has its own dedicated file: `prompts-history-milestone-{N}.md`
- The main `prompts-history.md` serves as an index linking to all milestone files
- Prompt numbers are sequential across all milestones
- When starting a new milestone, create a new `prompts-history-milestone-{N}.md` file

## Prompt History Update Requirements

1. **Always update the appropriate milestone file** after completing any task or prompt execution
   - Determine which milestone the prompt belongs to based on the task number
   - Update the corresponding `prompts-history-milestone-{N}.md` file
   - If starting a new milestone, create the new milestone file and update the index
2. **Format for each prompt entry**:
   ```markdown
   #### Prompt N: "user prompt text"
   **Date**: [YYYY-MM-DD HH:MM:SS] - [Context when prompt was executed]
   **Goal**: [Brief description of what the prompt aimed to achieve]
   
   **Implementation**:
   - [List of changes made]
   - [Files created/modified]
   - [Key decisions made]
   - [Any relevant notes]
   ```
   
   **Date format**: Use ISO 8601 format: `YYYY-MM-DD HH:MM:SS` (e.g., `2024-12-10 11:30:00`) followed by context

3. **Organize by task/milestone**: 
   - Group prompts under their respective tasks within the milestone file (e.g., Task 1.8, Task 1.9)
   - Each milestone file should contain all tasks and prompts for that milestone
   - Use the format: `### Task X.Y: [Task Name]` for task sections
4. **Include all relevant details**:
   - Files created or modified
   - Dependencies added
   - Configuration changes
   - Design decisions
   - Any issues encountered and how they were resolved
5. **Update task status**: Update the Summary section at the end of the milestone file to reflect completed tasks
6. **Increment prompt numbers**: Use the next sequential prompt number across all milestones
7. **Add date/time and context**: Include actual date/time in ISO 8601 format (YYYY-MM-DD HH:MM:SS) followed by context (e.g., "2024-12-10 11:30:00 - Moving to Task 1.9", "2024-12-10 14:15:00 - During Task 1.8 refinement")
8. **Update index file**: When creating a new milestone file, add a link to it in the main `prompts-history.md` index file

## Example Prompt History Entry

```markdown
### Task 1.9: Configure environment variables and centralized config

#### Prompt 16: "implement task 1.9"
**Date**: 2024-12-10 11:30:00 - Moving to Task 1.9
**Goal**: Set up centralized configuration management with environment variable validation

**Implementation**:
- Created `src/lib/config.ts` with Zod-based environment variable validation
- Implemented type-safe configuration object with all AWS, DynamoDB, S3, SES, Sentry settings
- Created `.env.example` file with comprehensive documentation
- Exported config from `src/lib/index.ts`
- Updated `.cursorrules` to mark Task 1.9 as completed
- Added production configuration validation with warnings
```

**Note**: This entry would be in `prompts-history-milestone-1.md` since Task 1.9 belongs to Milestone 1.

## When to Update Prompt History

- ✅ After completing a task implementation
- ✅ After making significant code changes
- ✅ After updating documentation
- ✅ After resolving issues or bugs
- ✅ After making design decisions
- ✅ When moving to a new task
- ✅ After any prompt that results in code changes

**Note**: If you forget to update the prompt history, add it as a follow-up action before considering the task complete.
