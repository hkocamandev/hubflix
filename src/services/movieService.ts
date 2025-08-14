import Movie from "../models/Movie";

export const createMovie = async (payload: any) => {
  if (payload.releaseDate) payload.releaseDate = new Date(payload.releaseDate);
  return Movie.create(payload);
};

export const getAllMovies = async () => {
  return Movie.find().populate("director", ["firstName", "secondName"]);
};

export const updateMovie = async (id: string, payload: any) => {
  if (payload.releaseDate) payload.releaseDate = new Date(payload.releaseDate);
  return Movie.findByIdAndUpdate(id, payload, { new: true });
};

export const deleteMovie = async (id: string) => {
  return Movie.findByIdAndDelete(id);
};