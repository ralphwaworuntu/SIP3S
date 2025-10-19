import { logger } from "@/utils/logger";
export const errorHandler = (error, _req, res, _next) => {
    void _next;
    logger.error({ err: error }, "Terjadi kesalahan tak terduga");
    res.status(500).json({ message: "Terjadi kesalahan pada server", detail: error?.message });
};
