import { Request, Response } from "express";
import { PresupuestosService } from "./presupuestos.service.ts";

export class PresupuestosController {
  private presupuestosService: PresupuestosService;

  constructor() {
    this.presupuestosService = new PresupuestosService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const presupuestos = await this.presupuestosService.getAll();
      res.json(presupuestos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener presupuestos" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const presupuesto = await this.presupuestosService.getById(id);
      if (!presupuesto) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      res.json(presupuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener presupuesto" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const presupuesto = req.body;
      const newPresupuesto = await this.presupuestosService.create(presupuesto);
      res.status(201).json(newPresupuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear presupuesto" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const presupuesto = req.body;
      const updatedPresupuesto = await this.presupuestosService.update(id, presupuesto);
      if (!updatedPresupuesto) {
        return res.status(404).json({ message: "Presupuesto no encontrado" });
      }
      res.json(updatedPresupuesto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar presupuesto" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.presupuestosService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar presupuesto" });
    }
  };
}
