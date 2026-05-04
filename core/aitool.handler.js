const { spawn } = require("child_process");
const path = require("path");

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

function chatOpenClawCli(input, conversation_token = null) {
  let addCronContext = true;

  if (addCronContext && conversation_token) {
    let clijs_dir = `${path.resolve(__dirname)}/`;
    input += `\n If message needs cron, at cron time: call this cli command to deliver response: "node ${clijs_dir}cli.js send-to-room ${conversation_token} <message>" to send message to nextcloud talk room. Do not talk about this in your response. This is just for your reference.`;
  }

  return new Promise((resolve, reject) => {
    const proc = spawn("openclaw", [
      "agent",
      "--message", input,
      "--agent", config.main_ai_provider.openclawCliAgentName || "main"
    ]);

    let stdout = "";
    let stderr = "";


    // fn displaces for plugin logs stripper because of problem in latest openclaw
    function processOutputChunk(chunk) {
      let text = chunk.toString();
      return text;
    }

    function processOutputChunk(chunk) {
      let text = chunk.toString();

      // strip ANSI colors
      text = text.replace(/\x1b\[[0-9;]*m/g, "");

      // split into lines and filter
      const filtered = text
        .split("\n")
        .filter(line => !/^[\s]*\[plugins\]/.test(line))
        .join("\n");

      return (filtered + "\n");
    }

    proc.stdout.on("data", data => {
      stdout += processOutputChunk(data)
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

  async runGatewayChatWithTools(input, conversation_token = null) {
    let reply = ``;

    try {
        if (config.main_ai_provider && config.main_ai_provider.name === "openaicloud") {
            reply = await chatOpenAI(input);
        } else if (config.main_ai_provider && config.main_ai_provider.name === "ollamacloud") {
            reply = await chatOllamaCloud(input);
        } else if (config.main_ai_provider && config.main_ai_provider.name === "openclawcli") {
            reply = await chatOpenClawCli(input, conversation_token);
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
