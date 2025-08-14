import { Request, Response, NextFunction } from "express";
import * as movieService from "../services/movieService";
import ApiError from "../utils/ApiError";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const required = ["title","releaseDate","genre","rating","imdbId","director"];
    const missing = required.filter(k => !(k in req.body));
    if (missing.length) throw new ApiError(400, `Missing fields: ${missing.join(", ")}`);

    const movie = await movieService.createMovie(req.body);
    res.status(201).json(movie);
  } catch (err) { next(err); }
};

export const getAll = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const movies = await movieService.getAllMovies();
    res.json(movies);
  } catch (err) { next(err); }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const movie = await movieService.updateMovie(req.params.id, req.body);
    if (!movie) throw new ApiError(404, "Movie not found");
    res.json(movie);
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const deleted = await movieService.deleteMovie(req.params.id);
    if (!deleted) throw new ApiError(404, "Movie not found");
    res.json({ ok: true });
  } catch (err) { next(err); }
};