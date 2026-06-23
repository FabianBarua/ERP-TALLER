import { pool } from "../../config/db.ts";

export class ClientesRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT id, name, email, phone, tax_id as "taxId", address, created_at as "createdAt" FROM clientes ORDER BY name ASC');
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query('SELECT id, name, email, phone, tax_id as "taxId", address, created_at as "createdAt" FROM clientes WHERE id = $1', [id]);
    return rows[0];
  }

  async create(cliente: any) {
    const { name, email, phone, taxId, address } = cliente;
    const { rows } = await pool.query(
      'INSERT INTO clientes (name, email, phone, tax_id, address) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, tax_id as "taxId", address, created_at as "createdAt"',
      [name, email, phone, taxId, address]
    );
    return rows[0];
  }

  async update(id: string, cliente: any) {
    const { name, email, phone, taxId, address } = cliente;
    const { rows } = await pool.query(
      'UPDATE clientes SET name = $1, email = $2, phone = $3, tax_id = $4, address = $5 WHERE id = $6 RETURNING id, name, email, phone, tax_id as "taxId", address, created_at as "createdAt"',
      [name, email, phone, taxId, address, id]
    );
    return rows[0];
  }

  async delete(id: string) {
    await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
  }
}
