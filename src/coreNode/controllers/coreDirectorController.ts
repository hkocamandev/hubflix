import { IncomingMessage, ServerResponse } from "http";
import * as directorService from "../services/coreDirectorService";
import { coreParseBody } from "../utils/coreBodyParser";
import { HTTP_METHODS } from "../constants/httpMethods";
import { validateDirectorBody } from "../utils/coreValidator";
import coreLogger from "../utils/coreLogger";
import { handleError } from "../utils/coreErrorHandler";
import mongoose from "mongoose";
import { authMiddleware } from "../authMiddleware/authMiddleware";

/**
 * Handler map for Director-related HTTP methods.
 * Each HTTP method maps to an async function handling the request and response.
 */
const directorHandlers: Record<string, Function> = {
  /**
   * POST /directors
   * Creates a new director in the system.
   * Validates the request body and responds with 201 on success or 400 if validation fails.
   */
  [HTTP_METHODS.POST]: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await coreParseBody(req);

      // Validate incoming director data
      const errors = validateDirectorBody(body);
      if (errors.length) {
        coreLogger.warn("Director creation failed: Validation errors", errors);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Validation failed", errors }));
      }

      // Create director using service layer
      const director = await directorService.createCoreDirector(body);
      coreLogger.info(`Director created successfully. ID: ${director._id}`);

      // Respond with 201 Created and the newly created director object
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(director));
    } catch (err) {
      // Log and handle any unexpected errors
      coreLogger.error("Error creating director", err);
      handleError(res, err);
    }
  },

  /**
   * DELETE /directors/:id
   * Deletes an existing director by ID.
   * Responds with 200 if successful, 404 if not found, or 400 for invalid ID.
   */
  [HTTP_METHODS.DELETE]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      // Ensure a director ID was provided
      if (!id) {
        coreLogger.warn("Delete director failed: Director ID required");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Director ID required" }));
      }

      // Validate the ID format using Mongoose ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        coreLogger.warn(`Delete director failed: Invalid ObjectId - ${id}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Invalid director ID" }));
      }

      // Attempt to delete the director
      const deleted = await directorService.deleteCoreDirector(id);

      if (!deleted) {
        coreLogger.warn(`Director not found for deletion. ID: ${id}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Director not found" }));
      }

      coreLogger.info(`Director deleted successfully. ID: ${id}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: "Director deleted successfully",
          data: deleted,
        })
      );
    } catch (err) {
      // Log and handle unexpected errors during deletion
      coreLogger.error(`Error deleting director. ID: ${id}`, err);
      handleError(res, err);
    }
  },
};

/**
 * Core entry point for handling Director routes.
 * Determines the handler based on HTTP method and applies authentication.
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response
 * @param id - Optional director ID for DELETE or other param-based routes
 */
export const handleCoreDirectors = async (
  req: IncomingMessage,
  res: ServerResponse,
  id?: string
) => {
  try {
    const handler = directorHandlers[req.method!];
    if (!handler) {
      // Respond with 405 Method Not Allowed for unsupported HTTP methods
      coreLogger.warn(`Method Not Allowed: ${req.method}`);
      res.writeHead(405, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Method Not Allowed" }));
    }

    // Wrap the handler with authMiddleware to enforce JWT authentication
    await authMiddleware(handler)(req, res, id);
  } catch (err) {
    // Catch any unhandled errors in the director controller
    coreLogger.error("Unhandled error in director handler", err);
    handleError(res, err);
  }
};
