import { fetch } from "undici";

const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "llama3";

/**
 * MCP (Ollama) ile prompt gönderip JSON cevabı almak için fonksiyon
 */
export const askMCP = async (prompt: string): Promise<string> => {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: OLLAMA_MODEL, prompt }),
    });

    // Streaming çıktıyı satır satır al
    const rawText = await res.text();
    const lines = rawText.split("\n").filter(l => l.trim() !== "");
    const data = lines.map(l => JSON.parse(l));

    // Tüm tokenları birleştir
    const fullResponse = data.map(d => d.response ?? "").join("");
    return fullResponse;

  } catch (err) {
    console.error("MCP Error:", (err as Error).message);
    throw err;
  }
};
