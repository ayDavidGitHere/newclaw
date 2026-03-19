const fs = require('fs');
const path = require('path');

const logHandler = require("./log.handler.js");

const CONFIG_PATH = path.join(__dirname, "../data/config.json");

function getDefaultConfig() {
  return {
    nextcloud_talk: {
      baseUrl: "",
      conversationToken: "",
      webhookSecret: "",
      webhookPath: "/nextcloud-talk",
      allowedUsers: [] // Optional: leave empty to allow all users, or specify an array of allowed usernames
    },
    main_ai_provider: {
      apiUrl: "https://api.openai.com/v1",
      apiKey: "",
      modelName: "gpt-4.1-mini",
      name: "openai"
    }
  };
}

function initConfig() {
  try {
    // 1. If file does NOT exist → create it
    if (!fs.existsSync(CONFIG_PATH)) {
      const defaultConfig = getDefaultConfig();

      fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify(defaultConfig, null, 2),
        "utf-8"
      );

      logHandler.log("info", "Config file created with defaults");
      return defaultConfig;
    }

    // 2. If exists → try to read + parse
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");

    try {
      const parsed = JSON.parse(raw);

      // Optional: basic validation
      if (!parsed.nextcloud_talk) {
        throw new Error("Missing nextcloud_talk config");
      }

      return parsed;
    } catch (err) {
      // 3. File exists but is corrupted
      logHandler.log("error", `Invalid config.json: ${err.message}`);

      // Backup corrupted file
      const backupPath = CONFIG_PATH + ".broken-" + Date.now();
      fs.renameSync(CONFIG_PATH, backupPath);

      logHandler.log("warn", `Corrupted config backed up to ${backupPath}`);

      // Recreate fresh config
      const defaultConfig = getDefaultConfig();
      fs.writeFileSync(
        CONFIG_PATH,
        JSON.stringify(defaultConfig, null, 2),
        "utf-8"
      );

      return defaultConfig;
    }

  } catch (err) {
    logHandler.log("fatal", `initConfig failed: ${err.message}`);
    process.exit(1); // fail fast
  }
}

function getConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    throw new Error("Failed to read config: " + err.message);
  }
}

module.exports = {
  initConfig,
  getConfig
};