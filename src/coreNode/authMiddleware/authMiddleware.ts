import 'dotenv/config'; 
import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import coreLogger from "../utils/coreLogger";

export const authMiddleware = (handler: Function) => {
  return async (req: IncomingMessage, res: ServerResponse, id?: string) => {
    try {
      const authHeader = req.headers["authorization"] || req.headers["Authorization"];
      if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Unauthorized: Missing Bearer token" }));
        return;
      }

      const token = authHeader.split(" ")[1];
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);
        // decoded içindeki bilgiyi req üzerine ekleyebiliriz
        (req as any).user = decoded;
      } catch (err) {
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Forbidden: Invalid token" }));
        return;
      }

      // Token geçerli ise gerçek handler çalışsın
      await handler(req, res, id);

    } catch (err) {
      coreLogger.error("Auth middleware error", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  };
};