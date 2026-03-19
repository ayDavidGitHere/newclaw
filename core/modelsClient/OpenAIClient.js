
class OpenAIClient {
  constructor({
    baseUrl,
    apiKey,
    model,
    timeout = 30000
  } = {}) {
    if (!apiKey) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.model = model;
    this.timeout = timeout;
  }

  async _request(path, body, { stream = false } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeout);

    try {
      const res = await fetch(`${this.baseUrl}${path}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        signal: controller.signal
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`OpenAI API error ${res.status}: ${text}`);
      }

      if (stream) return res.body;

      return await res.json();

    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("OpenAI request timeout");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Simple chat (non-streaming)
   */
  async chat(messages, options = {}) {
    const body = {
      model: options.model || this.model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens ?? 512
    };

    const json = await this._request("/chat/completions", body);

    return json.choices?.[0]?.message?.content || "";
  }

  /**
   * Streaming chat (returns async iterator)
   */
  async *chatStream(messages, options = {}) {
    const body = {
      model: options.model || this.model,
      messages,
      stream: true
    };

    const stream = await this._request("/chat/completions", body, { stream: true });

    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();
        if (data === "[DONE]") return;

        try {
          const json = JSON.parse(data);
          const delta = json.choices?.[0]?.delta?.content;
          if (delta) yield delta;
        } catch {
          // ignore malformed chunk
        }
      }
    }
  }
}

module.exports = OpenAIClient;