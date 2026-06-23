import { pool } from "../../config/db.ts";

export class FacturasRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT id, invoice_number as "invoiceNumber", order_id as "orderId", client_id as "clientId", 
             issue_date as "issueDate", payment_method as "paymentMethod", status, discount, subtotal, taxes, total 
      FROM facturas ORDER BY issue_date DESC
    `);
    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query(`
      SELECT id, invoice_number as "invoiceNumber", order_id as "orderId", client_id as "clientId", 
             issue_date as "issueDate", payment_method as "paymentMethod", status, discount, subtotal, taxes, total 
      FROM facturas WHERE id = $1
    `, [id]);
    return rows[0];
  }

  async create(factura: any) {
    const { invoiceNumber, orderId, clientId, paymentMethod, status, discount, subtotal, taxes, total } = factura;
    const { rows } = await pool.query(`
      INSERT INTO facturas (invoice_number, order_id, client_id, payment_method, status, discount, subtotal, taxes, total)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, invoice_number as "invoiceNumber", order_id as "orderId", client_id as "clientId", 
             issue_date as "issueDate", payment_method as "paymentMethod", status, discount, subtotal, taxes, total
    `, [invoiceNumber, orderId, clientId, paymentMethod, status || 'pendiente', discount || 0, subtotal, taxes, total]);
    return rows[0];
  }

  async update(id: string, factura: any) {
    const { invoiceNumber, paymentMethod, status, discount, subtotal, taxes, total } = factura;
    const { rows } = await pool.query(`
      UPDATE facturas 
      SET invoice_number = $1, payment_method = $2, status = $3, discount = $4, subtotal = $5, taxes = $6, total = $7
      WHERE id = $8
      RETURNING id, invoice_number as "invoiceNumber", order_id as "orderId", client_id as "clientId", 
             issue_date as "issueDate", payment_method as "paymentMethod", status, discount, subtotal, taxes, total
    `, [invoiceNumber, paymentMethod, status, discount, subtotal, taxes, total, id]);
    return rows[0];
  }

  async delete(id: string) {
    await pool.query('DELETE FROM facturas WHERE id = $1', [id]);
  }
}
