import express from "express";
import { addInBulk, addSprout, exportGrouped, exportToPdf, getSprouts } from "../controllers/sprout.js";

const router = express.Router();

router.get("/sprouts", getSprouts);
router.post("/sprouts", addSprout);
router.get("/bulk", addInBulk);
router.get("/pdf", exportToPdf);
router.get("/group", exportGrouped);

export default router;
