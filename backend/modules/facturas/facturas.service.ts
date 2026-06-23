import { FacturasRepository } from "./facturas.repository.ts";
import { OrdenesRepository } from "../ordenes/ordenes.repository.ts";

export class FacturasService {
  private facturasRepository: FacturasRepository;
  private ordenesRepository: OrdenesRepository;

  constructor() {
    this.facturasRepository = new FacturasRepository();
    this.ordenesRepository = new OrdenesRepository();
  }

  async getAll() {
    return await this.facturasRepository.findAll();
  }

  async getById(id: string) {
    return await this.facturasRepository.findById(id);
  }

  async create(factura: any) {
    // Calculo automático de montos
    const orden = await this.ordenesRepository.findById(factura.orderId);
    if (!orden) {
      throw new Error("Orden no encontrada");
    }

    const discount = factura.discount || 0;
    const subtotal = orden.totalCost - discount;
    const taxes = subtotal * 0.10;
    const total = subtotal + taxes;

    factura.subtotal = subtotal;
    factura.taxes = taxes;
    factura.total = total;

    return await this.facturasRepository.create(factura);
  }

  async update(id: string, factura: any) {
    return await this.facturasRepository.update(id, factura);
  }

  async delete(id: string) {
    return await this.facturasRepository.delete(id);
  }
}
