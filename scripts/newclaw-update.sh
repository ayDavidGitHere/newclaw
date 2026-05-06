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
TMP_GIT_OUTPUT="/tmp/newclaw-update-git.$$"

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

prompt_override_local() {
  echo -e "${YELLOW} Local changes or branch conflicts are preventing an automatic update. ${NC}"
  read -p "Override local changes with the remote version of this branch? [y/N]: " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW} Overriding local checkout with origin/$BRANCH ... ${NC}"
    git -C "$REPO_DIR" fetch origin "$BRANCH" >/dev/null 2>"$TMP_GIT_OUTPUT" || {
      echo -e "${YELLOW} Warning: unable to fetch the latest remote branch. ${NC}"
      rm -f "$TMP_GIT_OUTPUT"
      exit 1
    }
    git -C "$REPO_DIR" reset --hard "origin/$BRANCH" >/dev/null 2>"$TMP_GIT_OUTPUT" || {
      echo -e "${YELLOW} Warning: unable to override the local checkout. ${NC}"
      rm -f "$TMP_GIT_OUTPUT"
      exit 1
    }
    echo -e "${GREEN} Local checkout replaced with origin/$BRANCH ${NC}"
  else
    echo -e "${YELLOW} Update cancelled. Local files were left unchanged. ${NC}"
    rm -f "$TMP_GIT_OUTPUT"
    exit 0
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

if ! command -v npm >/dev/null 2>&1; then
  echo -e "${RED} npm is required to update NewClaw ${NC}"
  exit 1
fi

if [ ! -d "$REPO_DIR/.git" ]; then
  echo -e "${RED} This NewClaw installation is not a git checkout: $REPO_DIR ${NC}"
  exit 1
fi

trap 'rm -f "$TMP_GIT_OUTPUT"' EXIT

BRANCH="$(git -C "$REPO_DIR" rev-parse --abbrev-ref HEAD)"

if [ -n "$(git -C "$REPO_DIR" status --porcelain)" ]; then
  prompt_override_local
fi

echo -e "${BLUE} Updating NewClaw in $REPO_DIR on branch $BRANCH ... ${NC}"
if ! git -C "$REPO_DIR" pull --ff-only origin "$BRANCH" >/dev/null 2>"$TMP_GIT_OUTPUT"; then
  echo -e "${YELLOW} Warning: automatic update could not be completed cleanly. ${NC}"
  prompt_override_local
fi

echo -e "${BLUE} Installing dependencies... ${NC}"
npm install --prefix "$REPO_DIR"

echo -e "${GREEN} Update complete! ${NC}"
prompt_restart
