import "dotenv/config";

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mysql: {
    host: process.env.MYSQL_HOST ?? "localhost",
    user: process.env.MYSQL_USER ?? "root",
    password: process.env.MYSQL_PASSWORD ?? "",
    database: process.env.MYSQL_DATABASE ?? "sip3s",
  },
  allowOrigins: (process.env.ALLOW_ORIGINS ?? "http://localhost:5173").split(","),
};
