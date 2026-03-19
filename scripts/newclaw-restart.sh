#!/bin/bash

SCRIPT_PATH="$(readlink -f "${BASH_SOURCE[0]}")"
SCRIPT_DIR="$(dirname "$SCRIPT_PATH")"

pm2 stop newclaw
pm2 start "$SCRIPT_DIR/../core/index.js" --name newclaw
pm2 save
pm2 startup

pm2 logs newclaw
