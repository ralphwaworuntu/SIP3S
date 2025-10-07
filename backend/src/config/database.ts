import mysql from "mysql2/promise";

import { env } from "@/config/env";
import { logger } from "@/utils/logger";

let pool: mysql.Pool | null = null;

export const getPool = (): mysql.Pool => {
  if (!pool) {
    pool = mysql.createPool({
      host: env.mysql.host,
      user: env.mysql.user,
      password: env.mysql.password,
      database: env.mysql.database,
      waitForConnections: true,
      connectionLimit: 10,
    });
    pool.getConnection()
      .then((conn) => {
        conn.release();
        logger.info("Koneksi MySQL siap digunakan");
      })
      .catch((error) => {
        logger.error({ err: error }, "Tidak dapat terhubung ke MySQL. Menggunakan mode mock");
      });
  }
  return pool;
};

export const pingDatabase = async () => {
  try {
    const connection = await getPool().getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch (error) {
    logger.warn({ err: error }, "Ping database gagal");
    return false;
  }
};
