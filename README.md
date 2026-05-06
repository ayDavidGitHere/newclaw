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

`LOCAL_PORT` is the port which this program serves on. You must forward this port to be reachable from the internet. So that your nextcloud server can reach it.
Example: forward `127.0.0.1:3000` to `<my-webhook-domain.com>:80`
You can do this in NGINX.

`Nextcloud BASEURL` is the base URL of your nextcloud instance/server where bot is installed, e.g. `<my-nextcloud-domain.com>`

`Nextcloud SECRET` is the webhook secret (set when installing the bot in nextcloud). You can also find it in the config file if you have already onboarded once.

`Nextcloud PATH` is the path part of the webhook URL, e.g. `/nextcloud-talk`, so the full webhook URL (set when installing the bot in nextcloud server) would be `<my-webhook-domain.com>/nextcloud-talk`

`AI URL, AI KEY, AI MODEL` are the API URL, key and model for the main AI provider you want to use. You do not need this if you choose "openclawcli" as `AI NAME`

`AI NAME` availabe options are "openclawcli", "ollamacloud" and "openaicloud". 

If you choose "openclawcli", you must have OpenClaw CLI installed and configured on the same machine.
You must also set the `AI OPENCLAW_CLI_AGENT_NAME`.

`AI OPENCLAW_CLI_AGENT_NAME` is usually "main", check `openclaw agents list` to confirm the agent name you want to use.

You can change any of these configs later by editing the config file directly or running `newclaw onboard` again.

config file is located at `~/.newclaw/data/config.json`

after changes in config file, restart the program `newclaw restart`.

# CREATING NEXTCLOUD BOT 

Run this on nextcloud your installation/server  
```cd /var/www/nextcloud```  

List existing bots:  
```php occ talk:bot:list```  

Create bot and get the webhook secret:  
```php occ talk:bot:install <bot-name> <40-or-more-char-webhook-secret> <my-webhook-domain.com>/<my-webhook-path> <description>```  

Example:  
```php occ talk:bot:install newclaw-agent "XNn4-54581-b125b9-8m2v2-45n-67M-BYc279-d0f25" http://my-webhook-domain.com/nextcloud-talk "bot for newclaw agent"```  

List bots again to get the `bot-id`:  
```php occ talk:bot:list```  

Add bot to a nextcloud room :  
```php occ talk:bot:setup <bot-id> <conversation-token>```  
`conversation-token` typically can be obtained from the last part of the URL when you open the nextcloud talk room in browser, e.g. if the URL is `https://my-nextcloud-domain.com/chat/abcdefg`, then the conversation token is `abcdefg`.



# CRON JOB SUPPORT

Latest version of openclaw demands approval to run cron jobs / reminders in the cli (This programs demands on openclaw cli). To create a one-time approval for cron jobs. Run these in the cli:  

```
# Set openclaw approvals to allow cron jobs
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

# List devices and get the device_id
openclaw devices list

# Approve the device using the device_id
openclaw devices approve <device_id>
```
