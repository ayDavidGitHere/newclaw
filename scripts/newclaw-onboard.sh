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

CONFIG_FILE="$SCRIPT_DIR/../data/config.json"

# Create or edit config interactively
create_config() {
  echo -e "${BLUE} \n\n\n  === This is your NewClaw Configuration Setup === ${NC}"
  echo -e "${YELLOW} CONFIG_FILE: $CONFIG_FILE === ${NC}"

  mkdir -p "$(dirname "$CONFIG_FILE")"

  # Defaults (fallbacks)
  LOCAL_PORT="3000"
  NC_BASEURL=""
  NC_TOKEN=""
  NC_SECRET=""
  NC_PATH="/nextcloud-talk"
  AI_URL=""
  AI_KEY=""
  AI_MODEL=""
  AI_NAME=""
  AI_OPENCLAW_CLI_AGENT_NAME="main"

  # Load existing config if present
  if [ -f "$CONFIG_FILE" ]; then
    echo "Loading existing config..."

    if command -v jq >/dev/null 2>&1; then
      LOCAL_PORT=$(jq -r '.local_server.port // "3000"' "$CONFIG_FILE")
      NC_BASEURL=$(jq -r '.nextcloud_talk.baseUrl // ""' "$CONFIG_FILE")
      NC_TOKEN=$(jq -r '.nextcloud_talk.conversationToken // ""' "$CONFIG_FILE")
      NC_SECRET=$(jq -r '.nextcloud_talk.webhookSecret // ""' "$CONFIG_FILE")
      NC_PATH=$(jq -r '.nextcloud_talk.webhookPath // "/nextcloud-talk"' "$CONFIG_FILE")
      AI_NAME=$(jq -r '.main_ai_provider.name // "openai"' "$CONFIG_FILE")
      AI_OPENCLAW_CLI_AGENT_NAME=$(jq -r '.main_ai_provider.openclawCliAgentName // "main"' "$CONFIG_FILE")
      AI_URL=$(jq -r '.main_ai_provider.apiUrl // "https://api.openai.com/v1"' "$CONFIG_FILE")
      AI_KEY=$(jq -r '.main_ai_provider.apiKey // ""' "$CONFIG_FILE")
      AI_MODEL=$(jq -r '.main_ai_provider.modelName // "gpt-4.1-mini"' "$CONFIG_FILE")
    else
      echo "Warning: jq not installed, skipping config preload"
    fi
  fi

  # ----------------------
  # Prompts with defaults
  # ----------------------

  read -p "Local server port [$LOCAL_PORT]: " input
  LOCAL_PORT="${input:-$LOCAL_PORT}"

  read -p "Nextcloud baseUrl [$NC_BASEURL]: " input
  NC_BASEURL="${input:-$NC_BASEURL}"

  # read -p "Nextcloud conversationToken [$NC_TOKEN]: " input
  # NC_TOKEN="${input:-$NC_TOKEN}"

  read -s -p "Nextcloud webhookSecret [hidden]: " input
  echo
  NC_SECRET="${input:-$NC_SECRET}"

  read -p "Nextcloud webhookPath [$NC_PATH]: " input
  NC_PATH="${input:-$NC_PATH}"

  # Prompt for provider
  echo "Select AI provider (current: $AI_NAME):"

  options=("openclawcli" "ollamacloud" "openaicloud")

  select opt in "${options[@]}"; do
    if [ -n "$opt" ]; then
        AI_NAME="$opt"
        break
    elif [ -z "$REPLY" ]; then
        # user just pressed ENTER → keep existing
        echo "Keeping current: $AI_NAME"
        break
    else
        echo "Invalid option"
    fi
  done

  if [ "$AI_NAME" = "openclawcli" ]; then
    echo -e "${YELLOW} Be sure OpenClaw CLI is installed and configured on this machine${NC}"

    read -p "OpenClaw agent name [$AI_OPENCLAW_CLI_AGENT_NAME]: " input
    AI_OPENCLAW_CLI_AGENT_NAME="${input:-$AI_OPENCLAW_CLI_AGENT_NAME}"

  else
    read -p "AI apiUrl [$AI_URL]: " input
    AI_URL="${input:-$AI_URL}"

    read -s -p "AI apiKey [hidden]: " input
    echo
    AI_KEY="${input:-$AI_KEY}"

    read -p "AI model [$AI_MODEL]: " input
    AI_MODEL="${input:-$AI_MODEL}"
  fi


  # Build JSON config
  CONFIG=$(jq -n \
    --arg lp "$LOCAL_PORT" \
    --arg ncb "$NC_BASEURL" \
    --arg nct "$NC_TOKEN" \
    --arg ncs "$NC_SECRET" \
    --arg ncp "$NC_PATH" \
    --arg aname "$AI_NAME" \
    --arg aopenclawcliagentname "$AI_OPENCLAW_CLI_AGENT_NAME" \
    --arg aurl "$AI_URL" \
    --arg akey "$AI_KEY" \
    --arg amodel "$AI_MODEL" \
    '{
      local_server: { port: $lp },
      nextcloud_talk: {
        baseUrl: $ncb,
        conversationToken: $nct,
        webhookSecret: $ncs,
        webhookPath: $ncp
      },
      main_ai_provider: {
        apiUrl: $aurl,
        apiKey: $akey,
        modelName: $amodel,
        name: $aname,
        openclawCliAgentName: $aopenclawcliagentname
      }
    }'
  )

  echo -e "${GREEN} \n\n\n  Configuration complete! ${NC}"
  echo "$CONFIG" | tee "$CONFIG_FILE"
  echo "Config saved to $CONFIG_FILE"
}

# Install global dependencies
install_dependencies() {
  echo -e "${BLUE} \n\n\n Installing global dependencies... ${NC}"
  npm install -g pm2
  npm install
  echo -e "${GREEN} Dependencies installed! ${NC}"
}

# ----------------------
# Prompt to restart server
# ----------------------
prompt_restart() {
  read -p " \n\n\n Do you want to restart the NewClaw server now? [y/N]: " REPLY
  if [[ "$REPLY" =~ ^[Yy]$ ]]; then
    RESTART_SCRIPT="$SCRIPT_DIR/newclaw-restart.sh"
    if [ -f "$RESTART_SCRIPT" ]; then
      bash "$RESTART_SCRIPT"
    else
      echo "Restart script not found: $RESTART_SCRIPT"
    fi
  else
    echo "Skipping server restart."
  fi
}


# Main
echo -e "${BLUE} Starting NewClaw Onboarding... ${NC}"
create_config
install_dependencies
prompt_restart
echo -e "${GREEN} \n\n\n  Onboarding complete! ${NC}"
echo -e "${YELLOW} Remember to expose 127.0.0.1:${LOCAL_PORT}/${NC_PATH} to be reachable externally. Use a reverse proxy (NGINX, Caddy ...) ${NC}"