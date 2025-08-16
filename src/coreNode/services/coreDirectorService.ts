import CoreDirector, { ICoreDirector } from "../models/CoreDirector";

export const getAllCoreDirectors = async (): Promise<ICoreDirector[]> => CoreDirector.find();
export const getCoreDirectorById = async (id: string): Promise<ICoreDirector | null> => CoreDirector.findById(id);
export const createCoreDirector = async (data: Partial<ICoreDirector>): Promise<ICoreDirector> => new CoreDirector(data).save();
export const updateCoreDirector = async (id: string, data: Partial<ICoreDirector>): Promise<ICoreDirector | null> => CoreDirector.findByIdAndUpdate(id, data, { new: true });
export const deleteCoreDirector = async (id: string): Promise<ICoreDirector | null> => CoreDirector.findByIdAndDelete(id);