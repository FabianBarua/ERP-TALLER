import { pool } from "../../config/db.ts";

export class PresupuestosRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, quote_number as "quoteNumber", client_name as "clientName", vehicle_info as "vehicleInfo", 
             total, issue_date as "issueDate" 
      FROM presupuestos ORDER BY issue_date DESC
    `);
    
    for (const p of rows) {
      p.items = await this.getItemsByPresupuestoId(p.id);
    }
    
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query(`
      SELECT id, quote_number as "quoteNumber", client_name as "clientName", vehicle_info as "vehicleInfo", 
             total, issue_date as "issueDate" 
      FROM presupuestos WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const p = rows[0];
    p.items = await this.getItemsByPresupuestoId(p.id);
    return p;
  }

  private async getItemsByPresupuestoId(presupuestoId: string) {
    const { rows } = await pool.query(`
      SELECT id, description, quantity, unit_price as "unitPrice" 
      FROM presupuesto_items WHERE presupuesto_id = $1
    `, [presupuestoId]);
    return rows;
  }

  async create(presupuesto: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { quoteNumber, clientName, vehicleInfo, items, total } = presupuesto;
      
      const { rows } = await client.query(`
        INSERT INTO presupuestos (quote_number, client_name, vehicle_info, total)
        VALUES ($1, $2, $3, $4)
        RETURNING id, quote_number as "quoteNumber", client_name as "clientName", vehicle_info as "vehicleInfo", 
             total, issue_date as "issueDate"
      `, [quoteNumber, clientName, vehicleInfo, total]);
      
      const newPresupuesto = rows[0];
      
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(`
            INSERT INTO presupuesto_items (presupuesto_id, description, quantity, unit_price)
            VALUES ($1, $2, $3, $4)
          `, [newPresupuesto.id, item.description, item.quantity, item.unitPrice]);
        }
      }
      
      await client.query('COMMIT');
      return await this.findById(newPresupuesto.id);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async update(id: string, presupuesto: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const { quoteNumber, clientName, vehicleInfo, items, total } = presupuesto;
      
      await client.query(`
        UPDATE presupuestos 
        SET quote_number = $1, client_name = $2, vehicle_info = $3, total = $4
        WHERE id = $5
      `, [quoteNumber, clientName, vehicleInfo, total, id]);
      
      await client.query(`DELETE FROM presupuesto_items WHERE presupuesto_id = $1`, [id]);
      
      if (items && items.length > 0) {
        for (const item of items) {
          await client.query(`
            INSERT INTO presupuesto_items (presupuesto_id, description, quantity, unit_price)
            VALUES ($1, $2, $3, $4)
          `, [id, item.description, item.quantity, item.unitPrice]);
        }
      }
      
      await client.query('COMMIT');
      return await this.findById(id);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async delete(id: string) {
    // cascade takes care of items
    await pool.query('DELETE FROM presupuestos WHERE id = $1', [id]);
  }
}
