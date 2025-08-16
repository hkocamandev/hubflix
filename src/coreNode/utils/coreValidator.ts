import mongoose from "mongoose";

// Movie validasyonu
export const validateMovieBody = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.title) errors.push("Title is required");
  if (!body.releaseDate) errors.push("Release date is required");
  if (!body.genre) errors.push("Genre is required");
  if (body.rating === undefined) errors.push("Rating is required");
  if (!body.imdbId) errors.push("IMDb ID is required");
  // Director kontrolü
  if (!body.director) {
    errors.push("Director is required");
  } else if (!mongoose.Types.ObjectId.isValid(body.director)) {
    errors.push("Invalid director ID");
  }
  return errors;
};

// Director validasyonu
export const validateDirectorBody = (body: any): string[] => {
  const errors: string[] = [];
  if (!body.firstName) errors.push("First name is required");
  if (!body.secondName) errors.push("Second name is required");
  if (!body.birthDate) errors.push("Birth date is required");
  return errors;
};

export const validateMoviePatchBody = (body: any): string[] => {
  const errors: string[] = [];

  if (body.title !== undefined && !body.title) errors.push("Title is required");
  if (body.releaseDate !== undefined && !body.releaseDate) errors.push("Release date is required");
  if (body.genre !== undefined && !body.genre) errors.push("Genre is required");
  if (body.rating !== undefined && typeof body.rating !== "number") errors.push("Rating must be a number");
  if (body.imdbId !== undefined && !body.imdbId) errors.push("IMDb ID is required");
  if (body.director !== undefined) {
    if (!body.director) {
      errors.push("Director is required");
    } else if (!mongoose.Types.ObjectId.isValid(body.director)) {
      errors.push("Invalid director ID");
    }
  }

  return errors;
};