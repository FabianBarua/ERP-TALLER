import { pool } from "../../config/db.ts";

export class VehiculosRepository {
  async findAll() {
    const { rows } = await pool.query('SELECT id, brand, model, year, engine, plate, color, owner_id as "ownerId" FROM vehiculos');
    return rows;
  }

  async findByClienteId(clienteId: string) {
    const { rows } = await pool.query('SELECT id, brand, model, year, engine, plate, color, owner_id as "ownerId" FROM vehiculos WHERE owner_id = $1', [clienteId]);
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query('SELECT id, brand, model, year, engine, plate, color, owner_id as "ownerId" FROM vehiculos WHERE id = $1', [id]);
    return rows[0];
  }

  async create(vehiculo: any) {
    const { brand, model, year, engine, plate, color, ownerId } = vehiculo;
    const { rows } = await pool.query(
      'INSERT INTO vehiculos (brand, model, year, engine, plate, color, owner_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, brand, model, year, engine, plate, color, owner_id as "ownerId"',
      [brand, model, year, engine, plate, color, ownerId]
    );
    return rows[0];
  }

  async update(id: string, vehiculo: any) {
    const { brand, model, year, engine, plate, color, ownerId } = vehiculo;
    const { rows } = await pool.query(
      'UPDATE vehiculos SET brand = $1, model = $2, year = $3, engine = $4, plate = $5, color = $6, owner_id = $7 WHERE id = $8 RETURNING id, brand, model, year, engine, plate, color, owner_id as "ownerId"',
      [brand, model, year, engine, plate, color, ownerId, id]
    );
    return rows[0];
  }

  async delete(id: string) {
    await pool.query('DELETE FROM vehiculos WHERE id = $1', [id]);
  }
}
