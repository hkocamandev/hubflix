import { Router } from "express";
import * as movieController from "../controllers/movieController";

const router = Router();
// Create movie
router.post("/", movieController.create);
// Get all movies
router.get("/", movieController.getAll);
// Update movie
router.put("/:id", movieController.update);
// Delete movie
router.delete("/:id", movieController.remove);

export default router;