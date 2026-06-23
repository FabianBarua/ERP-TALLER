import { useState, FormEvent } from "react";
import {
  FileText,
  Plus,
  CircleDollarSign,
  CreditCard,
  Printer,
  CheckCircle,
  AlertTriangle,
  Inbox,
  User,
  Car,
  Check,
  Calendar,
  X,
  Trash2,
  Search,
  ArrowLeft,
  ChevronRight,
} from "lucide-react";
import { Cliente, Vehiculo, OrdenTrabajo, Factura } from "../../../types";

interface FacturasViewProps {
  facturas: Factura[];
  ordenes: OrdenTrabajo[];
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  onAddFactura: (
    factura: Omit<Factura, "id" | "invoiceNumber" | "issueDate">,
  ) => void;
  onUpdateStatusFactura: (
    facturaId: string,
    status: "pagada" | "pendiente" | "anulada",
  ) => void;
  onUpdateFactura?: (facturaId: string, updatedData: Partial<Factura>) => void;
  onDeleteFactura?: (facturaId: string) => void;
}

type ViewLevel = "clientes" | "trabajos" | "boleto" | "hoja_orden";

export default function FacturasView({
  facturas,
  ordenes,
  clientes,
  vehiculos,
  onAddFactura,
  onUpdateStatusFactura,
  onUpdateFactura,
  onDeleteFactura,
}: FacturasViewProps) {
  const [viewLevel, setViewLevel] = useState<ViewLevel>("clientes");
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(
    null,
  );
  const [viewingOrderReceiptId, setViewingOrderReceiptId] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // New invoice form states
  const [isCreatingInvoice, setIsCreatingInvoice] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "Efectivo" | "Transferencia" | "Tarjeta de Crédito/Débito"
  >("Efectivo");
  const [discountAmount, setDiscountAmount] = useState(0);
  const [confirmingInvoiceId, setConfirmingInvoiceId] = useState<string | null>(
    null,
  );
  const [confirmingPayOrderId, setConfirmingPayOrderId] = useState<
    string | null
  >(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  // Edit states
  const [isEditingReceipt, setIsEditingReceipt] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState<
    "Efectivo" | "Transferencia" | "Tarjeta de Crédito/Débito"
  >("Efectivo");
  const [editDiscountAmount, setEditDiscountAmount] = useState(0);

  // LEVEL 1: Filtered Clients
  const filteredClientes = clientes.filter((c) => {
    if (!searchQuery) return true;
    return (
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // LEVEL 2: Client specific data
  const clientInvoices = facturas
    .filter((f) => f.clientId === selectedClientId)
    .filter((f) => {
      if (statusFilter === "todos") return true;
      return f.status === statusFilter;
    });

  const clientUnbilledOrders = ordenes.filter((order) => {
    if (order.clientId !== selectedClientId) return false;
    const isAlreadyBilled = facturas.some(
      (f) => f.orderId === order.id && f.status !== "anulada",
    );
    return !isAlreadyBilled;
  });

  // LEVEL 3: Invoice specific data
  const selectedInvoice = facturas.find((f) => f.id === selectedInvoiceId);
  const mainOrder = selectedInvoice
    ? ordenes.find((o) => o.id === selectedInvoice.orderId)
    : null;
  const mainClient = selectedInvoice
    ? clientes.find((c) => c.id === selectedInvoice.clientId)
    : selectedClientId
      ? clientes.find((c) => c.id === selectedClientId)
      : null;
  const mainVehicle = mainOrder
    ? vehiculos.find((v) => v.id === mainOrder.vehicleId)
    : null;

  const handleCreateInvoiceSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedClientId) return;

    const orderObj = ordenes.find((o) => o.id === selectedOrderId);
    if (!orderObj) return;

    const sub = orderObj.totalCost - discountAmount;
    const taxesVal = sub * 0.1; // 10% IVA typical in Paraguay
    const finalTotal = sub + taxesVal;

    onAddFactura({
      orderId: selectedOrderId,
      clientId: selectedClientId,
      paymentMethod,
      discount: Number(discountAmount),
      status: "pendiente",
      subtotal: Math.round(sub),
      taxes: Math.round(taxesVal),
      total: Math.round(finalTotal),
    });

    setSelectedOrderId("");
    setDiscountAmount(0);
    setIsCreatingInvoice(false);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6" id="billing_panel">
      {/* LEVEL 1: CLIENTES */}
      {viewLevel === "clientes" && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col sm:flex-row justify-between gap-4 items-center">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" /> Seleccionar Cliente
              para Caja
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Buscar por nombre o cédula/RUC..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-indigo-500 transition"
              />
            </div>
          </div>

          <div className="space-y-2">
            {filteredClientes.length > 0 ? (
              filteredClientes.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedClientId(c.id);
                    setViewLevel("trabajos");
                    setIsCreatingInvoice(false);
                    setStatusFilter("todos");
                  }}
                  className="bg-white p-4 rounded-xl border border-slate-100 hover:border-indigo-300 hover:shadow-md transition cursor-pointer flex justify-between items-center"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-slate-800 text-sm">
                      {c.name}
                    </h3>
                    <p className="font-mono text-xs text-slate-400">
                      {c.taxId}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {ordenes.filter((o) => o.clientId === c.id).length}{" "}
                      trabajo
                      {ordenes.filter((o) => o.clientId === c.id).length !== 1
                        ? "s"
                        : ""}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider hidden sm:block">
                        Ver Trabajos
                      </span>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-slate-400">
                <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="font-bold">No se encontraron clientes</p>
                <p className="text-xs">Modifique su búsqueda</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* LEVEL 2: TRABAJOS DEL CLIENTE */}
      {viewLevel === "trabajos" && mainClient && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <button
              onClick={() => {
                setViewLevel("clientes");
                setSelectedClientId(null);
              }}
              className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Clientes
            </button>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span className="text-sm font-bold text-slate-800">
                {mainClient.name}
              </span>
            </div>
          </div>

          {/* Create Invoice Section */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" /> Trabajos
                Pendientes de Cobro
              </h3>
            </div>

            {clientUnbilledOrders.length > 0 ? (
              <div className="space-y-2">
                {clientUnbilledOrders.map((order) => {
                  const vehicle = vehiculos.find(
                    (v) => v.id === order.vehicleId,
                  );
                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-4"
                    >
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                              {order.status}
                            </span>
                            <span className="font-mono text-sm font-bold text-slate-800">
                              {Math.round(order.totalCost).toLocaleString(
                                "es-PY",
                              )}{" "}
                              Gs.
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-700 flex items-center gap-2">
                            {vehicle?.brand} {vehicle?.model}
                            <span className="text-[10px] text-slate-500 font-mono uppercase bg-white px-2 py-0.5 rounded shadow-xs border border-slate-100">
                              {vehicle?.plate}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                          <button
                            onClick={() =>
                              setExpandedOrderId(
                                expandedOrderId === order.id ? null : order.id,
                              )
                            }
                            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                          >
                            {expandedOrderId === order.id
                              ? "Ocultar Detalles"
                              : "Detalles"}
                          </button>
                          
                          <button
                            onClick={() => {
                              setViewingOrderReceiptId(order.id);
                              setViewLevel("hoja_orden");
                            }}
                            className="px-4 py-2 bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            Hoja de Orden
                          </button>

                          {confirmingPayOrderId === order.id ? (
                            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg shrink-0">
                              <span className="text-[10px] font-black text-amber-800 flex items-center gap-1">
                                <AlertTriangle className="w-3.5 h-3.5" />
                                ¿Confirmar pago?
                              </span>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  onClick={() => {
                                    setConfirmingPayOrderId(null);
                                    setSelectedOrderId(order.id);
                                    setIsCreatingInvoice(true);
                                  }}
                                  className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[10px] transition cursor-pointer"
                                >
                                  Sí, Pagar
                                </button>
                                <button
                                  onClick={() => setConfirmingPayOrderId(null)}
                                  className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded font-bold text-[10px] transition cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setConfirmingPayOrderId(order.id)}
                              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer shrink-0"
                            >
                              Pagar
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Detalles Expandidos */}
                      {expandedOrderId === order.id && (
                        <div className="p-4 bg-white rounded-lg border border-slate-200 animate-fade-in shadow-xs">
                          <h4 className="font-bold text-xs text-slate-800 mb-3 border-b border-slate-100 pb-2">
                            Servicios del Trabajo
                          </h4>
                          {order.tasks && order.tasks.length > 0 ? (
                            order.tasks.map((s, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between items-center text-xs text-slate-600 mb-2"
                              >
                                <span>{s.name}</span>
                                <span className="font-mono text-slate-800 font-semibold">
                                  {Math.round(s.hours * s.costPerHour).toLocaleString("es-PY")}{" "}
                                  Gs.
                                </span>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-slate-400 italic mb-2">
                              No hay servicios registrados.
                            </p>
                          )}

                          {order.partsUsed && order.partsUsed.length > 0 && (
                            <>
                              <h4 className="font-bold text-xs text-slate-800 mb-3 mt-4 border-b border-slate-100 pb-2">
                                Repuestos Utilizados
                              </h4>
                              {order.partsUsed.map((p, idx) => (
                                <div
                                  key={idx}
                                  className="flex justify-between items-center text-xs text-slate-600 mb-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded text-[10px]">
                                      {p.quantity}x
                                    </span>
                                    <span>{p.name}</span>
                                  </div>
                                  <span className="font-mono text-slate-800 font-semibold">
                                    {Math.round(
                                      p.price * p.quantity,
                                    ).toLocaleString("es-PY")}{" "}
                                    Gs.
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">
                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
                  No tiene trabajos pendientes de cobro
                </span>
              </div>
            )}
          </div>

          {/* Form to generate invoice */}
          {isCreatingInvoice && selectedOrderId && (
            <div className="bg-indigo-50/40 border border-indigo-100 p-6 rounded-2xl space-y-4 animate-fade-in">
              <div className="flex justify-between items-center pb-2 border-b border-indigo-100">
                <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide flex items-center gap-2">
                  <CircleDollarSign className="w-5 h-5" /> Nueva Boleta
                </h3>
                <button
                  onClick={() => setIsCreatingInvoice(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                onSubmit={handleCreateInvoiceSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Método de Pago
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold focus:outline-hidden"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Transferencia">
                      Transferencia Bancaria
                    </option>
                    <option value="Tarjeta de Crédito/Débito">
                      Tarjeta de Crédito/Débito
                    </option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">
                    Descuento Especial (Gs.)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={discountAmount}
                    onChange={(e) =>
                      setDiscountAmount(Number(e.target.value) || 0)
                    }
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    placeholder="0"
                  />
                </div>
                <div className="md:col-span-2 flex justify-end gap-2 pt-2 border-t border-indigo-100">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Emitir Boleta
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Historial facturas del cliente */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-4">
            <div className="flex justify-between items-center sm:flex-row flex-col gap-3">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" /> Boletas
                Emitidas
              </h3>
              <div className="flex gap-1.5">
                {["todos", "pagada", "pendiente", "anulada"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition capitalize cursor-pointer ${
                      statusFilter === status
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }`}
                  >
                    {status === "todos" ? "Todas" : status}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              {clientInvoices.length > 0 ? (
                clientInvoices.map((inv) => {
                  let stampClass =
                    "bg-slate-50 text-slate-600 border-slate-100";
                  if (inv.status === "pagada")
                    stampClass =
                      "bg-emerald-50 text-emerald-600 border-emerald-100";
                  else if (inv.status === "pendiente")
                    stampClass = "bg-amber-50 text-amber-600 border-amber-100";
                  else if (inv.status === "anulada")
                    stampClass = "bg-rose-50 text-rose-600 border-rose-100";

                  return (
                    <div
                      key={inv.id}
                      onClick={() => {
                        setSelectedInvoiceId(inv.id);
                        setViewLevel("boleto");
                      }}
                      className="bg-white p-4 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                    >
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1 rounded">
                          {inv.invoiceNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-bold rounded-lg uppercase tracking-wider ${stampClass}`}
                        >
                          {inv.status}
                        </span>
                        <span className="text-slate-400 font-medium text-xs hidden sm:block">
                          {new Date(inv.issueDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex justify-between sm:justify-end items-center gap-4 w-full sm:w-auto">
                        <span className="font-mono font-bold text-sm text-slate-800">
                          {Math.round(inv.total).toLocaleString("es-PY")} Gs.
                        </span>
                        <span className="text-[10px] text-indigo-500 font-bold uppercase tracking-wider flex items-center gap-1">
                          Ver Boleta <ChevronRight className="w-4 h-4" />
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-6 text-slate-400 text-xs">
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold">
                    No hay boletas generadas para este cliente
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* LEVEL 3: BOLETA */}
      {viewLevel === "boleto" && selectedInvoice && (
        <div className="space-y-6 animate-fade-in max-w-4xl mx-auto block-print-full">
          <button
            onClick={() => {
              setViewLevel("trabajos");
              setSelectedInvoiceId(null);
            }}
            className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs block-print-hide"
          >
            <ArrowLeft className="w-4 h-4" /> Volver a Trabajos y Boletas
          </button>

          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-8 relative">
            {/* Header / Actions (Safe from confirm popup failures) */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 gap-4">
              <div className="space-y-1 block-print-hide">
                <span className="text-xs font-extrabold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                  DETALLE DE AUDITORÍA
                </span>
                <h3 className="text-base font-bold text-slate-800">
                  Boleta de Servicio
                </h3>
              </div>
              <div className="flex flex-wrap gap-2 block-print-hide">
                {confirmingInvoiceId === selectedInvoice.id ? (
                  <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl block-print-hide animate-fade-in">
                    <span className="text-[10px] font-black text-amber-800 flex items-center gap-1 leading-tight">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                      ¿Estás seguro del pago?
                    </span>
                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => {
                          onUpdateStatusFactura(selectedInvoice.id, "pagada");
                          setConfirmingInvoiceId(null);
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition cursor-pointer select-none"
                      >
                        Sí, cobrar
                      </button>
                      <button
                        onClick={() => setConfirmingInvoiceId(null)}
                        className="px-2 py-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-[10px] font-bold transition cursor-pointer select-none"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {selectedInvoice.status === "pendiente" && (
                      <button
                        onClick={() => {
                          setConfirmingInvoiceId(selectedInvoice.id);
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer font-sans"
                      >
                        <Check className="w-3.5 h-3.5" /> Registrar Pago
                      </button>
                    )}
                  </>
                )}

                <button
                  onClick={() => {
                    setEditPaymentMethod(selectedInvoice.paymentMethod);
                    setEditDiscountAmount(selectedInvoice.discount);
                    setIsEditingReceipt(true);
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-150 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Editar
                </button>

                {selectedInvoice.status !== "anulada" && (
                  <button
                    onClick={() => {
                      onUpdateStatusFactura(selectedInvoice.id, "anulada");
                    }}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-rose-50 text-slate-550 hover:text-rose-600 border border-slate-150 rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Anular
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (
                      window.confirm(
                        "¿Estás seguro de eliminar permanentemente esta factura/presupuesto?",
                      )
                    ) {
                      onDeleteFactura?.(selectedInvoice.id);
                      setViewLevel("trabajos");
                      setSelectedInvoiceId(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4 shrink-0" />
                  <span className="hidden sm:inline">Eliminar</span>
                </button>

                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-150 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  title="Imprimir copia física"
                >
                  <Printer className="w-4 h-4" /> Imprimir
                </button>
              </div>
            </div>

            {/* Edit Receipt Form */}
            {isEditingReceipt && (
              <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl mb-6 space-y-4 animate-fade-in block-print-hide">
                <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide flex items-center gap-2">
                    <CircleDollarSign className="w-5 h-5 text-indigo-500" />{" "}
                    Editar Boleta
                  </h3>
                  <button
                    onClick={() => setIsEditingReceipt(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">
                      Método de Pago
                    </label>
                    <select
                      value={editPaymentMethod}
                      onChange={(e) =>
                        setEditPaymentMethod(e.target.value as any)
                      }
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold focus:outline-hidden"
                    >
                      <option value="Efectivo">Efectivo</option>
                      <option value="Transferencia">
                        Transferencia Bancaria
                      </option>
                      <option value="Tarjeta de Crédito/Débito">
                        Tarjeta de Crédito/Débito
                      </option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">
                      Descuento Especial (Gs.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editDiscountAmount}
                      onChange={(e) =>
                        setEditDiscountAmount(Number(e.target.value) || 0)
                      }
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => {
                      if (onUpdateFactura) {
                        const newDiscount = Number(editDiscountAmount) || 0;
                        const baseAmount =
                          selectedInvoice.subtotal + selectedInvoice.discount;
                        const sub = baseAmount - newDiscount;
                        const taxesVal = sub * 0.1; // 10% IVA
                        const finalTotal = sub + taxesVal;

                        onUpdateFactura(selectedInvoice.id, {
                          paymentMethod: editPaymentMethod,
                          discount: newDiscount,
                          subtotal: Math.round(sub),
                          total: Math.round(finalTotal),
                          taxes: Math.round(taxesVal),
                        });
                      }
                      setIsEditingReceipt(false);
                    }}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>
            )}

            {/* Printable Frame wrapper with id="printable_receipt" */}
            <div
              id="printable_receipt"
              className="mt-6 bg-slate-50 rounded-2xl border border-slate-100 p-8 font-sans text-xs text-slate-700 space-y-6 relative overflow-hidden bg-white"
            >
              {/* PAID stamp */}
              <div className="absolute right-6 top-6 select-none opacity-25 pointer-events-none transform rotate-12">
                {selectedInvoice.status === "pagada" ? (
                  <div className="border-4 border-emerald-500 rounded-xl p-2.5 text-emerald-600 font-black text-2xl uppercase tracking-widest text-center">
                    Cerrado / Pagado
                  </div>
                ) : selectedInvoice.status === "pendiente" ? (
                  <div className="border-4 border-amber-500 rounded-xl p-2.5 text-amber-600 font-black text-2xl uppercase tracking-widest text-center">
                    Pendiente Pago
                  </div>
                ) : (
                  <div className="border-4 border-rose-500 rounded-xl p-2.5 text-rose-600 font-black text-2xl uppercase tracking-widest text-center">
                    Anulada
                  </div>
                )}
              </div>

              {/* Shop info */}
              <div className="grid grid-cols-2 gap-4 pb-6 border-b border-slate-200">
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-slate-800">
                    Auto Tech
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-normal">
                    Servicio Integral Automotriz Premium
                    <br />
                    Av. San Martín 1542, Concepción
                    <br />
                    Fono: +595 21 681 400 • RUC: 80031542-9
                  </p>
                </div>
                <div className="text-right space-y-1.5 font-mono">
                  <p className="font-bold text-slate-800">
                    FACTURA SIMPLIFICADA
                  </p>
                  <p className="text-indigo-650 font-black text-lg">
                    {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    Fecha:{" "}
                    {new Date(selectedInvoice.issueDate).toLocaleString()}
                  </p>
                  <p className="text-slate-400 text-[10px]">
                    OT vinculada: {mainOrder ? mainOrder.orderNumber : "OT-Gen"}
                  </p>
                </div>
              </div>

              {/* Client and Car details */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-5 rounded-xl border border-slate-100">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Señor(A):
                  </span>
                  <p className="font-bold text-slate-800 leading-tight text-sm">
                    {mainClient?.name}
                  </p>
                  <p className="text-slate-500 font-mono">
                    CI/RUC: {mainClient?.taxId}
                  </p>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    Ficha Vehículo:
                  </span>
                  <p className="font-bold text-slate-800 text-sm">
                    {mainVehicle
                      ? `${mainVehicle.brand} ${mainVehicle.model}`
                      : "Vehículo"}
                  </p>
                  <p className="text-slate-500 font-mono">
                    Chapa:{" "}
                    <strong className="uppercase">{mainVehicle?.plate}</strong>{" "}
                    • Año: {mainVehicle?.year}
                  </p>
                </div>
              </div>

              {/* Itemized list of expenditures */}
              <div className="space-y-2 pt-4">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase">
                  Detalle de Cargos e Insumos
                </span>

                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 font-mono text-[10px] pb-2">
                      <th className="py-2">Descripción de Item / Servicio</th>
                      <th className="text-center py-2">Cant</th>
                      <th className="text-right py-2">Precio Unit.</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-[11px] leading-relaxed">
                    {/* Item 1: Base maintenance diagnosis fee */}
                    <tr className="text-slate-700">
                      <td className="py-3">
                        <strong className="block text-slate-800 text-xs">
                          Mano de Obra Diagnóstico / Entrada
                        </strong>
                        <span className="text-[10px] text-slate-400">
                          Inspección de calibración de ingreso
                        </span>
                      </td>
                      <td className="text-center py-3">1</td>
                      <td className="text-right py-3">
                        {mainOrder
                          ? Math.round(mainOrder.laborCost).toLocaleString(
                              "es-PY",
                            )
                          : "30.000"}{" "}
                        Gs.
                      </td>
                      <td className="text-right py-3">
                        {mainOrder
                          ? Math.round(mainOrder.laborCost).toLocaleString(
                              "es-PY",
                            )
                          : "30.000"}{" "}
                        Gs.
                      </td>
                    </tr>

                    {/* Item 2: Completed tasks details */}
                    {mainOrder?.tasks.map((task) => (
                      <tr key={task.id} className="text-slate-700">
                        <td className="py-3">
                          <strong className="block text-slate-800 text-xs">
                            {task.name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            Labor mecánica ({task.hours} hrs)
                          </span>
                        </td>
                        <td className="text-center py-3">1</td>
                        <td className="text-right py-3">
                          {Math.round(
                            task.hours * task.costPerHour,
                          ).toLocaleString("es-PY")}{" "}
                          Gs.
                        </td>
                        <td className="text-right py-3">
                          {Math.round(
                            task.hours * task.costPerHour,
                          ).toLocaleString("es-PY")}{" "}
                          Gs.
                        </td>
                      </tr>
                    ))}

                    {/* Item 3: Parts consumed details */}
                    {mainOrder?.partsUsed.map((part, idx) => (
                      <tr key={idx} className="text-slate-650">
                        <td className="py-3">
                          <strong className="block text-slate-800 text-xs">
                            {part.name}
                          </strong>
                          <span className="text-[10px] text-slate-400">
                            Repuesto instalado
                          </span>
                        </td>
                        <td className="text-center py-3">{part.quantity}</td>
                        <td className="text-right py-3">
                          {Math.round(part.price).toLocaleString("es-PY")} Gs.
                        </td>
                        <td className="text-right py-3">
                          {Math.round(
                            part.quantity * part.price,
                          ).toLocaleString("es-PY")}{" "}
                          Gs.
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Economic summation table */}
              <div className="pt-6 border-t border-slate-200 flex justify-end font-sans">
                <div className="w-72 space-y-2.5 text-slate-600 leading-normal">
                  <div className="flex justify-between">
                    <span>Subtotal Neto:</span>
                    <span className="font-mono text-sm">
                      {Math.round(selectedInvoice.subtotal).toLocaleString(
                        "es-PY",
                      )}{" "}
                      Gs.
                    </span>
                  </div>
                  {selectedInvoice.discount > 0 && (
                    <div className="flex justify-between text-indigo-650 font-bold">
                      <span>Descuento Especial:</span>
                      <span className="font-mono text-sm">
                        -
                        {Math.round(selectedInvoice.discount).toLocaleString(
                          "es-PY",
                        )}{" "}
                        Gs.
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Impuesto IVA (10%):</span>
                    <span className="font-mono text-sm">
                      {Math.round(selectedInvoice.taxes).toLocaleString(
                        "es-PY",
                      )}{" "}
                      Gs.
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-slate-200 text-slate-900 font-extrabold text-base">
                    <span>TOTAL COBRADO:</span>
                    <span className="font-mono text-indigo-700 text-lg">
                      {Math.round(selectedInvoice.total).toLocaleString(
                        "es-PY",
                      )}{" "}
                      Gs.
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-200 text-[10px] text-slate-400 text-center leading-relaxed font-mono">
                PAGO REGISTRADO: {selectedInvoice.paymentMethod.toUpperCase()}
                <br />
                ¡Muchas gracias por confiar el cuidado de su vehículo en
                Auto Tech!
              </div>
            </div>
          </div>
        </div>
      )}
      {/* LEVEL 4: HOJA DE ORDEN DE TRABAJO */}
      {viewLevel === "hoja_orden" && viewingOrderReceiptId && (
        (() => {
          const mainOrder = ordenes.find((o) => o.id === viewingOrderReceiptId);
          const vehicle = vehiculos.find(
            (v) => v.id === mainOrder?.vehicleId,
          );
          if (!mainOrder) return null;

          return (
            <div className="space-y-6 animate-fade-in" id="print_section">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-xs mb-4">
                <button
                  onClick={() => {
                    setViewLevel("trabajos");
                    setViewingOrderReceiptId(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a Trabajos
                </button>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      const printContents =
                        document.getElementById("print_order")?.innerHTML;
                      const originalContents = document.body.innerHTML;
                      if (printContents) {
                        document.body.innerHTML = printContents;
                        window.print();
                        document.body.innerHTML = originalContents;
                        location.reload();
                      }
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Printer className="w-4 h-4" /> Imprimir Hoja
                  </button>
                </div>
              </div>

              {/* TICKET DE ORDEN (Similar to receipt but for work orders) */}
              <div
                className="max-w-3xl mx-auto bg-white rounded-md shadow-xl border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0 relative overflow-hidden"
              >
                <div id="print_order" className="text-sm space-y-6 text-slate-800">
                  <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                    <div className="space-y-1">
                      <h4 className="text-xl font-extrabold text-indigo-700">ORDEN DE TRABAJO</h4>
                      <p className="text-slate-500 font-mono text-xs">OT: {mainOrder.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold text-slate-800">Auto Tech</h4>
                      <p className="font-mono text-[10px] text-slate-500">Fecha Ingreso: {new Date(mainOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Cliente</span>
                      <p className="font-bold text-slate-800">{mainClient?.name}</p>
                      <p className="font-mono text-slate-600">RUC: {mainClient?.taxId}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                      <span className="text-[10px] text-slate-400 font-mono uppercase">Vehículo</span>
                      <p className="font-bold text-slate-800">{vehicle?.brand} {vehicle?.model}</p>
                      <p className="font-mono text-slate-600">Matrícula: {vehicle?.plate}</p>
                      <p className="font-mono text-slate-600">Kilometraje: {mainOrder.mileage.toLocaleString()} KM</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h5 className="font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Mano de Obra y Diagnóstico</h5>
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-mono">
                          <tr>
                            <th className="py-2 px-3">Detalle</th>
                            <th className="py-2 px-3 text-right">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          <tr>
                            <td className="py-2 px-3">Cargo Diagnóstico Base</td>
                            <td className="py-2 px-3 text-right font-mono">{Math.round(mainOrder.laborCost).toLocaleString("es-PY")} Gs.</td>
                          </tr>
                          {mainOrder.tasks.map((task) => (
                            <tr key={task.id}>
                              <td className="py-2 px-3">{task.name}</td>
                              <td className="py-2 px-3 text-right font-mono">{Math.round(task.hours * task.costPerHour).toLocaleString("es-PY")} Gs.</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {mainOrder.partsUsed.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Repuestos Instalados</h5>
                      <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-500 font-mono">
                            <tr>
                              <th className="py-2 px-3">Repuesto</th>
                              <th className="py-2 px-3 text-center">Cant.</th>
                              <th className="py-2 px-3 text-right">Subtotal</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {mainOrder.partsUsed.map((part, idx) => (
                              <tr key={idx}>
                                <td className="py-2 px-3">{part.name}</td>
                                <td className="py-2 px-3 text-center">{part.quantity}</td>
                                <td className="py-2 px-3 text-right font-mono">{Math.round(part.quantity * part.price).toLocaleString("es-PY")} Gs.</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex justify-end">
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Costo Total Orden</p>
                      <p className="text-2xl font-black text-indigo-700 font-mono">
                        {Math.round(mainOrder.totalCost).toLocaleString("es-PY")} Gs.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          );
        })()
      )}
    </div>
  );
}
