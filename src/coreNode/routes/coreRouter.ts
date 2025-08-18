import { IncomingMessage, ServerResponse } from "http";
import { handleCoreMovies } from "../controllers/coreMovieController";
import { handleCoreDirectors } from "../controllers/coreDirectorController";
import { handleAiQuery } from "../controllers/coreAiController";


/**
 * Core Router for Hubflix Core Node API.
 * Routes incoming HTTP requests to the appropriate controller based on the URL path.
 *
 * Supported routes:
 * - /coreApi/movies/:id?      -> Routes to handleCoreMovies controller
 * - /coreApi/directors/:id?   -> Routes to handleCoreDirectors controller
 *
 * If the route does not match the supported endpoints, responds with 404 Not Found.
 *
 * @param req - Incoming HTTP request object
 * @param res - HTTP response object
 */
export const coreRouter = async (req: IncomingMessage, res: ServerResponse) => {
  // Split the URL path into segments and remove empty strings
  const urlParts = req.url!.split("/").filter(Boolean);

  // Route requests under /coreApi namespace
  if (urlParts[0] === "coreApi") {
    // /coreApi/movies route, optionally with movie ID
    if (urlParts[1] === "movies")
      return await handleCoreMovies(req, res, urlParts[2]);

    // /coreApi/directors route, optionally with director ID
    if (urlParts[1] === "directors")
      return await handleCoreDirectors(req, res, urlParts[2]);

      if (urlParts[1] === "ai-query") return await handleAiQuery(req, res); // <--- ai endpoint

  }

  // Respond with 404 if route is not found
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
};
