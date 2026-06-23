import { PresupuestosRepository } from "./presupuestos.repository.ts";

export class PresupuestosService {
  private presupuestosRepository: PresupuestosRepository;

  constructor() {
    this.presupuestosRepository = new PresupuestosRepository();
  }

  async getAll() {
    return await this.presupuestosRepository.findAll();
  }

  async getById(id: string) {
    return await this.presupuestosRepository.findById(id);
  }

  async create(presupuesto: any) {
    return await this.presupuestosRepository.create(presupuesto);
  }

  async update(id: string, presupuesto: any) {
    return await this.presupuestosRepository.update(id, presupuesto);
  }

  async delete(id: string) {
    return await this.presupuestosRepository.delete(id);
  }
}
