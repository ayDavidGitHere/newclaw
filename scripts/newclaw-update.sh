#!/bin/bash

set -e

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m"  # No Color

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"
REPO_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
RESTART_SCRIPT="$SCRIPT_DIR/newclaw-restart.sh"

prompt_restart() {
  echo -e "${BLUE} \n\n\n  Prompting to restart NewClaw server... ${NC}"
  read -p "Do you want to restart the NewClaw server now? [y/N]: " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    if [ -f "$RESTART_SCRIPT" ]; then
      bash "$RESTART_SCRIPT"
    else
      echo -e "${RED} Restart script not found: $RESTART_SCRIPT ${NC}"
    fi
  else
    echo "Skipping server restart. You can call 'newclaw restart' to restart the server after updating."
  fi
}

echo -e "${CYAN}"
cat << "EOF"
 _   _                 _____ _               
| \ | |               / ____| |              
|  \| | _____      __| |    | | __ ___      __
| . ` |/ _ \ \ /\ / /| |    | |/ _` \ \ /\ / /
| |\  |  __/\ V  V / | |____| | (_| |\ V  V / 
|_| \_|\___| \_/\_/   \_____|_|\__,_| \_/\_/  
EOF
echo -e "${NC}"

if ! command -v git >/dev/null 2>&1; then
  echo -e "${RED} git is required to update NewClaw ${NC}"
  exit 1
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  echo -e "${RED} This NewClaw installation is not a git checkout: $REPO_DIR ${NC}"
  exit 1
fi

if [ -n "$(git -C "$REPO_DIR" status --porcelain)" ]; then
  echo -e "${RED} Update aborted: uncommitted changes found in $REPO_DIR ${NC}"
  echo -e "${YELLOW} Commit, stash, or discard local changes before running 'newclaw update'. ${NC}"
  exit 1
fi

BRANCH="$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD)"

echo -e "${BLUE} Updating NewClaw in $REPO_DIR on branch $BRANCH ... ${NC}"
git -C "$REPO_DIR" pull --ff-only origin "$BRANCH"

echo -e "${GREEN} Update complete! ${NC}"
prompt_restart
