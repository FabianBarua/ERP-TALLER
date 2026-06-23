import { Request, Response } from "express";
import { OrdenesService } from "./ordenes.service.ts";

export class OrdenesController {
  private ordenesService: OrdenesService;

  constructor() {
    this.ordenesService = new OrdenesService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const ordenes = await this.ordenesService.getAll();
      res.json(ordenes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener ordenes" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const orden = await this.ordenesService.getById(id);
      if (!orden) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      res.json(orden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener orden" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const orden = req.body;
      const newOrden = await this.ordenesService.create(orden);
      res.status(201).json(newOrden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear orden" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const orden = req.body;
      const updatedOrden = await this.ordenesService.update(id, orden);
      if (!updatedOrden) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      res.json(updatedOrden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar orden" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.ordenesService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar orden" });
    }
  };

  updateStatus = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const updatedOrden = await this.ordenesService.updateStatus(id, status);
      if (!updatedOrden) {
        return res.status(404).json({ message: "Orden no encontrada" });
      }
      res.json(updatedOrden);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar estado de la orden" });
    }
  };
}
