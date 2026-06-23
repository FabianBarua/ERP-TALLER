import { VehiculosRepository } from "./vehiculos.repository.ts";

export class VehiculosService {
  private vehiculosRepository: VehiculosRepository;

  constructor() {
    this.vehiculosRepository = new VehiculosRepository();
  }

  async getAllVehiculos() {
    return await this.vehiculosRepository.findAll();
  }

  async getByClienteId(clienteId: string) {
    return await this.vehiculosRepository.findByClienteId(clienteId);
  }

  async getById(id: string) {
    return await this.vehiculosRepository.findById(id);
  }

  async create(vehiculo: any) {
    return await this.vehiculosRepository.create(vehiculo);
  }

  async update(id: string, vehiculo: any) {
    return await this.vehiculosRepository.update(id, vehiculo);
  }

  async delete(id: string) {
    return await this.vehiculosRepository.delete(id);
  }
}
