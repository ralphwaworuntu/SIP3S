import { v4 as uuid } from "uuid";
import { getPool, pingDatabase } from "@/config/database";
import { logger } from "@/utils/logger";
import { mockUsers, mockUserPasswords, PASSWORD_PLACEHOLDER } from "@/repositories/mock-storage";
export class AuthService {
    async login(email, password) {
        const useDatabase = await pingDatabase();
        let account = null;
        if (useDatabase) {
            try {
                const pool = getPool();
                const [rows] = await pool.query("SELECT id, email, nama, role, agency, password FROM users WHERE email = ? LIMIT 1", [email]);
                const user = rows.at(0);
                if (user && user.password === password) {
                    account = {
                        id: user.id,
                        email: user.email,
                        nama: user.nama,
                        role: user.role,
                        agency: user.agency ?? undefined,
                    };
                }
            }
            catch (error) {
                logger.error({ err: error }, "Gagal mengambil user dari database, fallback mock");
            }
        }
        if (!account) {
            const mock = mockUsers[email];
            const expectedPassword = mockUserPasswords[email] ?? PASSWORD_PLACEHOLDER;
            if (!mock || password !== expectedPassword) {
                return null;
            }
            account = mock;
        }
        return {
            token: `token-${account.role}-${uuid()}`,
            user: account,
        };
    }
}
