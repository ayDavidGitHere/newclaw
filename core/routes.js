const express = require("express");

const app = express();

const configHandler = require("./config.handler.js");
const config = configHandler.getConfig();

const logHandler = require("./log.handler.js");
const nextcloudTalkHandler = require("./nextcloud-talk.handler.js");
const aitoolHandler = require("./aitool.handler.js");




// routes
async function handleNextcloudTalkWebhook(req, res, next) {
    try {
        console.log("/nextcloud-talk hit");

        let parseWebhookPayload = nextcloudTalkHandler.parseWebhookPayload;
        let verifySignature = nextcloudTalkHandler.verifySignature;

        if (!config.nextcloud_talk) {
            return res.status(404).json({ error: "Nextcloud Talk not configured" });
        }
    
        let bodyStr;
        if (req.rawBody) {
            bodyStr = req.rawBody.toString('utf-8');
        } else {
            bodyStr = JSON.stringify(req.body);
        }

        // ---- Security check ----
        if (config.nextcloud_talk.webhookSecret) {
            const random = req.header("X-Nextcloud-Talk-Random") || "";
            const signature = req.header("X-Nextcloud-Talk-Signature") || "";

            if (!verifySignature(config.nextcloud_talk.webhookSecret, random, bodyStr, signature)) {
                console.warn("Invalid signature", { secret: config.nextcloud_talk.webhookSecret, random, signature });
                return res.status(401).json({ error: "Invalid signature" });
            }
        }

        // ---- Parse payload ----
        const payload = req.body;
        const messages = parseWebhookPayload(payload);
        console.log("/nextxloud-talk messages ", messages.length)

        if (!messages.length) {
            return res.json({ status: "ok" });
        }

        // ---- Process messages ----
        for (const msg of messages) {
            console.log(`Message from ${msg.sender}: ${msg.content}`);

            if (aitoolHandler.autoSave) {
                await aitoolHandler.storeMemory(`mem:${msg.sender}`, msg.content);
            }

            const response = await aitoolHandler.runGatewayChatWithTools(msg.content);

            await nextcloudTalkHandler.sendFromBotToRoom(
                config.nextcloud_talk.baseUrl,
                config.nextcloud_talk.webhookSecret,
                msg.reply_target,
                response,
            );
        }

        res.json({ status: "ok" });
    } catch (err) {
        console.error("Error in webhook handler:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

// ---- Webhook handler ----
config.nextcloud_talk.webhookPath = config.nextcloud_talk.webhookPath || "/set-a-webhook-path-in-config";

app.use(express.json({
    type: "*/*",
    limit: "4mb",
    verify: (req, res, buf) => {
        // Check if the request is for Nextcloud Talk webhook path
        if (req.originalUrl.startsWith(config.nextcloud_talk.webhookPath)) {
            req.rawBody = buf; 
        }
    }
}));

app.post(config.nextcloud_talk.webhookPath, async (req, res, next) => {
  try {
    await handleNextcloudTalkWebhook(req, res, next);
  } catch (err) {
    next(err);
  }
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/", (req, res) => {
    res.send("Nextcloud Newclaw Agent is running");
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('Bad JSON syntax:', err.message);
    return res.status(400).json({ message: 'Invalid JSON format' });
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// ---- Start server ----
let port = config.local_server && config.local_server.port 
    ? config.local_server.port
    : 3000;

app.listen(port, () => {
  console.log("Server running on port " + port);
});