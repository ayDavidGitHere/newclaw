# INSTALLATION

``` git clone https://github.com/ayDavidGitHere/newclaw.git ``` 

``` cd newclaw ``` 

``` bash ./install.sh ```

``` bash newclaw help ``` 

``` bash newclaw onboard ``` 

# ONBOARDING

At onboarding, you will provide:

`LOCAL_PORT` is the port which this program serves on. You must forward this port to be reachable from the internet (your nextcloud server).
Example: forward 127.0.0.1:3000 to <my-webhook-domain.com>:80
You can do this in NGINX.

`Nextcloud BASEURL` is the base URL of your nextcloud instance/server where bot is installed, e.g. <my-nextcloud-domain.com>

`Nextcloud SECRET` is the webhook secret (set when installing the bot in nextcloud). You can also find it in the config file if you have already onboarded once.

`Nextcloud PATH` is the path part of the webhook URL, e.g. /nextcloud-talk, so the full webhook URL (set when installing the bot in nextcloud server) would be <my-webhook-domain.com>/nextcloud-talk

`AI URL, AI KEY, AI MODEL` are the API URL, key and model for the main AI provider you want to use. 

`AI NAME` availabe options are "openclawcli", "ollamacloud" and "openaicloud". 

If you choose "openclawcli", you must have OpenClaw CLI installed and configured on the same machine.
You must also set the AI OPENCLAW_CLI_AGENT_NAME.

`AI OPENCLAW_CLI_AGENT_NAME` is usually "main", check `openclaw agents list` to confirm the agent name you want to use.

You can change any of these configs later by editing the config file directly or running `newclaw onboard` again.

config file is located at `~/.newclaw/data/config.json`

after changes in config file, restart the program `newclaw restart`.

# CREATING NEXTCLOUD BOT 
Run this on nextcloud installation  

```cd /var/www/nextcloud```  
```php occ talk:bot:list```  
```php occ talk:bot:install <agent-name> <40-or-more-char-webhook-secret> <my-webhook-domain.com>/<my-webhook-path> <description>```  
Example:  
```php occ talk:bot:install newclaw-agent "XNn4-54581-b125b9-8m2v2-45n-67M-BYc279-d0f25" http://my-webhook-domain.com/nextcloud-talk "bot for newclaw agent"```  

