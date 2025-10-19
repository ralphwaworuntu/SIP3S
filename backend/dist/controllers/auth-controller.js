import Joi from "joi";
import { AuthService } from "@/services/auth-service";
const service = new AuthService();
const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    tipe: Joi.string().valid("admin", "user").required(),
});
export const loginController = async (req, res) => {
    const { error, value } = schema.validate(req.body);
    if (error) {
        res.status(400).json({ message: error.message });
        return;
    }
    const result = await service.login(value.email, value.password);
    if (!result) {
        res.status(401).json({ message: "Email atau kata sandi salah" });
        return;
    }
    res.json(result);
};
