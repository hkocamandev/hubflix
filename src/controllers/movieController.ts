import { Request, Response } from "express";
import Movie from "../models/Movie";

// GET /movies
export const getMovies = async (req: Request, res: Response) => {
  try {
    const { title, genre } = req.query;
    const filter: any = {};

    if (title) filter.title = { $regex: title as string, $options: "i" };
    if (genre) filter.genre = { $in: [genre] }; // modelde genre alanı var, genres değil

    const movies = await Movie.find(filter).populate("director"); // doğru alan adı
    res.json(movies);
  } catch (err) {
    res.status(500).json({ message: "Error fetching movies", error: err });
  }
};

// GET /movies/:id

export const getMovieById = async (req: Request, res: Response) => {
  try {
    const movie = await Movie.findById(req.params.id).populate("director"); // doğru alan adı
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    res.json(movie);
  } catch (err) {
    res.status(500).json({ message: "Error fetching movie", error: err });
  }
};

// POST /movies
export const createMovie = async (req: Request, res: Response) => {
  try {
    const newMovie = new Movie(req.body);
    const savedMovie = await newMovie.save();
    res.status(201).json(savedMovie);
  } catch (err) {
    res.status(400).json({ message: "Error creating movie", error: err });
  }
};

// PUT /movies/:id
export const updateMovie = async (req: Request, res: Response) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedMovie) return res.status(404).json({ message: "Movie not found" });
    res.json(updatedMovie);
  } catch (err) {
    res.status(400).json({ message: "Error updating movie", error: err });
  }
};

// DELETE /movies/:id
export const deleteMovie = async (req: Request, res: Response) => {
  try {
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting movie", error: err });
  }
};