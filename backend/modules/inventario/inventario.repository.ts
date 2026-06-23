import { pool } from "../../config/db.ts";

export class InventarioRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, code, name, category, stock, min_stock as "minStock", cost, price, 
             brand_compat as "brandCompat", car_models as "carModels", year_compat as "yearCompat", location 
      FROM repuestos ORDER BY name ASC
    `);
    return rows;
  }

  async findStockBajo() {
    const { rows } = await pool.query(`
      SELECT id, code, name, category, stock, min_stock as "minStock", cost, price, 
             brand_compat as "brandCompat", car_models as "carModels", year_compat as "yearCompat", location 
      FROM repuestos WHERE stock <= min_stock ORDER BY stock ASC
    `);
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query(`
      SELECT id, code, name, category, stock, min_stock as "minStock", cost, price, 
             brand_compat as "brandCompat", car_models as "carModels", year_compat as "yearCompat", location 
      FROM repuestos WHERE id = $1
    `, [id]);
    return rows[0];
  }

  async create(repuesto: any) {
    const { code, name, category, stock, minStock, cost, price, brandCompat, carModels, yearCompat, location } = repuesto;
    const { rows } = await pool.query(`
      INSERT INTO repuestos (code, name, category, stock, min_stock, cost, price, brand_compat, car_models, year_compat, location)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, code, name, category, stock, min_stock as "minStock", cost, price, 
             brand_compat as "brandCompat", car_models as "carModels", year_compat as "yearCompat", location
    `, [code, name, category, stock || 0, minStock || 0, cost, price, brandCompat, carModels, yearCompat, location]);
    return rows[0];
  }

  async update(id: string, repuesto: any) {
    const { code, name, category, stock, minStock, cost, price, brandCompat, carModels, yearCompat, location } = repuesto;
    const { rows } = await pool.query(`
      UPDATE repuestos 
      SET code = $1, name = $2, category = $3, stock = $4, min_stock = $5, cost = $6, price = $7, 
          brand_compat = $8, car_models = $9, year_compat = $10, location = $11
      WHERE id = $12
      RETURNING id, code, name, category, stock, min_stock as "minStock", cost, price, 
             brand_compat as "brandCompat", car_models as "carModels", year_compat as "yearCompat", location
    `, [code, name, category, stock, minStock, cost, price, brandCompat, carModels, yearCompat, location, id]);
    return rows[0];
  }

  async delete(id: string) {
    await pool.query('DELETE FROM repuestos WHERE id = $1', [id]);
  }
}
