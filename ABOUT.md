# Current TODO/Problems

# Problem 1:
Program has no way to deliver cron/reminders to chat other than adding custom instructions to openclaw model. This is not ideal but it is the best solution at the moment.

In solution has 2 fixes, 
Fix 1: Tells model to call newclaw node script but this can fail if appropriate eexec permissions are not set or model refuses or does not trust exec permission.
Fix 2: Tells model to use existing openclaw nextcloud plugin to deliver messages. This can fail if openclaw nextcloud plugin has not been configured or openclaw updates its nextcloud plugin with breaking errors/changes.


Summary:
- This newclaw version uses Fix 2 but keeps Fix 1 in case of a decision to switch to that in the future. 
- Fix 2 requires that openclaw nextcloud plugin must be installed and enabled.


# Changes on test machine  

- I ran "newclaw onboard" and "newclaw restart" to recheck valid configs.
- I enabled openclaw nextcloud-talk plugin with random credentials (credentials from here do not matter for newclaw delivery). To see why I had to enable this nextcloud-talk plugin, please check newclaw ABOUT.md at ("https://github.com/ayDavidGitHere/newclaw/blob/main/ABOUT.md")
- I updated newclaw (latest update contain better instructions for onboarding configs at 'newclaw onboard')