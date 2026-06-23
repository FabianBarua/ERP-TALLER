import { Request, Response } from "express";
import { ClientesService } from "./clientes.service.ts";

export class ClientesController {
  private clientesService: ClientesService;

  constructor() {
    this.clientesService = new ClientesService();
  }

  getAll = async (req: Request, res: Response) => {
    try {
      const clientes = await this.clientesService.getAllClientes();
      res.json(clientes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener clientes" });
    }
  };

  getById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cliente = await this.clientesService.getById(id);
      if (!cliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.json(cliente);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al obtener cliente" });
    }
  };

  create = async (req: Request, res: Response) => {
    try {
      const cliente = req.body;
      const newCliente = await this.clientesService.create(cliente);
      res.status(201).json(newCliente);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al crear cliente" });
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const cliente = req.body;
      const updatedCliente = await this.clientesService.update(id, cliente);
      if (!updatedCliente) {
        return res.status(404).json({ message: "Cliente no encontrado" });
      }
      res.json(updatedCliente);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al actualizar cliente" });
    }
  };

  delete = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await this.clientesService.delete(id);
      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error al eliminar cliente" });
    }
  };
}
