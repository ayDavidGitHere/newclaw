const configHandler = require("./config.handler.js");
configHandler.initConfig();
const config = configHandler.getConfig();

const nextcloudTalkHandler = require("./nextcloud-talk.handler.js");


async function sendToRoom(conversation_token, message) {
    await nextcloudTalkHandler.sendFromBotToRoom(
        config.nextcloud_talk.baseUrl,
        config.nextcloud_talk.webhookSecret,
        conversation_token,
        message,
    );
}

try {
    // node ~/core/cli.js send-to-room ${conversation_token} <message>"
    const args = process.argv.slice(2);
    if (args.length >= 2 && args[0] === "send-to-room") {
        console.log("CLI send-to-room args:", args);
        const conversation_token = args[1];
        const message = args.slice(2).join(" ");
        sendToRoom(conversation_token, message)
            .then(() => {
                console.log("Cli Message sent to room successfully");
                process.exit(0);
            })
            .catch(err => {
                console.error("Cli Error sending message to room:", err);
                process.exit(1);
            });
    }   
} catch (err) {
    console.error("Error in CLI:", err);
    process.exit(1);
}