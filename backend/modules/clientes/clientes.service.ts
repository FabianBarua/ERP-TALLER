import { ClientesRepository } from "./clientes.repository.ts";

export class ClientesService {
  private clientesRepository: ClientesRepository;

  constructor() {
    this.clientesRepository = new ClientesRepository();
  }

  async getAllClientes() {
    return await this.clientesRepository.findAll();
  }

  async getById(id: string) {
    return await this.clientesRepository.findById(id);
  }

  async create(cliente: any) {
    return await this.clientesRepository.create(cliente);
  }

  async update(id: string, cliente: any) {
    return await this.clientesRepository.update(id, cliente);
  }

  async delete(id: string) {
    return await this.clientesRepository.delete(id);
  }
}
