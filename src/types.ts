export type OrderStatus = 'no_iniciado' | 'en_proceso' | 'congelado' | 'terminado';

export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  taxId: string; // DNI / RUT / RFC
  address?: string;
  createdAt: string;
}

export interface Vehiculo {
  id: string;
  brand: string;
  model: string;
  year: number;
  engine: string;
  plate: string; // Patente / Patente / Placa
  color: string;
  ownerId: string; // Links to Cliente
}

export interface TaskItem {
  id: string;
  name: string;
  description: string;
  hours: number;
  costPerHour: number; // For custom service labor cost estimation
  status: 'pendiente' | 'completada';
}

export interface PartUsage {
  partId: string; // Links to Repuesto
  name: string;
  quantity: number;
  price: number;
}

export interface OrdenTrabajo {
  id: string;
  orderNumber: string; // Short ID, e.g. "OT-1024"
  vehicleId: string;
  clientId: string;
  status: OrderStatus;
  createdAt: string;
  estimatedDeliveryAt?: string;
  mileage: number;
  fuelLevel: 'Vacío' | '1/4' | '1/2' | '3/4' | 'Lleno';
  description: string; // Initial complaints/symptoms
  images?: string[]; // array of base64 images
  tasks: TaskItem[];
  partsUsed: PartUsage[];
  laborCost: number; // Base fee / diagnosis fee
  totalCost: number;
  notes: string; // Internal shop notes
}

export interface Repuesto {
  id: string;
  code: string;
  name: string;
  category: string;
  stock: number;
  minStock: number;
  cost: number;
  price: number;
  brandCompat: string; // e.g. "Toyota, Hyundai, Ford" or "Universal"
  carModels?: string;
  yearCompat?: string;
  location?: string;
}

export interface Factura {
  id: string;
  invoiceNumber: string; // e.g. "FC-4012"
  orderId: string;
  clientId: string;
  issueDate: string;
  paymentMethod: 'Efectivo' | 'Transferencia' | 'Tarjeta de Crédito/Débito';
  status: 'pendiente' | 'pagada' | 'anulada';
  discount: number;
  subtotal: number;
  taxes: number; // IVA or local tax
  total: number;
}

export interface Presupuesto {
  id: string;
  quoteNumber: string;
  clientName: string;
  vehicleInfo: string;
  items: Array<{ id: string; description: string; quantity: number; unitPrice: number }>;
  total: number;
  issueDate: string;
}

export interface AIDiagnosticResult {
  possibleCauses: Array<{
    title: string;
    description: string;
    severity: 'Alta' | 'Media' | 'Baja';
    probability: number; // 0-100
  }>;
  recommendedTasks: Array<{
    name: string;
    description: string;
    estimatedHours: number;
    difficulty: 'Fácil' | 'Moderada' | 'Compleja';
  }>;
  suggestedParts: Array<{
    name: string;
    category: string;
    estimatedCost: number;
  }>;
  warningMessage: string;
}
