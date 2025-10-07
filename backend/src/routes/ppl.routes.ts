import { Router } from "express";
import multer from "multer";

import {
  listAssignmentsController,
  listUploadsController,
  uploadDataController,
} from "@/controllers/ppl-controller";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024,
  },
});

export const pplRouter = Router();

pplRouter.get("/assignments", listAssignmentsController);
pplRouter.get("/uploads", listUploadsController);
pplRouter.post("/uploads", upload.single("file"), uploadDataController);
