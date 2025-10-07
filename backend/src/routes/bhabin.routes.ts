import { Router } from "express";

import {
  createBhabinAccountController,
  deleteBhabinAccountController,
  listBhabinAccountsController,
  updateBhabinAccountController,
} from "@/controllers/bhabin-controller";

export const bhabinRouter = Router();

bhabinRouter.get("/accounts", listBhabinAccountsController);
bhabinRouter.post("/accounts", createBhabinAccountController);
bhabinRouter.put("/accounts/:id", updateBhabinAccountController);
bhabinRouter.delete("/accounts/:id", deleteBhabinAccountController);
