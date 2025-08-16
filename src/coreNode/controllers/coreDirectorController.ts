import { IncomingMessage, ServerResponse } from "http";
import * as directorService from "../services/coreDirectorService";
import { coreParseBody } from "../utils/coreBodyParser";
import { HTTP_METHODS } from "../constants/httpMethods";
import { validateDirectorBody } from "../utils/coreValidator";
import coreLogger from "../utils/coreLogger";
import { handleError } from "../utils/coreErrorHandler";
import mongoose from "mongoose";

const directorHandlers: Record<string, Function> = {
  [HTTP_METHODS.POST]: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await coreParseBody(req);

      // Validation
      const errors = validateDirectorBody(body);
      if (errors.length) {
        coreLogger.warn("Director creation failed: Validation errors", errors);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Validation failed", errors })
        );
      }

      const director = await directorService.createCoreDirector(body);
      coreLogger.info(`Director created successfully. ID: ${director._id}`);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(director));
    } catch (err) {
      coreLogger.error("Error creating director", err);
      handleError(res, err);
    }
  },

  [HTTP_METHODS.DELETE]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      if (!id) {
        coreLogger.warn("Delete director failed: Director ID required");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Director ID required" }));
      }

      if (!mongoose.Types.ObjectId.isValid(id)) {
        coreLogger.warn(`Delete director failed: Invalid ObjectId - ${id}`);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Invalid director ID" }));
      }

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
      coreLogger.error(`Error deleting director. ID: ${id}`, err);
      handleError(res, err);
    }
  },
};

export const handleCoreDirectors = async (
  req: IncomingMessage,
  res: ServerResponse,
  id?: string
) => {
  try {
    const handler = directorHandlers[req.method!];
    if (!handler) {
      coreLogger.warn(`Method Not Allowed: ${req.method}`);
      res.writeHead(405, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Method Not Allowed" }));
    }
    await handler(req, res, id);
  } catch (err) {
    coreLogger.error("Unhandled error in director handler", err);
    handleError(res, err);
  }
};
