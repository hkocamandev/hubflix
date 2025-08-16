import CoreMovie, { ICoreMovie } from "../models/CoreMovie";
import mongoose from "mongoose";


export const getAllCoreMovies = async (): Promise<ICoreMovie[]> => CoreMovie.find().populate("director");
export const getCoreMovieById = async (id: string): Promise<ICoreMovie | null> => {
  if (!mongoose.Types.ObjectId.isValid(id)) return null; // geçerli değilse direkt null
  const objectId = new mongoose.Types.ObjectId(id);       // string → ObjectId
  return CoreMovie.findById(objectId).populate("director");
};
export const createCoreMovie = async (data: Partial<ICoreMovie>): Promise<ICoreMovie> => new CoreMovie(data).save();
export const replaceCoreMovie = async (id: string, data: Partial<ICoreMovie>): Promise<ICoreMovie | null> => 
  CoreMovie.findByIdAndUpdate(id, data, { new: true, overwrite: true });
export const updateCoreMovie = async (id: string, data: Partial<ICoreMovie>): Promise<ICoreMovie | null> => CoreMovie.findByIdAndUpdate(id, data, { new: true });
export const deleteCoreMovie = async (id: string): Promise<ICoreMovie | null> => CoreMovie.findByIdAndDelete(id);
