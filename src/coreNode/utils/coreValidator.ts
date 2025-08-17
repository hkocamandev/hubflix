/**
 * Hubflix Core Validation Utilities
 * Provides structured validation for Movie and Director entities.
 * Ensures required fields are present and valid, including MongoDB ObjectId checks.
 */

import mongoose from "mongoose";

/**
 * Validates the request body for creating or replacing a Movie.
 * Ensures all required fields are provided and the director ID is valid.
 * @param body - The request body for a Movie
 * @returns Array of validation error messages; empty if valid
 */
export const validateMovieBody = (body: any): string[] => {
  const errors: string[] = [];

  if (!body.title) errors.push("Title is required");
  if (!body.releaseDate) errors.push("Release date is required");
  if (!body.genre) errors.push("Genre is required");
  if (body.rating === undefined) errors.push("Rating is required");
  if (!body.imdbId) errors.push("IMDb ID is required");

  // Validate director reference
  if (!body.director) {
    errors.push("Director is required");
  } else if (!mongoose.Types.ObjectId.isValid(body.director)) {
    errors.push("Invalid director ID");
  }

  return errors;
};

/**
 * Validates the request body for creating or updating a Director.
 * Checks that essential fields (first name, second name, birth date) are present.
 * @param body - The request body for a Director
 * @returns Array of validation error messages; empty if valid
 */
export const validateDirectorBody = (body: any): string[] => {
  const errors: string[] = [];

  if (!body.firstName) errors.push("First name is required");
  if (!body.secondName) errors.push("Second name is required");
  if (!body.birthDate) errors.push("Birth date is required");

  return errors;
};

/**
 * Validates the request body for patching a Movie.
 * Only fields present in the request are validated.
 * Checks types and constraints, e.g., rating must be a number between 0 and 10.
 * @param body - Partial Movie request body for patching
 * @returns Array of validation error messages; empty if valid
 */
export const validateMoviePatchBody = (body: any): string[] => {
  const errors: string[] = [];

  if (body.title !== undefined && !body.title) errors.push("Title is required");
  if (body.releaseDate !== undefined && !body.releaseDate)
    errors.push("Release date is required");
  if (body.genre !== undefined && !body.genre) errors.push("Genre is required");

  if (body.rating !== undefined) {
    if (typeof body.rating !== "number") errors.push("Rating must be a number");
    if (body.rating < 0 || body.rating > 10)
      errors.push("Rating must be between 0 and 10");
  }

  if (body.imdbId !== undefined && !body.imdbId)
    errors.push("IMDb ID is required");

  if (body.director !== undefined) {
    if (!body.director) {
      errors.push("Director is required");
    } else if (!mongoose.Types.ObjectId.isValid(body.director)) {
      errors.push("Invalid director ID");
    }
  }

  return errors;
};
