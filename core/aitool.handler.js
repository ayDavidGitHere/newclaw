const { spawn } = require("child_process");

const OpenAIClient = require("./modelsClient/OpenAIClient.js");
const OllamaCloudClient = require("./modelsClient/OllamaCloudClient.js");


const configHandler = require("./config.handler.js");
const config = configHandler.getConfig();

async function chatOpenAI(input) {
    const openai = new OpenAIClient(
      config.main_ai_provider.apiUrl || 'https://api.openai.com/v1',
      config.main_ai_provider.apiKey || '',
      config.main_ai_provider.modelName || 'gpt-4.1-mini'
    );

    let reply = await openai.chat([
      { role: "system", content: "You are a helpful assistant" },
      { role: "user", content: "Hello!" }
    ]);

    return reply;
}

async function chatOllamaCloud(input) {
    const ollama = new OllamaCloudClient(
      config.main_ai_provider.apiUrl || 'https://ollama.com',
      config.main_ai_provider.apiKey || '',
      config.main_ai_provider.modelName || 'gpt-oss:120b'
    );

    let reply = await ollama.generate(input);

    return reply;
}

function chatOpenClawCli(input) {
  return new Promise((resolve, reject) => {
    const proc = spawn("openclaw", [
      "agent",
      "--message", input,
      "--agent", config.main_ai_provider.openclawCliAgentName || "main"
    ]);

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", data => {
      stdout += data.toString();
    });

    proc.stderr.on("data", data => {
      stderr += data.toString();
    });

    proc.on("close", code => {
      if (code !== 0) {
        return reject(new Error(`CLI exited with ${code}: ${stderr}`));
      }

      resolve(stdout.trim());
    });

    proc.on("error", err => {
      reject(err);
    });
  });
}

const aitool = {
  autoSave: true,

  async runGatewayChatWithTools(input) {
    let reply = ``;

    try {
        if (config.main_ai_provider && config.main_ai_provider.name === "openaicloud") {
            reply = await chatOpenAI(input);
        } else if (config.main_ai_provider && config.main_ai_provider.name === "ollamacloud") {
            reply = await chatOllamaCloud(input);
        } else if (config.main_ai_provider && config.main_ai_provider.name === "openclawcli") {
            reply = await chatOpenClawCli(input);
            console.log("Received from OpenClaw CLI:", reply ? reply.slice(0, 10) : reply);
        }
    } catch (err) {
        reply = "Sorry, I'm having trouble processing that right now.";
        console.error("Error in chatOpenAI:", err);
    }

    return `${reply}`;
  },


  async storeMemory(key, value) {
    console.log("Memory saved:", key, value);
  }
};

module.exports = aitool;