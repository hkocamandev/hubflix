import { Request, Response } from "express";
import Director from "../models/Director";

// Create a new director
export const createDirector = async (req: Request, res: Response) => {
  try {
    const { firstName, secondName, birthDate, bio } = req.body;

    const director = new Director({ firstName, secondName, birthDate, bio });
    await director.save();

    res.status(201).json(director);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// Delete a director by ID
export const deleteDirector = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deleted = await Director.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: "Director not found" });

    res.json({ message: "Director deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};