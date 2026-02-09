#!/bin/bash
# Auto-format files after Claude edits them
# Receives JSON on stdin with tool_input.file_path

FILE_PATH=$(cat | jq -r '.tool_input.file_path // .tool_input.filePath // empty' 2>/dev/null)

if [ -z "$FILE_PATH" ] || [ ! -f "$FILE_PATH" ]; then
  exit 0
fi

# Only format supported file types
case "$FILE_PATH" in
  *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.md)
    cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
    npx prettier --write "$FILE_PATH" 2>/dev/null || true
    ;;
esac

exit 0
