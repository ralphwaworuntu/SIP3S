import express from "express";
import cors from "cors";
import { existsSync, mkdirSync } from "fs";
import { join } from "path";

import { env } from "@/config/env";
import { apiRouter } from "@/routes";
import { errorHandler } from "@/middleware/error-handler";
import { logger } from "@/utils/logger";
import { pingDatabase } from "@/config/database";

const app = express();

const uploadsRoot = join(process.cwd(), process.env.UPLOAD_DIR ?? "uploads");
if (!existsSync(uploadsRoot)) {
  mkdirSync(uploadsRoot, { recursive: true });
}

app.use(cors({ origin: env.allowOrigins, credentials: true }));
app.use("/uploads", express.static(uploadsRoot));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/health", async (_req, res) => {
  const db = await pingDatabase();
  res.json({ status: "ok", database: db ? "connected" : "mock" });
});

app.use("/api", apiRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  logger.info(`SIP3S API berjalan di port ${env.port}`);
});
