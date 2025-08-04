#!/bin/bash

# Post-edit hook for Claude Code
# This hook runs prettier on all modified files after Claude finishes editing

set -e

# Get list of modified files that prettier can format (both staged and unstaged)
FILES=$(git diff --name-only HEAD | grep -E '\.(js|jsx|ts|tsx|json|css|scss|md|html)$' || true)

if [ -n "$FILES" ]; then
    echo "Running prettier on modified files..."
    npx prettier --write $FILES
    
    # No need to stage files - just format them
    
    echo "Prettier formatting complete."
else
    echo "No files to format with prettier."
fi

# Run npm run check to fix lint errors
echo "Running npm run check..."
npm run check