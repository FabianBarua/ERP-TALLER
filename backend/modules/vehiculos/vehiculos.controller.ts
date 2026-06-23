import { Request, Response } from "express";
import { VehiculosService } from "./vehiculos.service.ts";

export class VehiculosController {
  private vehiculosService: VehiculosService;

  constructor() {
    this.vehiculosService = new VehiculosService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const { clienteId } = req.query;
      let vehiculos;
      if (clienteId) {
        vehiculos = await this.vehiculosService.getByClienteId(clienteId as string);
      } else {
        vehiculos = await this.vehiculosService.getAllVehiculos();
      }
      res.json(vehiculos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener vehiculos" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vehiculo = await this.vehiculosService.getById(id);
      if (!vehiculo) {
        return res.status(404).json({ message: "Vehículo no encontrado" });
      }
      res.json(vehiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener vehiculo" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const vehiculo = req.body;
      const newVehiculo = await this.vehiculosService.create(vehiculo);
      res.status(201).json(newVehiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear vehiculo" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const vehiculo = req.body;
      const updatedVehiculo = await this.vehiculosService.update(id, vehiculo);
      if (!updatedVehiculo) {
        return res.status(404).json({ message: "Vehículo no encontrado" });
      }
      res.json(updatedVehiculo);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar vehiculo" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.vehiculosService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar vehiculo" });
    }
  };
}
