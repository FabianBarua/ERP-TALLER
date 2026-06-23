import { Cliente, Vehiculo, Repuesto, OrdenTrabajo, Factura } from './types';

export const INITIAL_CLIENTES: Cliente[] = [
  {
    id: "cli-1",
    name: "Sofía Gómez Valenzuela",
    email: "sofia.gomez@gmail.com",
    phone: "+56 9 8245 1192",
    taxId: "18.234.567-K",
    address: "Av. Providencia 1420, Depto 501, Santiago",
    createdAt: "2026-04-12T10:30:00Z"
  },
  {
    id: "cli-2",
    name: "Carlos Ruiz Jiménez",
    email: "carlos.ruiz.j@outlook.com",
    phone: "+52 55 4120 8931",
    taxId: "RUJC921104-K50",
    address: "Calzada de Tlalpan 422, Col. Portales, CDMX",
    createdAt: "2026-05-15T14:22:00Z"
  },
  {
    id: "cli-3",
    name: "Andrea Ramos Pozzi",
    email: "andrea.ramos@yahoo.com",
    phone: "+54 11 3918 4022",
    taxId: "34.556.778",
    address: "Palermo S/N, Buenos Aires",
    createdAt: "2026-05-20T09:15:00Z"
  }
];

export const INITIAL_VEHICULOS: Vehiculo[] = [
  {
    id: "veh-1",
    brand: "Hyundai",
    model: "Accent Hatchback GL",
    year: 2018,
    engine: "1.4L Kappa DOHC",
    plate: "KJ-YT-44",
    color: "Gris Plata",
    ownerId: "cli-1"
  },
  {
    id: "veh-2",
    brand: "Volkswagen",
    model: "Golf GTI Performance",
    year: 2021,
    engine: "2.0L TSI SOHC",
    plate: "PL-QW-89",
    color: "Rojo Tornado",
    ownerId: "cli-2"
  },
  {
    id: "veh-3",
    brand: "Toyota",
    model: "RAV4 Adventure AWD",
    year: 2019,
    engine: "2.5L Dual VVT-i",
    plate: "AB-889-CD",
    color: "Verde Militar",
    ownerId: "cli-3"
  }
];

export const INITIAL_REPUESTOS: Repuesto[] = [
  {
    id: "rep-1",
    code: "REP-BRA-101",
    name: "Pastillas de freno delanteras (Cerámica)",
    category: "Frenos",
    stock: 12,
    minStock: 5,
    cost: 185000,
    price: 350000,
    brandCompat: "Hyundai, Kia, Mazda"
  },
  {
    id: "rep-2",
    code: "REP-FIL-201",
    name: "Filtro de aceite sintético",
    category: "Filtros",
    stock: 2,
    minStock: 8,
    cost: 45000,
    price: 70000,
    brandCompat: "Universal / Rosca M20"
  },
  {
    id: "rep-3",
    code: "REP-BRA-102",
    name: "Disco de freno delantero ventilado",
    category: "Frenos",
    stock: 6,
    minStock: 4,
    cost: 250000,
    price: 499000,
    brandCompat: "Volkswagen, Audi, Seat"
  },
  {
    id: "rep-4",
    code: "REP-MOT-301",
    name: "Bujía de Iridio Laser (Unidad)",
    category: "Motor",
    stock: 24,
    minStock: 16,
    cost: 12000,
    price: 20000,
    brandCompat: "Toyota, Honda, Nissan"
  },
  {
    id: "rep-5",
    code: "REP-REF-401",
    name: "Bomba de Agua y empaquetadura",
    category: "Refrigeración",
    stock: 1,
    minStock: 3,
    cost: 220000,
    price: 450000,
    brandCompat: "Hyundai, Kia D4FB"
  },
  {
    id: "rep-6",
    code: "REP-LUB-501",
    name: "Aceite Sintético Mobil 1 5W-30 (Litro)",
    category: "Lubricantes",
    stock: 45,
    minStock: 12,
    cost: 65000,
    price: 130000,
    brandCompat: "Universal"
  },
  {
    id: "rep-7",
    code: "REP-FIL-202",
    name: "Filtro de aire de motor de alto flujo",
    category: "Filtros",
    stock: 10,
    minStock: 6,
    cost: 55000,
    price: 110000,
    brandCompat: "Toyota, Suzuki, Subaru"
  }
];

export const INITIAL_ORDENES: OrdenTrabajo[] = [
  {
    id: "ot-1",
    orderNumber: "OT-1001",
    vehicleId: "veh-1",
    clientId: "cli-1",
    status: "no_iniciado",
    createdAt: "2026-05-30T10:00:00Z",
    estimatedDeliveryAt: "2026-06-03T18:00:00Z",
    mileage: 78500,
    fuelLevel: "1/2",
    description: "La clienta reporta ruido chirriante intermitente de metal con metal en las ruedas delanteras al presionar el pedal de freno. Se siente una ligera vibración y el pedal baja más de lo normal.",
    tasks: [
      {
        id: "tsk-1",
        name: "Inspección de frenos y espesores",
        description: "Desmontar ambas ruedas delanteras, verificar desgaste de pastillas y medir espesor de discos con micrómetro.",
        hours: 1.0,
        costPerHour: 80000,
        status: "completada"
      },
      {
        id: "tsk-1b",
        name: "Purga y cambio de líquido de frenos",
        description: "Reemplazar líquido e inspeccionar si hay aire o humedad atrapada en el bombín principal.",
        hours: 1.0,
        costPerHour: 100000,
        status: "pendiente"
      }
    ],
    partsUsed: [],
    laborCost: 120000,
    totalCost: 200000, // 1.0 * 80000 + 120000
    notes: "Efectivamente se detectan pastillas al límite (1.2mm de remanente). Los discos tienen ligera reaba pero están dentro del grosor mínimo de seguridad para rectificado o cambio."
  },
  {
    id: "ot-2",
    orderNumber: "OT-1002",
    vehicleId: "veh-2",
    clientId: "cli-2",
    status: "en_proceso",
    createdAt: "2026-05-28T09:12:00Z",
    estimatedDeliveryAt: "2026-06-02T13:00:00Z",
    mileage: 42100,
    fuelLevel: "3/4",
    description: "Testigo de Check Engine (Falla Motor/Mil) encendido parpadeante. El vehículo tironea en ralentí y pierde potencia significativamente en cuestas arriba.",
    tasks: [
      {
        id: "tsk-2",
        name: "Escaneo computarizado OBD-II integral",
        description: "Escanear códigos activos e insolutos en la ECU. Revisar parámetros de misfire de cilindros en vivo.",
        hours: 1.0,
        costPerHour: 90000,
        status: "completada"
      },
      {
        id: "tsk-3",
        name: "Reemplazo de bujías de encendido",
        description: "Inspección de bobinas y reemplazo del juego completo de Bujías de Iridio por kilometraje.",
        hours: 1.0,
        costPerHour: 100000,
        status: "pendiente"
      }
    ],
    partsUsed: [
      {
        partId: "rep-4",
        name: "Bujía de Iridio Laser (Unidad)",
        quantity: 4,
        price: 20000
      }
    ],
    laborCost: 150000,
    totalCost: 320000 // 1.0 * 90000 + parts (4 * 20000 = 80000) + laborCost (150000) = 320000
    ,notes: "Escáner arrojó DTC P0302: Misfire detectado en cilindro 2. Se intercambió bobina del cilindro 2 al 1 y la falla no se trasladó, lo que descarta bobina. Bujías se encuentran carbonizadas y con luz de electrodos excedida."
  },
  {
    id: "ot-3",
    orderNumber: "OT-1003",
    vehicleId: "veh-3",
    clientId: "cli-3",
    status: "terminado",
    createdAt: "2026-05-25T11:00:00Z",
    estimatedDeliveryAt: "2026-05-25T16:00:00Z",
    mileage: 110200,
    fuelLevel: "1/4",
    description: "Mantenimiento periódico por kilometraje. Cambio de aceite de motor y recambio de filtros de cabina, aire y combustible.",
    tasks: [
      {
        id: "tsk-4",
        name: "Servicio de lubricación integral",
        description: "Drenar aceite usado, reemplazar filtro y rellenar con aceite sintético 5W-30 Mobil 1.",
        hours: 1.0,
        costPerHour: 75000,
        status: "completada"
      },
      {
        id: "tsk-5",
        name: "Inspección general de niveles de fluidos",
        description: "Chequear fluido de frenos, dirección hidráulica, limpiaparabrisas y refrigerante de motor.",
        hours: 1.0,
        costPerHour: 50000,
        status: "completada"
      }
    ],
    partsUsed: [
      {
        partId: "rep-6",
        name: "Aceite Sintético Mobil 1 5W-30 (Litro)",
        quantity: 4,
        price: 130000
      },
      {
        partId: "rep-2",
        name: "Filtro de aceite sintético",
        quantity: 1,
        price: 70000
      }
    ],
    laborCost: 110000,
    totalCost: 825000 // tasks (75000+50000=125000) + parts (4*130000 + 70000 = 590000) + 110000 = 825000
    ,notes: "Se aconseja al cliente revisar amortiguadores traseros en la siguiente visita debido a un leve lagrimeo detectado en el retén hidráulico izquierdo."
  }
];

export const INITIAL_FACTURAS: Factura[] = [
  {
    id: "fac-1",
    invoiceNumber: "FC-1001",
    orderId: "ot-3",
    clientId: "cli-3",
    issueDate: "2026-05-25T16:15:00Z",
    paymentMethod: "Tarjeta de Crédito/Débito",
    status: "pagada",
    discount: 25000,
    subtotal: 800000,
    taxes: 80000, // 10% IVA typical under Ley de Paraguay
    total: 880000
  }
];
