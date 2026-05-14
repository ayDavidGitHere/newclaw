#!/bin/bash

set -e

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m"  # No Color

# Name of the command 
CMD_NAME="newclaw"

# Path to actual script
SCRIPT_PATH="$(cd "$(dirname "$0")" && pwd)/scripts/newclaw.sh"

# Target location
if [ -d "/opt/homebrew/bin" ]; then
  TARGET="/opt/homebrew/bin/$CMD_NAME"
else
  TARGET="/usr/local/bin/$CMD_NAME"
fi

echo -e "${BLUE} Installing $CMD_NAME..."

# Make sure script is executable
chmod +x "$SCRIPT_PATH"

# Create symlink
sudo ln -sf "$SCRIPT_PATH" "$TARGET"

echo -e "${GREEN} Installed! You can now run: ${NC}"
echo "  $CMD_NAME"