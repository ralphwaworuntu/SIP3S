import { Router } from "express";

import { authRouter } from "@/routes/auth.routes";
import { taskRouter } from "@/routes/task.routes";
import { reportRouter } from "@/routes/report.routes";
import { pplRouter } from "@/routes/ppl.routes";
import { bhabinRouter } from "@/routes/bhabin.routes";
import { superAdminRoutes } from "@/routes/super-admin.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/tasks", taskRouter);
apiRouter.use("/reports", reportRouter);
apiRouter.use("/ppl", pplRouter);
apiRouter.use("/bhabin", bhabinRouter);
apiRouter.use("/super-admin", superAdminRoutes);
