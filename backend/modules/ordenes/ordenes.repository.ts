import { pool } from "../../config/db.ts";

export class OrdenesRepository {
  async findAll() {
    const { rows } = await pool.query(`
      SELECT 
        id, order_number as "orderNumber", vehicle_id as "vehicleId", client_id as "clientId", 
        status, created_at as "createdAt", estimated_delivery_at as "estimatedDeliveryAt", 
        mileage, fuel_level as "fuelLevel", description, images, labor_cost as "laborCost", 
        total_cost as "totalCost", notes
      FROM ordenes_trabajo
      ORDER BY created_at DESC
    `);

    for (const orden of rows) {
      orden.tasks = await this.getTasksByOrderId(orden.id);
      orden.partsUsed = await this.getPartsUsedByOrderId(orden.id);
      if (orden.images) {
         try {
             orden.images = JSON.parse(orden.images);
         } catch(e) {
             orden.images = [orden.images];
         }
      } else {
          orden.images = [];
      }
    }

    return rows;
  }

  async findById(id: string) {
    const { rows } = await pool.query(`
      SELECT 
        id, order_number as "orderNumber", vehicle_id as "vehicleId", client_id as "clientId", 
        status, created_at as "createdAt", estimated_delivery_at as "estimatedDeliveryAt", 
        mileage, fuel_level as "fuelLevel", description, images, labor_cost as "laborCost", 
        total_cost as "totalCost", notes
      FROM ordenes_trabajo WHERE id = $1
    `, [id]);
    
    if (rows.length === 0) return null;
    
    const orden = rows[0];
    orden.tasks = await this.getTasksByOrderId(orden.id);
    orden.partsUsed = await this.getPartsUsedByOrderId(orden.id);
    if (orden.images) {
        try {
            orden.images = JSON.parse(orden.images);
        } catch(e) {
            orden.images = [orden.images];
        }
    } else {
        orden.images = [];
    }

    return orden;
  }

  private async getTasksByOrderId(orderId: string) {
    const { rows } = await pool.query(`
      SELECT id, name, description, hours, cost_per_hour as "costPerHour", status 
      FROM tareas_orden WHERE order_id = $1
    `, [orderId]);
    return rows;
  }

  private async getPartsUsedByOrderId(orderId: string) {
    const { rows } = await pool.query(`
      SELECT id, part_id as "partId", name, quantity, price 
      FROM partes_usadas WHERE order_id = $1
    `, [orderId]);
    return rows;
  }

  async create(orden: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { 
        orderNumber, vehicleId, clientId, status, estimatedDeliveryAt, 
        mileage, fuelLevel, description, images, laborCost, totalCost, notes,
        tasks, partsUsed 
      } = orden;

      const imagesStr = Array.isArray(images) ? JSON.stringify(images) : null;

      const { rows } = await client.query(`
        INSERT INTO ordenes_trabajo 
          (order_number, vehicle_id, client_id, status, estimated_delivery_at, mileage, fuel_level, description, images, labor_cost, total_cost, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id, order_number as "orderNumber", vehicle_id as "vehicleId", client_id as "clientId", 
        status, created_at as "createdAt", estimated_delivery_at as "estimatedDeliveryAt", 
        mileage, fuel_level as "fuelLevel", description, images, labor_cost as "laborCost", 
        total_cost as "totalCost", notes
      `, [orderNumber, vehicleId, clientId, status || 'no_iniciado', estimatedDeliveryAt, mileage, fuelLevel, description, imagesStr, laborCost || 0, totalCost || 0, notes]);

      const newOrden = rows[0];

      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await client.query(`
            INSERT INTO tareas_orden (order_id, name, description, hours, cost_per_hour, status)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [newOrden.id, task.name, task.description, task.hours, task.costPerHour, task.status || 'pendiente']);
        }
      }

      if (partsUsed && partsUsed.length > 0) {
        for (const part of partsUsed) {
          await client.query(`
            INSERT INTO partes_usadas (order_id, part_id, name, quantity, price)
            VALUES ($1, $2, $3, $4, $5)
          `, [newOrden.id, part.partId, part.name, part.quantity, part.price]);

          // Descontar stock
          await client.query(`
            UPDATE repuestos SET stock = stock - $1 WHERE id = $2
          `, [part.quantity, part.partId]);
        }
      }

      await client.query('COMMIT');
      return await this.findById(newOrden.id);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async update(id: string, orden: any) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { 
        orderNumber, vehicleId, clientId, status, estimatedDeliveryAt, 
        mileage, fuelLevel, description, images, laborCost, totalCost, notes,
        tasks, partsUsed 
      } = orden;

      const imagesStr = Array.isArray(images) ? JSON.stringify(images) : null;

      await client.query(`
        UPDATE ordenes_trabajo 
        SET order_number = $1, vehicle_id = $2, client_id = $3, status = $4, estimated_delivery_at = $5, 
            mileage = $6, fuel_level = $7, description = $8, images = $9, labor_cost = $10, total_cost = $11, notes = $12
        WHERE id = $13
      `, [orderNumber, vehicleId, clientId, status, estimatedDeliveryAt, mileage, fuelLevel, description, imagesStr, laborCost, totalCost, notes, id]);

      // Simple implementation for update: delete old tasks/parts and insert new ones
      // In a real app, you might want to diff them to avoid deleting tasks that are completed, etc.
      
      // Revert stock for old parts
      const oldParts = await this.getPartsUsedByOrderId(id);
      for (const part of oldParts) {
        await client.query(`UPDATE repuestos SET stock = stock + $1 WHERE id = $2`, [part.quantity, part.partId]);
      }

      await client.query(`DELETE FROM tareas_orden WHERE order_id = $1`, [id]);
      await client.query(`DELETE FROM partes_usadas WHERE order_id = $1`, [id]);

      if (tasks && tasks.length > 0) {
        for (const task of tasks) {
          await client.query(`
            INSERT INTO tareas_orden (order_id, name, description, hours, cost_per_hour, status)
            VALUES ($1, $2, $3, $4, $5, $6)
          `, [id, task.name, task.description, task.hours, task.costPerHour, task.status || 'pendiente']);
        }
      }

      if (partsUsed && partsUsed.length > 0) {
        for (const part of partsUsed) {
          await client.query(`
            INSERT INTO partes_usadas (order_id, part_id, name, quantity, price)
            VALUES ($1, $2, $3, $4, $5)
          `, [id, part.partId, part.name, part.quantity, part.price]);

          // Descontar stock
          await client.query(`
            UPDATE repuestos SET stock = stock - $1 WHERE id = $2
          `, [part.quantity, part.partId]);
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
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Revert stock for parts before deleting
      const parts = await this.getPartsUsedByOrderId(id);
      for (const part of parts) {
        await client.query(`UPDATE repuestos SET stock = stock + $1 WHERE id = $2`, [part.quantity, part.partId]);
      }

      // tareas and partes_usadas will be deleted by ON DELETE CASCADE
      await client.query('DELETE FROM ordenes_trabajo WHERE id = $1', [id]);
      
      await client.query('COMMIT');
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: string, status: string) {
    const { rows } = await pool.query(`
      UPDATE ordenes_trabajo SET status = $1 WHERE id = $2 
      RETURNING id, order_number as "orderNumber", vehicle_id as "vehicleId", client_id as "clientId", 
        status, created_at as "createdAt", estimated_delivery_at as "estimatedDeliveryAt", 
        mileage, fuel_level as "fuelLevel", description, images, labor_cost as "laborCost", 
        total_cost as "totalCost", notes
    `, [status, id]);
    
    if(rows.length === 0) return null;
    
    return await this.findById(id);
  }
}
