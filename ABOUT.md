# Current TODO/Problems

# Problem 1:
Program has no way to deliver cron/reminders to chat other than adding custom instructions to openclaw model. This is not ideal but it is the best solution at the moment.

A hybrid delivery mechanism was added through prompt injection. When the model determines a reminder, cron, or delayed/background response is needed, it is instructed to:

First attempt delivery using the OpenClaw Nextcloud plugin via injected conversation credentials (conversation-token, webhook-secret, base-url).
If plugin delivery fails, fallback to a local Node.js CLI command:
node <clijs_dir>/cli.js send-to-room <conversation_token> '<message>'
Log any delivery failure details into:
../data/openclaw-resp-error.log
If both delivery methods fail, immediately respond normally in-chat and mention the delivery failure.

This creates a best-effort asynchronous delivery system without requiring native cron/reminder support inside the core program.