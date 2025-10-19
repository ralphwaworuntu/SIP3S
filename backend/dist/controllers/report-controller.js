import Joi from "joi";
import { ReportService } from "@/services/report-service";
const service = new ReportService();
export const listReportsController = async (_req, res) => {
    const reports = await service.list();
    res.json(reports);
};
const createSchema = Joi.object({
    id: Joi.string().uuid().optional().strip(),
    komoditas: Joi.string().required(),
    kuotaTersalurkan: Joi.number().min(0).max(100).required(),
    lokasi: Joi.object({
        latitude: Joi.number().required(),
        longitude: Joi.number().required(),
        alamat: Joi.string().required(),
    }).required(),
    fotoUrl: Joi.string().allow("", null).optional(),
    catatan: Joi.string().required(),
    authorId: Joi.string().required(),
    status: Joi.string().valid("pending", "terkirim", "gagal").default("terkirim"),
    createdAt: Joi.string().isoDate().optional().strip(),
}).options({ stripUnknown: true });
export const createReportController = async (req, res) => {
    const { error, value } = createSchema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const report = await service.create(value);
    res.status(201).json(report);
};
