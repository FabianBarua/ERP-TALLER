import { Request, Response } from "express";
import { FacturasService } from "./facturas.service.ts";

export class FacturasController {
  private facturasService: FacturasService;

  constructor() {
    this.facturasService = new FacturasService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const facturas = await this.facturasService.getAll();
      res.json(facturas);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener facturas" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const factura = await this.facturasService.getById(id);
      if (!factura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
      res.json(factura);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener factura" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const factura = req.body;
      const newFactura = await this.facturasService.create(factura);
      res.status(201).json(newFactura);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear factura" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const factura = req.body;
      const updatedFactura = await this.facturasService.update(id, factura);
      if (!updatedFactura) {
        return res.status(404).json({ message: "Factura no encontrada" });
      }
      res.json(updatedFactura);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar factura" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.facturasService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar factura" });
    }
  };
}
