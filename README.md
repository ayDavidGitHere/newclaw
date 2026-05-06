# INSTALLATION

``` git clone https://github.com/ayDavidGitHere/newclaw.git ``` 

``` cd newclaw ``` 

``` bash ./install.sh ```

``` newclaw help ``` 

``` newclaw onboard ``` 

# UPDATING

To update an existing NewClaw installation:

``` newclaw update ```

This command:

- pulls the latest code from the current git branch using fast-forward only
- prompts you to restart the NewClaw service

Requirements:

- your NewClaw folder must be a git checkout
- the working tree must be clean with no uncommitted changes
- `git` and `npm` must be installed on the machine

If you have local changes, commit, stash, or discard them before running `newclaw update`.

# ONBOARDING

At onboarding, you will provide:

## Config values
`Local server port` maps to `local_server.port`. It is the port this program serves on. You must forward this port so your Nextcloud server can reach it.
Example: forward `127.0.0.1:3000` to `<newclaw-webhook-domain.com>:80`
You can do this in NGINX.

`Nextcloud baseUrl` maps to `nextcloud_talk.baseUrl`. It is the base URL of your Nextcloud instance/server where the bot is installed, e.g. `<my-nextcloud-domain.com>`

`Nextcloud webhookSecret` maps to `nextcloud_talk.webhookSecret`. It is the webhook secret set when installing the bot in Nextcloud. You can also find it in the config file if you have already onboarded once.

`Nextcloud webhookPath` maps to `nextcloud_talk.webhookPath`. It is the path part of the webhook URL, e.g. `/nextcloud-talk`, so the full webhook URL would be `<newclaw-webhook-domain.com>/nextcloud-talk`

`Nextcloud conversationToken` maps to `nextcloud_talk.conversationToken`. It exists in the JSON config but is not currently prompted during onboarding.

`Select AI provider` sets `main_ai_provider.name`. The available options are `openclawcli`, `ollamacloud`, and `openaicloud`. Select by typing the prompted option number. 1, 2, or 3.

If you choose `openclawcli`, you must have OpenClaw CLI installed and configured on the same machine.
You must also set `OpenClaw agent name`.

`OpenClaw agent name` maps to `main_ai_provider.openclawCliAgentName`. It is usually `main`. Check `openclaw agents list` to confirm the agent name you want to use.

`AI apiUrl` maps to `main_ai_provider.apiUrl`.

`AI apiKey` maps to `main_ai_provider.apiKey`.

`AI model` maps to `main_ai_provider.modelName`.

`AI apiUrl`, `AI apiKey`, and `AI model` are only prompted when the selected AI provider is not `openclawcli`.

## Note: 
You can change any of these configs later by editing the config file directly or running `newclaw onboard` again.

config file is located at `~/.newclaw/data/config.json`

after changes in config file, restart the program `newclaw restart`.

# CREATING NEXTCLOUD BOT 

Run this on nextcloud your installation/server  
```cd /var/www/nextcloud```  

List existing bots:  
```php occ talk:bot:list```  

Create bot and get the webhook secret:  
```php occ talk:bot:install <bot-name> <40-or-more-char-webhook-secret> <newclaw-webhook-domain.com>/<newclaw-webhook-path> <description>```  

Example:  
```php occ talk:bot:install newclaw-agent "XNn4-54581-b125b9-8m2v2-45n-67M-BYc279-d0f25" http://newclaw-webhook-domain.com/nextcloud-talk "bot for newclaw agent"```  

List bots again to get the `bot-id`:  
```php occ talk:bot:list```  

Add bot to a nextcloud room :  
```php occ talk:bot:setup <bot-id> <conversation-token>```  
`conversation-token` typically can be obtained from the last part of the URL when you open the nextcloud talk room in browser, e.g. if the URL is `https://my-nextcloud-domain.com/chat/abcdefg`, then the conversation token is `abcdefg`.



# CRON JOB SUPPORT

Latest version of openclaw demands approval to run cron jobs / reminders in the cli (This programs depends on openclaw cli). To create a one-time approval for cron jobs. Run these in the cli:  

### Set openclaw approvals to allow cron jobs
```
openclaw approvals set --gateway --stdin <<'EOF'
{
  "version": 1,
  "defaults": {
    "security": "full",
    "ask": "off",
    "askFallback": "full"
  }
}
EOF
```

### List devices and get the device_id
```
openclaw devices list
```

### Approve the device using the device_id
```
openclaw devices approve <device_id>
```
