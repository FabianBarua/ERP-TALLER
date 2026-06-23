import { OrdenesRepository } from "./ordenes.repository.ts";

export class OrdenesService {
  private ordenesRepository: OrdenesRepository;

  constructor() {
    this.ordenesRepository = new OrdenesRepository();
  }

  async getAll() {
    return await this.ordenesRepository.findAll();
  }

  async getById(id: string) {
    return await this.ordenesRepository.findById(id);
  }

  async create(orden: any) {
    return await this.ordenesRepository.create(orden);
  }

  async update(id: string, orden: any) {
    return await this.ordenesRepository.update(id, orden);
  }

  async delete(id: string) {
    return await this.ordenesRepository.delete(id);
  }

  async updateStatus(id: string, status: string) {
    return await this.ordenesRepository.updateStatus(id, status);
  }
}
