
const crypto = require("crypto");
const { v4: uuidv4 } = require("uuid");

const configHandler = require("./config.handler.js");
const config = configHandler.getConfig();


// ---- Signature verification ----

function verifySignature(secret, random, body, signature) {
  try {
    random = (random || "").trim();

    if (!random) {
      console.warn("Nextcloud Talk: missing X-Nextcloud-Talk-Random header");
      return false;
    }

    // Remove "sha256=" prefix if present
    let signatureHex = (signature || "").trim();
    signatureHex = signatureHex.startsWith("sha256=") ? signatureHex.slice(7) : signatureHex;

    const expectedHex = crypto
      .createHmac("sha256", secret)
      .update(random + body)
      .digest("hex");
      
    // timing-safe comparison
    if (signatureHex.length !== expectedHex.length) {
      console.warn("Nextcloud Talk: signature length mismatch");
      return false;
    }

    let result = 0;
    for (let i = 0; i < signatureHex.length; i++) {
      result |= signatureHex.charCodeAt(i) ^ expectedHex.charCodeAt(i);
    }
    
    if (!(result === 0)) {
      console.warn("Nextcloud Talk: signature mismatch ", { result, payload: random+body, signatureHex, expectedHex });
      return false;
    }

  } catch (err) {
    console.error("Error in verifySignature:", err);
    return false;
  }

  return true;
}

// ---- Payload parser ----
function parseWebhookPayload(payload) {
  const messages = [];

  const eventType = payload?.type || "";
  if (eventType.toLowerCase() !== "create") return messages;

  const actor = payload.actor || {};
  const actorType = actor.type || "";
  const actorIdFull = actor.id || "";
  const actorId = actorIdFull.split("/").pop();

  if (config.allowedUsers && config.allowedUsers.length > 0 && !config.allowedUsers.includes(actorId)) return messages;
  if (actorType.toLowerCase() === "bots") return messages;

  const object = payload.object;
  if (!object) return messages;

  const objectType = object.type || "";
  if (objectType.toLowerCase() !== "note") return messages;

  const messageId = object.id || uuidv4();

  const roomToken = payload?.target?.id;
  if (!roomToken) return messages;

  const contentRaw = object.content || "{}";

  let parsedContent = {};
  try {
    parsedContent = JSON.parse(contentRaw);
  } catch (err) {
    console.error("Error parsing webhook payload:", err);
    return messages;
  }

  const content = parsedContent?.message?.trim();
  if (!content) return messages;

  messages.push({
    id: messageId,
    reply_target: roomToken,
    sender: actorId,
    content,
    channel: "nextcloud_talk",
    timestamp: Date.now(),
    thread_ts: null
  });

  return messages;
}


async function sendFromBotToRoom(baseUrl, webhookSecret, targetRoomToken, message, fetchImpl = fetch) {
  const url = `${baseUrl}/ocs/v2.php/apps/spreed/api/v1/bot/${targetRoomToken}/message`;

  // Generate 32 random bytes → hex
  const randomHeader = crypto.randomBytes(32).toString("hex");

  // HMAC SHA256
  const signature = crypto
    .createHmac("sha256", webhookSecret)
    .update(randomHeader + message)
    .digest("hex");

  const response = await fetchImpl(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "OCS-APIRequest": "true",
      "X-Nextcloud-Talk-Bot-Random": randomHeader,
      "X-Nextcloud-Talk-Bot-Signature": signature
    },
    body: JSON.stringify({
      message
    })
  });

  if (response.ok) {
    return;
  }

  const text = await response.text().catch(() => "");
  console.error(`Nextcloud Talk bot send failed: ${response.status} — ${text}`);
  throw new Error(`Nextcloud Talk bot API error: ${response.status}`);
}

module.exports = {
    verifySignature,
    parseWebhookPayload,
    sendFromBotToRoom,
}
