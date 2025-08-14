import { Router } from "express";
import { createDirector, deleteDirector } from "../controllers/directorController";

const router = Router();

// POST /api/directors
router.post("/", createDirector);

// DELETE /api/directors/:id
router.delete("/:id", deleteDirector);

export default router;