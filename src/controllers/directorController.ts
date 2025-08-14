import { Request, Response, NextFunction } from "express";
import * as directorService from "../services/directorService";
import ApiError from "../utils/ApiError";

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { firstName, secondName, birthDate, bio } = req.body;
    if (!firstName || !secondName || !birthDate) {
      throw new ApiError(400, "firstName, secondName and birthDate are required");
    }
    const director = await directorService.createDirector({ firstName, secondName, birthDate, bio });
    res.status(201).json(director);
  } catch (err) { next(err); }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;
    const deleted = await directorService.deleteDirector(id);
    if (!deleted) throw new ApiError(404, "Director not found");
    res.json({ ok: true });
  } catch (err) { next(err); }
};