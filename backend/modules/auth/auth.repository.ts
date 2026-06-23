import { pool } from "../../config/db.ts";

export class AuthRepository {
  async findByEmail(email: string) {
    const { rows } = await pool.query(
      'SELECT id, nombre, email, password_hash as "passwordHash", rol, activo, created_at as "createdAt" FROM usuarios WHERE email = $1',
      [email]
    );
    return rows[0];
  }
}
