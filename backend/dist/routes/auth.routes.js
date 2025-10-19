import { Router } from "express";
import { asyncHandler } from "@/middleware/async-handler";
import { loginController } from "@/controllers/auth-controller";
export const authRouter = Router();
authRouter.post("/login", asyncHandler(loginController));
