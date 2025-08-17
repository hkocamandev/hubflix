import CoreMovie, { ICoreMovie } from "../models/CoreMovie";
import mongoose from "mongoose";
import redis from "../utils/redisClient";

/**
 * Service layer for CoreMovie model.
 * Provides CRUD operations for movies in the Hubflix Core Node application.
 * Implements Redis caching for efficient read operations.
 */

/**
 * Retrieve all movies from the database.
 * Populates the 'director' field for full relational data.
 * @returns Promise resolving to an array of ICoreMovie documents
 */
export const getAllCoreMovies = async (): Promise<ICoreMovie[]> =>
  CoreMovie.find().populate("director");

/**
 * Retrieve a single movie by its ID.
 * Checks Redis cache first to improve performance.
 * @param id - MongoDB ObjectId string of the movie
 * @returns Promise resolving to the movie document or null if not found
 */
export const getCoreMovieById = async (id: string): Promise<ICoreMovie | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;

  // First Redis cache check
  const cached = await redis.get(`coreMovie:${id}`);
  if (cached) {
    console.log(`Cache hit for movie ID: ${id}`);
    return JSON.parse(cached);
  }

  console.log(`Cache miss for movie ID: ${id}`);

  const objectId = new mongoose.Types.ObjectId(id);
  const movie = await CoreMovie.findById(objectId).populate("director");

  if (movie) {
    // Store in Redis with a TTL of 10 minutes
    await redis.set(`coreMovie:${id}`, JSON.stringify(movie), "EX", 600);
    console.log(`Movie cached in Redis: ${id}`);
  }

  return movie;
};

/**
 * Create a new movie in the database.
 * Clears any existing Redis cache for this movie ID to ensure consistency.
 * @param data - Partial movie data for creation
 * @returns Promise resolving to the newly created movie document
 */
export const createCoreMovie = async (data: Partial<ICoreMovie>): Promise<ICoreMovie> => {
  const movie = await new CoreMovie(data).save();
  await redis.del(`coreMovie:${movie._id}`);
  return movie;
};

/**
 * Replace an existing movie by ID.
 * Overwrites the entire movie document.
 * @param id - MongoDB ObjectId string of the movie
 * @param data - Complete movie data to replace
 * @returns Promise resolving to the updated movie document, or null if not found
 */
export const replaceCoreMovie = async (
  id: string,
  data: Partial<ICoreMovie>
): Promise<ICoreMovie | null> =>
  CoreMovie.findByIdAndUpdate(id, data, { new: true, overwrite: true });

/**
 * Partially update an existing movie by ID.
 * Only fields provided in `data` are updated.
 * @param id - MongoDB ObjectId string of the movie
 * @param data - Partial movie data to update
 * @returns Promise resolving to the updated movie document, or null if not found
 */
export const updateCoreMovie = async (
  id: string,
  data: Partial<ICoreMovie>
): Promise<ICoreMovie | null> =>
  CoreMovie.findByIdAndUpdate(id, data, { new: true });

/**
 * Delete a movie by ID.
 * Removes the corresponding Redis cache to maintain consistency.
 * @param id - MongoDB ObjectId string of the movie
 * @returns Promise resolving to the deleted movie document, or null if not found
 */
export const deleteCoreMovie = async (id: string): Promise<ICoreMovie | null> => {
  const deleted = await CoreMovie.findByIdAndDelete(id);
  if (deleted) {
    await redis.del(`coreMovie:${id}`);
  }
  return deleted;
};
