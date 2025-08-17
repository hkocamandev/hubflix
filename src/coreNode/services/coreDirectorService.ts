import CoreDirector, { ICoreDirector } from "../models/CoreDirector";

/**
 * Service layer for CoreDirector model.
 * Provides CRUD operations for directors in the Hubflix Core Node application.
 */

/**
 * Retrieve all directors from the database.
 * @returns Promise resolving to an array of ICoreDirector documents.
 */
export const getAllCoreDirectors = async (): Promise<ICoreDirector[]> =>
  CoreDirector.find();

/**
 * Retrieve a single director by their ID.
 * @param id - MongoDB ObjectId string of the director
 * @returns Promise resolving to the director document or null if not found
 */
export const getCoreDirectorById = async (
  id: string
): Promise<ICoreDirector | null> => CoreDirector.findById(id);

/**
 * Create a new director in the database.
 * @param data - Partial director data for creation
 * @returns Promise resolving to the newly created director document
 */
export const createCoreDirector = async (
  data: Partial<ICoreDirector>
): Promise<ICoreDirector> => new CoreDirector(data).save();

/**
 * Update an existing director by ID.
 * @param id - MongoDB ObjectId string of the director
 * @param data - Partial data to update the director
 * @returns Promise resolving to the updated director document, or null if not found
 */
export const updateCoreDirector = async (
  id: string,
  data: Partial<ICoreDirector>
): Promise<ICoreDirector | null> =>
  CoreDirector.findByIdAndUpdate(id, data, { new: true });

/**
 * Delete a director by ID.
 * @param id - MongoDB ObjectId string of the director
 * @returns Promise resolving to the deleted director document, or null if not found
 */
export const deleteCoreDirector = async (
  id: string
): Promise<ICoreDirector | null> => CoreDirector.findByIdAndDelete(id);
