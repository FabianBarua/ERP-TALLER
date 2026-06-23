import { pool } from "../../config/db.ts";

export class UsuariosRepository {
  // Listar todos los usuarios sin exponer la contraseña hasheada
  async findAll() {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, rol, activo, created_at as "createdAt" FROM usuarios ORDER BY created_at DESC'
    );
    return rows;
  }

  // Buscar por email
  async findByEmail(email: string) {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, password_hash as "passwordHash", rol, activo, created_at as "createdAt" FROM usuarios WHERE email = $1',
      [email]
    );
    return rows[0];
  }

  // Crear un nuevo usuario
  async create(nombre: string, email: string, passwordHash: string, rol: string) {
    const { rows } = await pool.query(
      'INSERT INTO usuarios (nombre, email, password_hash, rol, activo) VALUES ($1, $2, $3, $4, true) RETURNING id, nombre, email, rol, activo, created_at as "createdAt"',
      [nombre, email, passwordHash, rol]
    );
    return rows[0];
  }
}
