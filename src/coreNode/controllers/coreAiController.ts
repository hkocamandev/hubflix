import { IncomingMessage, ServerResponse } from "http";
import { MongoClient } from "mongodb";
import { askMCP } from "../mcpClient";

export const handleAiQuery = async (
  req: IncomingMessage,
  res: ServerResponse
) => {
  try {
    // --- Request body oku ---
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    await new Promise<void>((resolve) => req.on("end", () => resolve()));
    const { question } = JSON.parse(body);

    // --- AI'den MongoDB query iste ---
    const rawJson = await askMCP(`
MongoDB "coremovies" koleksiyonu var.
Kullanıcı sorusu: "${question}"
Koleksiyondaki alanlar: title, description, releaseDate (Date), genre, rating, imdbId, director

YANIT SADECE GEÇERLİ JSON OLSUN.
**Hiçbir açıklama, kod bloğu veya metin ekleme.**
  Örnek: { "filter": { "rating": { "$gt": 6 } } }
`);

    console.log("rawJson from AI:", rawJson);

    // --- JSON'u {} bloklarından yakala ---
    const match = rawJson.match(/\{(?:[^{}]|(?:\{[^{}]*\}))*\}/s);

let queryObj: {
  filter?: Record<string, any>;
  projection?: Record<string, any>;
  sort?: Record<string, any>;
  skip?: number;
  limit?: number;
} = {};

    if (match) {
      try {
        queryObj = JSON.parse(match[0].replace(/\n/g, "").trim());
      } catch (e) {
        console.warn("JSON parse edilemedi:", match[0]);
      }
    }

    // --- Defaults ---
    const filter = queryObj.filter || {};
    const projection = queryObj.projection || {};
    const sort = queryObj.sort || {};
    const skip = queryObj.skip || 0;
    const limit = queryObj.limit || 0;

    // --- MongoDB sorgusu ---
    const client = new MongoClient(process.env.MONGO_URI!);
    await client.connect();
    const db = client.db("hubflix");

    const films = await db
      .collection("coremovies")
      .find(filter)
      .project(projection)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray();

    await client.close();

    // --- Response ---
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: true, films }));
  } catch (err) {
    console.error("AI Query Error:", err);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ success: false, error: (err as Error).message }));
  }
};
