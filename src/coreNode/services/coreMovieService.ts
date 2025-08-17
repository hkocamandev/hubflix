import CoreMovie, { ICoreMovie } from "../models/CoreMovie";
import mongoose from "mongoose";
import redis from "../utils/redisClient";

export const getAllCoreMovies = async (): Promise<ICoreMovie[]> =>
  CoreMovie.find().populate("director");
export const getCoreMovieById = async (id: string): Promise<ICoreMovie | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  // First Redis cache control
  const cached = await redis.get(`coreMovie:${id}`);
  if (cached) {
    console.log(`Cache hit for movie ID: ${id}`);
    return JSON.parse(cached);
  }

  console.log(`Cache miss for movie ID: ${id}`);

  const objectId = new mongoose.Types.ObjectId(id);
  const movie = await CoreMovie.findById(objectId).populate("director");

  if (movie) {
    // Redis cache save(TTL: 10 minutes)
    await redis.set(`coreMovie:${id}`, JSON.stringify(movie), "EX", 600);
    console.log(`Movie cached in Redis: ${id}`);
  }

  return movie;
};

export const createCoreMovie = async (data: Partial<ICoreMovie>): Promise<ICoreMovie> => {
  const movie = await new CoreMovie(data).save();
  await redis.del(`coreMovie:${movie._id}`);
  return movie;
};

export const replaceCoreMovie = async (
  id: string,
  data: Partial<ICoreMovie>
): Promise<ICoreMovie | null> =>
  CoreMovie.findByIdAndUpdate(id, data, { new: true, overwrite: true });

export const updateCoreMovie = async (
  id: string,
  data: Partial<ICoreMovie>
): Promise<ICoreMovie | null> =>
  CoreMovie.findByIdAndUpdate(id, data, { new: true });

export const deleteCoreMovie = async (id: string): Promise<ICoreMovie | null> => {
  const deleted = await CoreMovie.findByIdAndDelete(id);
  if (deleted) {
    await redis.del(`coreMovie:${id}`);
  }
  return deleted;
};
