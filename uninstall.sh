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
FOLDER_PATH="$(cd "$(dirname "$0")" && pwd)/"

# Target location
TARGET="/usr/local/bin/$CMD_NAME"

echo -e "${BLUE} Uninstalling $CMD_NAME..."

# Remove symlink
sudo rm -f "$TARGET"

sudo rm -rf "$FOLDER_PATH"

echo -e "${GREEN} Uninstalled! ${NC}"