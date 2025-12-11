#!/bin/bash
#
# Install git hooks from .githooks directory
#
# This script sets up git hooks by copying files from .githooks/ to .git/hooks/
# It ensures the hooks are executable and properly configured.

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

# Find git root directory (could be in parent directories)
GIT_ROOT=$(cd "$PROJECT_ROOT" && git rev-parse --show-toplevel 2>/dev/null)

if [ -z "$GIT_ROOT" ]; then
  echo -e "${YELLOW}Warning: Not in a git repository. Skipping hook installation.${NC}"
  exit 0
fi

GITHOOKS_DIR="$PROJECT_ROOT/.githooks"
GIT_HOOKS_DIR="$GIT_ROOT/.git/hooks"

echo -e "${GREEN}Installing git hooks...${NC}"
echo -e "  Git root: ${GIT_ROOT}"
echo -e "  Hooks source: ${GITHOOKS_DIR}"
echo -e "  Hooks target: ${GIT_HOOKS_DIR}"

# Create .git/hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Copy hooks from .githooks to .git/hooks
if [ -d "$GITHOOKS_DIR" ]; then
  for hook in "$GITHOOKS_DIR"/*; do
    if [ -f "$hook" ]; then
      hook_name=$(basename "$hook")
      target_hook="$GIT_HOOKS_DIR/$hook_name"
      
      echo -e "  Installing ${GREEN}$hook_name${NC}..."
      cp "$hook" "$target_hook"
      chmod +x "$target_hook"
    fi
  done
  echo -e "${GREEN}✓ Git hooks installed successfully!${NC}"
else
  echo -e "${YELLOW}Warning: .githooks directory not found.${NC}"
  exit 1
fi

