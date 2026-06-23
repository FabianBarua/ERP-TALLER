import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "taller_erp",
  password: process.env.DB_PASSWORD || "password",
  port: parseInt(process.env.DB_PORT || "5432"),
});

pool.on("error", (err) => {
  console.error("Error inesperado en PostgreSQL", err);
  process.exit(-1);
});

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("Conectado exitosamente a PostgreSQL");
    client.release();
  } catch (err) {
    console.error("Error al conectar a PostgreSQL:", err);
  }
};
