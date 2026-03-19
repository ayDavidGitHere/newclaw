class OllamaCloudClient {
  constructor(
    baseUrl,
    apiKey,
    model,
    timeout = 30000
  ) {
    if (!apiKey) {
      throw new Error("Missing OLLAMA_API_KEY");
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
        throw new Error(`Ollama API error ${res.status}: ${text}`);
      }

      if (stream) return res.body;

      return await res.json();

    } catch (err) {
      if (err.name === "AbortError") {
        throw new Error("Ollama request timeout");
      }
      throw err;
    } finally {
      clearTimeout(timer);
    }
  }

  /**
   * Simple prompt (like your curl)
   */
  async generate(prompt, options = {}) {
    const body = {
      model: options.model || this.model,
      prompt,
      stream: false
    };

    console.log("OllamaCloudClient generate request body:", body);
    console.log(this.baseUrl, this.apiKey, this.model, this.timeout)

    const json = await this._request("/api/generate", body);

    return json?.response || "";
  }

  /**
   * Streaming generator
   */
  async *generateStream(prompt, options = {}) {
    const body = {
      model: options.model || this.model,
      prompt,
      stream: true
    };

    const stream = await this._request("/api/generate", body, { stream: true });

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
        if (!line.trim()) continue;

        try {
          const json = JSON.parse(line);

          if (json.done) return;

          if (json.response) {
            yield json.response;
          }

        } catch {
          // ignore partial chunk
        }
      }
    }
  }
}

module.exports = OllamaCloudClient;