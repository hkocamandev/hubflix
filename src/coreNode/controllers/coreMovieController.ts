import { IncomingMessage, ServerResponse } from "http";
import * as movieService from "../services/coreMovieService";
import { coreParseBody } from "../utils/coreBodyParser";
import { HTTP_METHODS } from "../constants/httpMethods";
import { validateMovieBody, validateMoviePatchBody } from "../utils/coreValidator";
import coreLogger from "../utils/coreLogger";
import { handleError } from "../utils/coreErrorHandler";

const movieHandlers: Record<string, Function> = {
[HTTP_METHODS.GET]: async (req: IncomingMessage, res: ServerResponse, id?: string) => {
    try {
      if (id) {
        // GET by ID
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
        // GET all
        const data = await movieService.getAllCoreMovies();
        coreLogger.info(`All movies retrieved successfully. Count: ${data.length}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        return res.end(JSON.stringify(data));
      }
    } catch (err) {
      handleError(res, err);
    }
  },

  [HTTP_METHODS.POST]: async (req: IncomingMessage, res: ServerResponse) => {
    try {
      const body = await coreParseBody(req);
      const errors = validateMovieBody(body);
      if (errors.length) {
        coreLogger.warn("Movie creation failed: Validation errors", errors);
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ message: "Validation failed", errors }));
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

  [HTTP_METHODS.PUT]: async (req: IncomingMessage, res: ServerResponse, id?: string) => {
  try {
    if (!id) {
      coreLogger.warn("Movie replacement failed: Movie ID required");
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Movie ID required" }));
    }

    const body = await coreParseBody(req);
    const errors = validateMovieBody(body);
    if (errors.length) {
      coreLogger.warn(`Movie replacement failed for ID: ${id} - Validation errors`, errors);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Validation failed", errors }));
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

[HTTP_METHODS.PATCH]: async (req: IncomingMessage, res: ServerResponse, id?: string) => {
  try {
    if (!id) {
      coreLogger.warn("Movie patch failed: Movie ID required");
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Movie ID required" }));
    }

    const body = await coreParseBody(req);
    const validationErrors = validateMoviePatchBody(body);
    if (validationErrors.length > 0) {
      coreLogger.warn(`Movie patch validation failed for ID: ${id}`, validationErrors);
      res.writeHead(400, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ message: "Validation failed", errors: validationErrors }));
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

  [HTTP_METHODS.DELETE]: async (req: IncomingMessage, res: ServerResponse, id?: string) => {
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
      res.end(JSON.stringify({ message: "Movie deleted successfully", data: deleted }));
    } catch (err) {
      coreLogger.error(`Error deleting movie. ID: ${id}`, err);
      handleError(res, err);
    }
  }
};

export const handleCoreMovies = async (req: IncomingMessage, res: ServerResponse, id?: string) => {
  const handler = movieHandlers[req.method!];
  if (!handler) {
    coreLogger.warn(`Method Not Allowed: ${req.method}`);
    res.writeHead(405, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ message: "Method Not Allowed" }));
  }
  await handler(req, res, id);
};
