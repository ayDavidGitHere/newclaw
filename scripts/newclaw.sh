#!/bin/bash

# Colors
RED="\033[0;31m"
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
BLUE="\033[0;34m"
CYAN="\033[0;36m"
NC="\033[0m"  # No Color

# Resolve script directory (works from anywhere)
SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

# Sub-commands
ONBOARD_SCRIPT="$SCRIPT_DIR/newclaw-onboard.sh"
RESTART_SCRIPT="$SCRIPT_DIR/newclaw-restart.sh"

show_help() {
  echo -e "${BLUE} Usage: newclaw <command> ${NC}"
  echo ""
  echo "Commands:"
  echo "  onboard   Run onboarding setup"
  echo "  restart   Restart the service (PM2)"
  echo "  help      Show this help message"
}

# Ensure at least one argument
if [ $# -eq 0 ]; then
  show_help
  exit 1
fi

CMD="$1"

case "$CMD" in
  onboard)
    if [ -f "$ONBOARD_SCRIPT" ]; then
      bash "$ONBOARD_SCRIPT"
    else
      echo -e "${RED} Error: newclaw-onboard.sh not found $SCRIPT_DIR ${NC}"
      exit 1
    fi
    ;;

  restart)
    if [ -f "$RESTART_SCRIPT" ]; then
      bash "$RESTART_SCRIPT"
    else
      echo -e "${RED} Error: newclaw-restart.sh not found ${NC}"
      exit 1
    fi
    ;;

  help|-h|--help)
    show_help
    ;;

  *)
    echo -e "${RED} Unknown command: $CMD ${NC}"
    echo ""
    show_help
    exit 1
    ;;
esac