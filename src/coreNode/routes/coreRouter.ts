import { IncomingMessage, ServerResponse } from "http";
import { handleCoreMovies } from "../controllers/coreMovieController";
import { handleCoreDirectors } from "../controllers/coreDirectorController";

export const coreRouter = async (req: IncomingMessage, res: ServerResponse) => {
  const urlParts = req.url!.split("/").filter(Boolean);

  if (urlParts[0] === "coreApi") {
    if (urlParts[1] === "movies")
      return await handleCoreMovies(req, res, urlParts[2]);
    if (urlParts[1] === "directors")
      return await handleCoreDirectors(req, res, urlParts[2]);
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ message: "Not Found" }));
};
