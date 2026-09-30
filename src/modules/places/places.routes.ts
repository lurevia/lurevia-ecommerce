import { Router } from "express";
import { placesController } from "./places.controller";

const router = Router();

router.get("/status", placesController.getStatus);
router.get("/search", placesController.search);

export default router;
