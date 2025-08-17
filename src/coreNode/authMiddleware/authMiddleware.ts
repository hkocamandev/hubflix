import 'dotenv/config';
import { IncomingMessage, ServerResponse } from "http";
import jwt from "jsonwebtoken";
import coreLogger from "../utils/coreLogger";

/**
 * Authentication middleware for Hubflix Core Node routes.
 * This middleware validates JWT Bearer tokens and attaches the decoded user info to the request.
 *
 * @param handler - The actual route handler function to execute if authentication passes
 * @returns An async function that performs JWT authentication before calling the handler
 */
export const authMiddleware = (handler: Function) => {
  return async (req: IncomingMessage, res: ServerResponse, id?: string) => {
    try {
      // Retrieve the Authorization header (case-insensitive)
      const authHeader = req.headers["authorization"] || req.headers["Authorization"];

      // If no token is present or it's not a Bearer token, respond with 401 Unauthorized
      if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Unauthorized: Missing Bearer token" }));
        return;
      }

      // Extract the JWT from the header
      const token = authHeader.split(" ")[1];

      try {
        // Verify the JWT using the secret from environment variables
        const decoded = jwt.verify(token, process.env.JWT_SECRET!);

        // Attach decoded user information to the request object for downstream handlers
        (req as any).user = decoded;
      } catch (err) {
        // If token verification fails, respond with 403 Forbidden
        res.writeHead(403, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Forbidden: Invalid token" }));
        return;
      }

      // If token is valid, call the actual handler
      await handler(req, res, id);

    } catch (err) {
      // Log unexpected errors in the authentication middleware
      coreLogger.error("Auth middleware error", err);

      // Respond with 500 Internal Server Error
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Internal Server Error" }));
    }
  };
};
