import { Pool } from "pg";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

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
    
    // Asegurar que el usuario admin tiene la contraseña admin
    const passwordHash = await bcrypt.hash("admin", 10);
    
    // Crear o actualizar usuario 'admin'
    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, rol = $4, activo = true
    `, ["Administrador", "admin", passwordHash, "admin"]);

    // Crear o actualizar usuario 'admin@taller.com' también con contraseña 'admin' para mayor robustez
    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email) 
      DO UPDATE SET password_hash = $3, rol = $4, activo = true
    `, ["Administrador", "admin@taller.com", passwordHash, "admin"]);

    console.log("Usuarios admin creados/actualizados exitosamente con contraseña 'admin'");
    
    client.release();
  } catch (err) {
    console.error("Error al conectar o inicializar usuarios en PostgreSQL:", err);
  }
};
