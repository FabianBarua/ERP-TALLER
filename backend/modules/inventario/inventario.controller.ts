import { Request, Response } from "express";
import { InventarioService } from "./inventario.service.ts";

export class InventarioController {
  private inventarioService: InventarioService;

  constructor() {
    this.inventarioService = new InventarioService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const repuestos = await this.inventarioService.getAll();
      res.json(repuestos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener inventario" });
    }
  };

  getStockBajo = async (req: Request, res: Response) => {
    try {
      const repuestos = await this.inventarioService.getStockBajo();
      res.json(repuestos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener stock bajo" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const repuesto = await this.inventarioService.getById(id);
      if (!repuesto) {
        return res.status(404).json({ message: "Repuesto no encontrado" });
      }
      res.json(repuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener repuesto" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const repuesto = req.body;
      const newRepuesto = await this.inventarioService.create(repuesto);
      res.status(201).json(newRepuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear repuesto" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const repuesto = req.body;
      const updatedRepuesto = await this.inventarioService.update(id, repuesto);
      if (!updatedRepuesto) {
        return res.status(404).json({ message: "Repuesto no encontrado" });
      }
      res.json(updatedRepuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar repuesto" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.inventarioService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar repuesto" });
    }
  };
}
