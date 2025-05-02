import express from "express";
import { addInBulk, addSprout, exportToPdf, getSprouts } from "../controllers/sprout.js";

const router = express.Router();

router.get("/sprouts", getSprouts);
router.post("/sprouts", addSprout);
router.get("/bulk", addInBulk);
router.get("/pdf", exportToPdf);

export default router;
