import { Router } from "express";
import { asyncHandler } from "@/middleware/async-handler";
import { createReportController, listReportsController } from "@/controllers/report-controller";
export const reportRouter = Router();
reportRouter.get("/", asyncHandler(listReportsController));
reportRouter.post("/", asyncHandler(createReportController));
