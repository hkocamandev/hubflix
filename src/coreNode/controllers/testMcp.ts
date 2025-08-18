// src/coreNode/testMcp.ts
import { askMCP } from "../mcpClient";

const testMCP = async () => {
  try {
    console.log("Sending test request to MCP...");

    // Basit bir JSON prompt gönderiyoruz
    const rawJson = await askMCP(`{ "filter": {} }`);
    console.log("rawJson from AI:", rawJson);

    if (!rawJson) {
      console.warn("AI returned empty response. Check Ollama container and endpoint!");
    }
  } catch (err) {
    console.error("MCP test error:", (err as Error).message);
  }
};

testMCP();
