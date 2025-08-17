import { IncomingMessage, ServerResponse } from "http";
import * as movieService from "../services/coreMovieService";
import { coreParseBody } from "../utils/coreBodyParser";
import { HTTP_METHODS } from "../constants/httpMethods";
import {
  validateMovieBody,
  validateMoviePatchBody,
} from "../utils/coreValidator";
import coreLogger from "../utils/coreLogger";
import { handleError } from "../utils/coreErrorHandler";
import { authMiddleware } from "../authMiddleware/authMiddleware";

/**
 * Handler map for Movie-related HTTP methods.
 * Each HTTP method has a dedicated async handler that processes requests and responses.
 */
const movieHandlers: Record<string, Function> = {
  /**
   * GET /movies or GET /movies/:id
   * Retrieves either all movies or a single movie by ID.
   * Returns 200 with data on success or 404 if a specific movie is not found.
   */
  [HTTP_METHODS.GET]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      if (id) {
        // Fetch a single movie by ID
        const data = await movieService.getCoreMovieById(id);
        if (!data) {
          coreLogger.warn(`Movie not found. ID: ${id}`);
          res.writeHead(404, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ message: "Movie not found" }));
        }
        coreLogger.info(`Movie retrieved successfully. ID: ${id}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      } else {
        // Fetch all movies
        const data = await movieService.getAllCoreMovies();
        coreLogger.info(
          `All movies retrieved successfully. Count: ${data.length}`
        );
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  /**
   * POST /movies
   * Creates a new movie entry.
   * Validates the request body and returns 201 on success or 400 if validation fails.
   */
  [HTTP_METHODS.POST]: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await coreParseBody(req);
      const errors = validateMovieBody(body);
      if (errors.length) {
        coreLogger.warn("Movie creation failed: Validation errors", errors);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Validation failed", errors })
        );
      }

      const movie = await movieService.createCoreMovie(body);
      coreLogger.info(`Movie created successfully. ID: ${movie._id}`);
      res.writeHead(201, { "Content-Type": "application/json" });
      res.end(JSON.stringify(movie));
    } catch (err) {
      coreLogger.error("Error creating movie", err);
      handleError(res, err);
    }
  },

  /**
   * PUT /movies/:id
   * Replaces an existing movie completely.
   * Returns 200 on success, 400 for validation errors, and 404 if movie not found.
   */
  [HTTP_METHODS.PUT]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      if (!id) {
        coreLogger.warn("Movie replacement failed: Movie ID required");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie ID required" }));
      }

      const body = await coreParseBody(req);
      const errors = validateMovieBody(body);
      if (errors.length) {
        coreLogger.warn(
          `Movie replacement failed for ID: ${id} - Validation errors`,
          errors
        );
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({ message: "Validation failed", errors })
        );
      }

      const replaced = await movieService.replaceCoreMovie(id, body);

      if (!replaced) {
        coreLogger.warn(`Movie not found for replacement. ID: ${id}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie not found" }));
      }

      coreLogger.info(`Movie replaced successfully. ID: ${id}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(replaced));
    } catch (err) {
      coreLogger.error(`Error replacing movie. ID: ${id}`, err);
      handleError(res, err);
    }
  },

  /**
   * PATCH /movies/:id
   * Updates partial fields of an existing movie.
   * Validates the patch body and returns 200 on success, 400 for validation errors, and 404 if not found.
   */
  [HTTP_METHODS.PATCH]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      if (!id) {
        coreLogger.warn("Movie patch failed: Movie ID required");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie ID required" }));
      }

      const body = await coreParseBody(req);
      const validationErrors = validateMoviePatchBody(body);
      if (validationErrors.length > 0) {
        coreLogger.warn(
          `Movie patch validation failed for ID: ${id}`,
          validationErrors
        );
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(
          JSON.stringify({
            message: "Validation failed",
            errors: validationErrors,
          })
        );
      }

      const updated = await movieService.updateCoreMovie(id, body);

      if (!updated) {
        coreLogger.warn(`Movie not found for patching. ID: ${id}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie not found" }));
      }

      coreLogger.info(`Movie patched successfully. ID: ${id}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(updated));
    } catch (err) {
      coreLogger.error(`Error patching movie. ID: ${id}`, err);
      handleError(res, err);
    }
  },

  /**
   * DELETE /movies/:id
   * Deletes an existing movie by ID.
   * Returns 200 on successful deletion or 404 if movie not found.
   */
  [HTTP_METHODS.DELETE]: async (
    req: IncomingMessage,
    res: ServerResponse,
    id?: string
  ) => {
    try {
      if (!id) {
        coreLogger.warn("Delete movie failed: Movie ID required");
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie ID required" }));
      }

      const deleted = await movieService.deleteCoreMovie(id);
      if (!deleted) {
        coreLogger.warn(`Movie not found for deletion. ID: ${id}`);
        res.writeHead(404, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Movie not found" }));
      }

      coreLogger.info(`Movie deleted successfully. ID: ${id}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ message: "Movie deleted successfully", data: deleted })
      );
    } catch (err) {
      coreLogger.error(`Error deleting movie. ID: ${id}`, err);
      handleError(res, err);
    }
  },
};

/**
 * Core entry point for handling Movie routes.
 * Determines the handler based on HTTP method and applies JWT authentication.
 *
 * @param req - Incoming HTTP request
 * @param res - HTTP response
 * @param id - Optional movie ID for param-based routes
 */
export const handleCoreMovies = async (
  req: IncomingMessage,
  res: ServerResponse,
  id?: string
) => {
  const handler = movieHandlers[req.method!];

  if (!handler) {
    // Return 405 Method Not Allowed if HTTP method is not supported
    coreLogger.warn(`Method Not Allowed: ${req.method}`);
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Method Not Allowed" }));
  }

  // Wrap the handler with authentication middleware to enforce JWT validation
  await authMiddleware(handler)(req, res, id);
};
