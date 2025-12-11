# Git Hooks

This directory contains git hooks for the invoice-cursor project.

## Pre-commit Hook

The `pre-commit` hook checks if prompt history was updated when code files are modified.

### What It Does

- ✅ Detects when code files in `invoice-cursor/` are staged for commit
- ✅ Checks if prompt history files were also updated
- ⚠️ Warns (but doesn't block) if code changed without prompt history update
- 📝 Provides helpful reminders about which files to update

### Installation

Hooks are automatically installed when you run:

```bash
npm install
```

Or manually:

```bash
npm run install-hooks
```

### How It Works

1. When you commit, the hook runs automatically
2. It checks if any files in `invoice-cursor/` were changed
3. If code files changed but prompt history didn't, it shows a warning
4. You can choose to continue or abort the commit

### Bypassing

If you need to bypass the hook (not recommended):

```bash
git commit --no-verify
```

**Note**: You should still update the prompt history manually afterward.

## Files

- `pre-commit` - The pre-commit hook script
- `README.md` - This file

