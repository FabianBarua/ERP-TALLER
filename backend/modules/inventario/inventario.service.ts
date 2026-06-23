import { InventarioRepository } from "./inventario.repository.ts";

export class InventarioService {
  private inventarioRepository: InventarioRepository;

  constructor() {
    this.inventarioRepository = new InventarioRepository();
  }

  async getAll() {
    return await this.inventarioRepository.findAll();
  }

  async getStockBajo() {
    return await this.inventarioRepository.findStockBajo();
  }

  async getById(id: string) {
    return await this.inventarioRepository.findById(id);
  }

  async create(repuesto: any) {
    return await this.inventarioRepository.create(repuesto);
  }

  async update(id: string, repuesto: any) {
    return await this.inventarioRepository.update(id, repuesto);
  }

  async delete(id: string) {
    return await this.inventarioRepository.delete(id);
  }
}
