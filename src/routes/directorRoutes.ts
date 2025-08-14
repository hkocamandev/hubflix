import { Router } from "express";
import * as directorController from "../controllers/directorController";

const router = Router();
// Create director
router.post("/", directorController.create);
// Delete director
router.delete("/:id", directorController.remove);

export default router;
