import { useState, FormEvent, useEffect } from "react";
import { 
  ClipboardList, 
  Plus, 
  Wrench, 
  Calendar, 
  User, 
  Car, 
  Play, 
  CheckCircle2, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  PlusCircle, 
  X, 
  Inbox, 
  Check, 
  Flame,
  Gauge,
  Printer,
  Phone,
  IdCard,
  FileText,
  CornerUpLeft,
  CheckCheck,
  Trash2,
  Camera,
  Image as ImageIcon
} from "lucide-react";
import { Cliente, Vehiculo, OrdenTrabajo, Repuesto, TaskItem, PartUsage, AIDiagnosticResult, OrderStatus } from "../../../types";

interface OrdenesTrabajoViewProps {
  ordenes: OrdenTrabajo[];
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  repuestos: Repuesto[];
  onAddOrden: (orden: Omit<OrdenTrabajo, 'id' | 'orderNumber' | 'createdAt' | 'status' | 'tasks' | 'partsUsed' | 'totalCost'> & { tasks?: TaskItem[] }) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onAddTask: (orderId: string, task: Omit<TaskItem, 'id' | 'status'>) => void;
  onToggleTask: (orderId: string, taskId: string) => void;
  onRemoveTask: (orderId: string, taskId: string) => void;
  onEditTask?: (orderId: string, taskId: string, updatedTask: Partial<Omit<TaskItem, 'id' | 'status'>>) => void;
  onAddPartToOrder: (orderId: string, partId: string, quantity: number, customPrice?: number) => void;
  onAddManualPartToOrder: (orderId: string, name: string, price: number, quantity: number) => void;
  onRemovePartFromOrder: (orderId: string, partId: string) => void;
  onUpdateNotes: (orderId: string, notes: string) => void;
  onDeleteOrden?: (orderId: string) => void;
  onUpdateImages?: (orderId: string, images: string[]) => void;
  selectedOrderIdFromGlobal: string | null;
  onClearGlobalSelection: () => void;
  preselectedVehicleIdFromGlobal?: string | null;
  onClearGlobalPreselectedVehicleId?: () => void;
}

export default function OrdenesTrabajoView({
  ordenes,
  clientes,
  vehiculos,
  repuestos,
  onAddOrden,
  onUpdateStatus,
  onAddTask,
  onToggleTask,
  onRemoveTask,
  onEditTask,
  onAddPartToOrder,
  onAddManualPartToOrder,
  onRemovePartFromOrder,
  onUpdateNotes,
  onDeleteOrden,
  onUpdateImages,
  selectedOrderIdFromGlobal,
  onClearGlobalSelection,
  preselectedVehicleIdFromGlobal,
  onClearGlobalPreselectedVehicleId
}: OrdenesTrabajoViewProps) {
  
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(selectedOrderIdFromGlobal);
  const [localNotes, setLocalNotes] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<string | null>(null);

  // States for editing task items
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskDesc, setEditTaskDesc] = useState("");
  const [editTaskRate, setEditTaskRate] = useState<number | "">("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // New order form states
  const [newOrderClientId, setNewOrderClientId] = useState("");
  const [newOrderVehicleId, setNewOrderVehicleId] = useState("");
  const [newOrderMileage, setNewOrderMileage] = useState(0);
  const [newOrderFuel, setNewOrderFuel] = useState<'Vacío' | '1/4' | '1/2' | '3/4' | 'Lleno'>('1/2');
  const [newOrderSymptoms, setNewOrderSymptoms] = useState("");
  const [newOrderEstDate, setNewOrderEstDate] = useState("");
  const [newOrderLaborCost, setNewOrderLaborCost] = useState<number | "">("");

  // Initial tasks list in order creation form states
  const [initialTasksToInclude, setInitialTasksToInclude] = useState<Omit<TaskItem, 'id' | 'status'>[]>([]);
  const [tempTaskName, setTempTaskName] = useState("");
  const [tempTaskPrice, setTempTaskPrice] = useState<number | "">("");

  // Task adding states
  const [taskName, setTaskName] = useState("");
  const [taskDesc, setTaskDesc] = useState("");
  const [taskHours, setTaskHours] = useState(1);
  const [taskRate, setTaskRate] = useState<number | "">("");

  // Part adding states
  const [selectedPartId, setSelectedPartId] = useState("");
  const [selectedPartQty, setSelectedPartQty] = useState(1);
  const [selectedPartCustomPrice, setSelectedPartCustomPrice] = useState<number | "">("");

  // Custom manual part adding states
  const [isManualPartMode, setIsManualPartMode] = useState(false);
  const [manualPartName, setManualPartName] = useState("");
  const [manualPartPrice, setManualPartPrice] = useState<number | "">("");
  const [manualPartQty, setManualPartQty] = useState(1);

  // Printing state
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // AI Diagnostic states
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<AIDiagnosticResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  // Sync selection if global intent triggered from Dashboard clicks
  if (selectedOrderIdFromGlobal && selectedOrderIdFromGlobal !== selectedOrderId) {
    setSelectedOrderId(selectedOrderIdFromGlobal);
    onClearGlobalSelection();
    setAiResult(null); // Reset AI panel
  }

  useEffect(() => {
    if (preselectedVehicleIdFromGlobal) {
      setIsCreatingOrder(true);
      const vehicleObj = vehiculos.find(v => v.id === preselectedVehicleIdFromGlobal);
      if (vehicleObj) {
        setNewOrderClientId(vehicleObj.ownerId);
        setNewOrderVehicleId(vehicleObj.id);
      }
      onClearGlobalPreselectedVehicleId?.();
    }
  }, [preselectedVehicleIdFromGlobal, vehiculos, onClearGlobalPreselectedVehicleId]);

  // Active state references
  const mainOrder = ordenes.find(o => o.id === selectedOrderId);
  const mainVehicle = mainOrder ? vehiculos.find(v => v.id === mainOrder.vehicleId) : null;
  const mainClient = mainOrder ? clientes.find(c => c.id === mainOrder.clientId) : null;

  useEffect(() => {
    if (mainOrder) {
      setLocalNotes(mainOrder.notes || "");
    } else {
      setLocalNotes("");
    }
    setSaveFeedback(null);
    setEditingTaskId(null);
  }, [selectedOrderId, mainOrder?.id]);

  // Custom filters based on navigation pills
  const filteredOrders = ordenes.filter(o => {
    if (statusFilter === "todos") return true;
    return o.status === statusFilter;
  });

  const handleAddInitialTaskToInclude = (name: string, price: number) => {
    if (!name.trim()) return;
    setInitialTasksToInclude(prev => [
      ...prev,
      {
        name: name.trim(),
        description: "Servicio de labor registrado al ingreso",
        hours: 1,
        costPerHour: price
      }
    ]);
  };

  const handleRemoveInitialTaskToInclude = (indexToRemove: number) => {
    setInitialTasksToInclude(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSaveOrderDetails = () => {
    if (mainOrder) {
      onUpdateNotes(mainOrder.id, localNotes);
      setSaveFeedback("¡Orden guardada con éxito!");
      setTimeout(() => setSaveFeedback(null), 3050);
    }
  };

  const handleCreateOrderSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newOrderClientId || !newOrderVehicleId || !newOrderSymptoms) return;
    
    // Map initial custom list tasks into TaskItem schema format
    const formattedTasks: TaskItem[] = initialTasksToInclude.map((t, idx) => ({
      id: `task-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      name: t.name,
      description: t.description,
      hours: 1,
      costPerHour: t.costPerHour,
      status: 'pendiente'
    }));

    onAddOrden({
      clientId: newOrderClientId,
      vehicleId: newOrderVehicleId,
      mileage: newOrderMileage,
      fuelLevel: newOrderFuel,
      description: newOrderSymptoms,
      estimatedDeliveryAt: newOrderEstDate || undefined,
      laborCost: Number(newOrderLaborCost) || 0,
      notes: "",
      tasks: formattedTasks
    });

    // Reset fields
    setNewOrderClientId("");
    setNewOrderVehicleId("");
    setNewOrderMileage(0);
    setNewOrderFuel('1/2');
    setNewOrderSymptoms("");
    setNewOrderEstDate("");
    setNewOrderLaborCost("");
    setInitialTasksToInclude([]);
    setIsCreatingOrder(false);
  };

  const handleAddTaskSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !taskName) return;
    onAddTask(selectedOrderId, {
      name: taskName,
      description: taskDesc,
      hours: 1,
      costPerHour: Number(taskRate) || 0
    });
    setTaskName("");
    setTaskDesc("");
    setTaskHours(1);
    setTaskRate("");
  };

  const handleAddPartSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !selectedPartId) return;
    onAddPartToOrder(selectedOrderId, selectedPartId, selectedPartQty, Number(selectedPartCustomPrice) || 0);
    setSelectedPartId("");
    setSelectedPartQty(1);
    setSelectedPartCustomPrice("");
  };

  const handleAddManualPartSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedOrderId || !manualPartName || manualPartQty <= 0) return;
    onAddManualPartToOrder(selectedOrderId, manualPartName, Number(manualPartPrice) || 0, Number(manualPartQty));
    setManualPartName("");
    setManualPartPrice("");
    setManualPartQty(1);
  };

  // Connects securely with Express proxy /api/diagnose
  const handleRequestAIDiagnosis = async () => {
    if (!mainOrder || !mainVehicle) return;
    setAiLoading(true);
    setAiError(null);
    setAiResult(null);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          brand: mainVehicle.brand,
          model: mainVehicle.model,
          year: mainVehicle.year,
          engine: mainVehicle.engine,
          symptoms: mainOrder.description
        })
      });

      if (!response.ok) {
        throw new Error("El servicio de diagnóstico de IA no se encuentra disponible. Verifique configuraciones o intente offline.");
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setAiResult(data);
    } catch (err: any) {
      console.error(err);
      setAiError(err.message || "Error al conectar con el servidor.");
    } finally {
      setAiLoading(false);
    }
  };

  // Helper: Auto-applies AI tasks directly into the active order
  const handleApplyAITasks = () => {
    if (!selectedOrderId || !aiResult || aiResult.recommendedTasks.length === 0) return;
    aiResult.recommendedTasks.forEach(task => {
      onAddTask(selectedOrderId, {
        name: task.name,
        description: task.description,
        hours: task.estimatedHours,
        costPerHour: 35 // Base default rate
      });
    });
    alert("¡Fórmulas y tareas transferidas exitosamente al mecánico!");
    setAiResult(null); // Clear panel
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="work_orders_panel">
      
      {/* Pills Filter & Creation Toolbar */}
      <div className="lg:col-span-12 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Nav pills */}
        <div className="flex flex-wrap gap-1.5" id="order_filters_bar">
          {['todos', 'no_iniciado', 'en_proceso', 'congelado', 'terminado'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition capitalize cursor-pointer ${
                statusFilter === status 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              }`}
            >
              {status === 'todos' ? 'Ver Todos' : status.replace('_', ' ')}
            </button>
          ))}
        </div>

        <button
          id="btn_launch_create_order"
          onClick={() => setIsCreatingOrder(prev => !prev)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Ingresar Orden de Trabajo
        </button>
      </div>

      {/* Creation form Overlay if prompted */}
      {isCreatingOrder && (
        <div className="lg:col-span-12 bg-indigo-50/50 border border-indigo-100 p-6 rounded-2xl space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-indigo-100/50">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" /> Registrar Entrada de Vehículo y Orden
            </h3>
            <button 
              onClick={() => setIsCreatingOrder(false)} 
              className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreateOrderSubmit} className="grid grid-cols-1 md:grid-cols-6 gap-4">
            {/* 1. Client selector */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Propietario / Cliente *</label>
              <select
                required
                value={newOrderClientId}
                onChange={(e) => {
                  setNewOrderClientId(e.target.value);
                  setNewOrderVehicleId(""); // Reset vehicle select
                }}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden focus:border-indigo-500"
              >
                <option value="">-- Elija un propietario --</option>
                {clientes.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.taxId})</option>
                ))}
              </select>
            </div>

            {/* 2. Vehicle selector linked specifically to client */}
            <div className="md:col-span-2 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Vehículo Registrado *</label>
              <select
                required
                disabled={!newOrderClientId}
                value={newOrderVehicleId}
                onChange={(e) => setNewOrderVehicleId(e.target.value)}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">-- Eliga vehículo del cliente --</option>
                {vehiculos
                  .filter(v => v.ownerId === newOrderClientId)
                  .map(v => (
                    <option key={v.id} value={v.id}>{v.brand} {v.model} [{v.plate}]</option>
                  ))}
              </select>
            </div>

            {/* 3. Detail info */}
            <div className="md:col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Kilometraje *</label>
              <input
                type="number"
                required
                value={newOrderMileage}
                onChange={(e) => setNewOrderMileage(Number(e.target.value))}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                placeholder="Kilómetros"
              />
            </div>

            <div className="md:col-span-1 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Nivel Combustible</label>
              <select
                value={newOrderFuel}
                onChange={(e) => setNewOrderFuel(e.target.value as any)}
                className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold focus:outline-hidden"
              >
                <option value="Vacío">Vacío</option>
                <option value="1/4">1/4 Tanque</option>
                <option value="1/2">1/2 Tanque</option>
                <option value="3/4">3/4 Tanque</option>
                <option value="Lleno">Lleno</option>
              </select>
            </div>

            {/* 4. Description Symptoms */}
            <div className="md:col-span-4 space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase">Síntomas / Reporte del Cliente (Será analizado por la IA) *</label>
              <textarea
                required
                rows={3}
                value={newOrderSymptoms}
                onChange={(e) => setNewOrderSymptoms(e.target.value)}
                className="w-full text-xs p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-medium leading-relaxed outline-hidden focus:border-indigo-500"
                placeholder="Describa el motivo de ingreso, ruidos sospechosos, tirones, pérdidas de fluidos, etc..."
              />
            </div>

            {/* 5. Labor fees & estimated date */}
            <div className="md:col-span-2 space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Entrega Estimada (Opcional)</label>
                <input
                  type="date"
                  value={newOrderEstDate}
                  onChange={(e) => setNewOrderEstDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-500 uppercase">Costo Base Diagnóstico ($)</label>
                <input
                  type="number"
                  value={newOrderLaborCost}
                  onChange={(e) => setNewOrderLaborCost(e.target.value === "" ? "" : Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                />
              </div>
            </div>

            {/* 6. List of work (labores/mano de obra) to pre-add as requested */}
            <div className="md:col-span-6 bg-slate-50/70 p-4 rounded-xl border border-indigo-100/40 space-y-3">
              <span className="text-[11px] font-extrabold text-indigo-600 uppercase block tracking-wider">
                Pre-cargar Lista de Labores / Trabajos Realizados (Lista de Mano de Obra)
              </span>
              
              <div className="flex flex-col sm:flex-row gap-2 items-end">
                <div className="flex-1 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Trabajo Mano de Obra (Ej. Cambio de Aceite)</label>
                  <input
                    type="text"
                    value={tempTaskName}
                    onChange={(e) => setTempTaskName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                    placeholder="Ej. Cambio de Aceite, Cambio de bujía, Lavado de motor..."
                  />
                </div>
                <div className="w-full sm:w-32 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Precio Mano Obra ($)</label>
                  <input
                    type="number"
                    min="0"
                    value={tempTaskPrice}
                    onChange={(e) => setTempTaskPrice(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    handleAddInitialTaskToInclude(tempTaskName, Number(tempTaskPrice) || 0);
                    setTempTaskName("");
                    setTempTaskPrice("");
                  }}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition"
                >
                  + Agregar Trabalho
                </button>
              </div>

              {/* List of items pre-loaded */}
              {initialTasksToInclude.length > 0 ? (
                <div className="space-y-1.5 max-h-40 overflow-y-auto pt-2">
                  {initialTasksToInclude.map((t, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-white px-3 py-1.5 rounded-lg border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-700">{t.name}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-indigo-600">{t.costPerHour.toLocaleString('es-PY')} Gs.</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveInitialTaskToInclude(idx)}
                          className="text-slate-300 hover:text-rose-500 cursor-pointer font-bold leading-none text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[10px] text-slate-400 italic">No hay labores registradas. Puede agregar unas de arriba o cargarlas progresivamente luego.</p>
              )}
            </div>

            <div className="md:col-span-6 flex justify-end gap-2 pt-2 border-t border-indigo-100/50">
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Crear Orden de Trabajo
              </button>
              <button
                type="button"
                onClick={() => setIsCreatingOrder(false)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Ignorar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Dynamic UI: Show full-width vehicles row list first, then full-width details with save/exit on selection */}
      {selectedOrderId === null ? (
        <div className="lg:col-span-12 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col min-h-[460px]">
            <h3 className="font-extrabold text-slate-800 pb-3 border-b border-slate-100 flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Car className="w-4 h-4 text-indigo-600" />
                <span>Órdenes de Trabajo Activas (Camionetas y Autos ingresados)</span>
              </span>
              <span className="text-[11px] font-mono font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {filteredOrders.length} listadas
              </span>
            </h3>

            <div className="space-y-2 mt-4 select-none">
              {filteredOrders.length > 0 ? (
                filteredOrders.map(order => {
                  const vehicle = vehiculos.find(v => v.id === order.vehicleId);
                  const client = clientes.find(c => c.id === order.clientId);
                  
                  let badgeStyle = "bg-slate-105 text-slate-650 border-slate-200";
                  if (order.status === "no_iniciado") badgeStyle = "bg-slate-100 text-slate-700 border-slate-350";
                  else if (order.status === "en_proceso") badgeStyle = "bg-blue-50 text-blue-700 border-blue-150";
                  else if (order.status === "congelado") badgeStyle = "bg-amber-50 text-amber-700 border-amber-150";
                  else if (order.status === "terminado") badgeStyle = "bg-emerald-50 text-emerald-700 border-emerald-150";

                  return (
                    <div
                      key={order.id}
                      onClick={() => {
                        setSelectedOrderId(order.id);
                        setAiResult(null); // Reset AI panel
                      }}
                      className="bg-white p-4 rounded-xl border border-slate-150 hover:border-indigo-300 hover:shadow-xs cursor-pointer transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4 group"
                    >
                      {/* Vehicle specifications */}
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:bg-indigo-50 group-hover:border-indigo-150 transition">
                          <Car className="w-5.5 h-5.5 text-indigo-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-extrabold text-slate-850">
                              {vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.year})` : "Vehículo"}
                            </h4>
                            <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase border border-indigo-100">
                              {vehicle?.plate}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                            Cliente: <span className="font-semibold text-slate-705">{client?.name || "N/A"}</span> • {client?.phone || ""}
                          </p>
                        </div>
                      </div>

                      {/* Symptoms description */}
                      <div className="flex-1 md:max-w-md">
                        <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Síntomas / Reporte del Cliente</span>
                        <p className="text-xs text-slate-650 line-clamp-1 italic font-medium">
                          "{order.description}"
                        </p>
                      </div>

                      {/* Progress details */}
                      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                        <div className="text-left md:text-right">
                          <span className="text-[9px] font-bold text-slate-400 uppercase font-mono tracking-wider block">Número y Fecha</span>
                          <span className="font-mono text-xs font-bold text-indigo-600 block">{order.orderNumber}</span>
                          <span className="text-[10px] text-slate-400 block">{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>

                        <div className="flex flex-col items-end gap-1 font-sans">
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded border tracking-wide uppercase ${badgeStyle}`}>
                            {order.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                            {Math.round(order.totalCost).toLocaleString('es-PY')} Gs.
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs flex flex-col items-center justify-center gap-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Inbox className="w-8 h-8 text-slate-350" />
                  <span className="font-bold">No se encontraron órdenes de autos en estas condiciones.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="lg:col-span-12 space-y-6">
        {mainOrder ? (
          <div className="space-y-6">
            
            {/* Header with quick client and vehicle summaries plus Save/Exit actions */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-3 border-b border-slate-100 gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded border border-indigo-100">
                    {mainOrder.orderNumber}
                  </span>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-800">
                    {mainVehicle ? `${mainVehicle.brand} ${mainVehicle.model} [${mainVehicle.plate}]` : "Detalles de Orden de Trabajo"}
                  </h2>
                </div>
                
                {/* Save and Exit and Print Action Buttons at the Top Side-by-Side */}
                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                  {saveFeedback && (
                    <span className="text-xs font-bold text-emerald-605 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-xl animate-pulse">
                      {saveFeedback}
                    </span>
                  )}
                  
                  <button
                    type="button"
                    onClick={handleSaveOrderDetails}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs select-none"
                  >
                    <CheckCheck className="w-4 h-4 shrink-0" />
                    <span>Guardar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOrderId(null)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-205 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <CornerUpLeft className="w-4 h-4 shrink-0" />
                    <span>Salir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("¿Estás seguro de eliminar esta orden de trabajo?")) {
                        onDeleteOrden?.(mainOrder.id);
                        setSelectedOrderId(null);
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs select-none border border-rose-200"
                  >
                    <Trash2 className="w-4 h-4 shrink-0" />
                    <span className="hidden sm:inline">Eliminar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs select-none"
                  >
                    <Printer className="w-4 h-4 shrink-0" />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Status workflow horizontal steps progression */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Flujo Logístico y Proceso Técnico
                </span>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {(['no_iniciado', 'en_proceso', 'congelado', 'terminado'] as OrderStatus[]).map((st) => {
                    const isActive = mainOrder.status === st;
                    let style = "";
                    if (isActive) {
                      if (st === 'no_iniciado') style = "bg-slate-750 text-white border-transparent shadow-sm";
                      else if (st === 'en_proceso') style = "bg-blue-600 text-white border-transparent shadow-sm";
                      else if (st === 'congelado') style = "bg-amber-500 text-white border-transparent shadow-sm";
                      else if (st === 'terminado') style = "bg-emerald-600 text-white border-transparent shadow-sm";
                    } else {
                      style = "bg-slate-50 border-slate-250 text-slate-700 hover:bg-slate-150";
                    }

                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          onUpdateStatus(mainOrder.id, st);
                        }}
                        className={`py-2 px-1 text-[10px] sm:text-[11px] font-bold rounded-xl text-center border transition flex flex-col items-center justify-center gap-1 cursor-pointer capitalize ${style}`}
                      >
                        <span>{st.replace('_', ' ')}</span>
                        {isActive && <Check className="w-3.5 h-3.5 text-white" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Customer and car details segment */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 text-xs font-sans text-slate-600 font-medium">
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Propietario</span>
                  <p className="font-bold text-slate-800">{mainClient?.name}</p>
                  <p className="text-slate-500">{mainClient?.phone}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Especificación Vehículo</span>
                  <p className="font-bold text-indigo-900 font-mono uppercase bg-indigo-50/50 w-fit px-1 rounded">
                    Patente: {mainVehicle?.plate}
                  </p>
                  <p className="text-slate-500">Motor: {mainVehicle?.engine || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Control de Ingreso</span>
                  <p className="text-slate-700 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {mainOrder.mileage.toLocaleString()} KM
                  </p>
                  <p className="text-slate-500">Combustible: <strong>{mainOrder.fuelLevel}</strong></p>
                </div>
              </div>

              {/* Original symptoms text */}
              <div className="p-3 bg-amber-50/30 rounded-xl border border-amber-100/50 text-xs">
                <span className="text-[10px] text-amber-700 font-bold uppercase font-mono block mb-1">Motivo de ingreso o falla reportada por el cliente:</span>
                <p className="text-slate-700 leading-relaxed italic font-medium">"{mainOrder.description}"</p>
              </div>
            </div>

            {/* AI Diagnostics Copilot section */}
            <div className="bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 p-6 rounded-3xl text-white shadow-lg space-y-6 flex flex-col justify-between">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full text-[10px] font-mono tracking-widest uppercase inline-flex items-center gap-1 font-bold">
                    <Sparkles className="w-3 h-3 text-indigo-400 shrink-0" /> Gemini-3.5 Copilot
                  </span>
                  <h3 className="text-lg font-extrabold tracking-tight">Asistente Técnico Predictivo IA</h3>
                  <p className="text-xs text-slate-300">Diagnóstico computarizado por IA en base a los síntomas e historial del auto.</p>
                </div>

                <button
                  id="btn_request_ai_diag"
                  onClick={handleRequestAIDiagnosis}
                  disabled={aiLoading}
                  className="px-4 py-2 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
                >
                  {aiLoading ? (
                    <>
                      <Clock className="w-4 h-4 animate-spin shrink-0" />
                      <span>Analizando Vehículo...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 shrink-0 text-amber-300" />
                      <span>Solicitar Diagnóstico IA</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Error Alert */}
              {aiError && (
                <div className="p-4 bg-rose-500/20 border border-rose-500/30 rounded-2xl text-xs space-y-1">
                  <p className="font-bold text-rose-300 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Error en procesamiento</p>
                  <p className="text-slate-200">{aiError}</p>
                </div>
              )}

              {/* AI Output Result with diagnostic, parts and procedures */}
              {aiResult && (
                <div className="space-y-5 animate-fade-in pt-3 border-t border-slate-800 p-1">
                  
                  {/* Warning prompt */}
                  {aiResult.warningMessage && (
                    <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs flex items-start gap-2 text-red-200">
                      <Flame className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                      <p><strong>Urgencia de Seguridad:</strong> {aiResult.warningMessage}</p>
                    </div>
                  )}

                  {/* 1. List of possible causes */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono text-indigo-300 tracking-wider uppercase font-bold">Posibles Causas Identificadas (Orden de Probabilidad):</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3" id="ai_results_causes">
                      {aiResult.possibleCauses.map((cause, idx) => (
                        <div key={idx} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/50 space-y-1">
                          <div className="flex justify-between items-start gap-1">
                            <span className="font-bold text-sm text-indigo-100">{cause.title}</span>
                            <span className={`px-2 py-0.5 text-[9px] rounded-lg font-mono font-bold shrink-0 ${
                              cause.severity === 'Alta' 
                                ? 'bg-red-500/20 text-red-300' 
                                : cause.severity === 'Media' 
                                  ? 'bg-amber-500/20 text-amber-300' 
                                  : 'bg-indigo-500/20 text-indigo-300'
                            }`}>
                              {cause.severity} • {cause.probability}%
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-normal">{cause.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 2. Tasks predictions */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono text-indigo-300 tracking-wider uppercase font-bold">Procedimientos y Labores Recomendadas:</h4>
                      <button
                        onClick={handleApplyAITasks}
                        className="px-2.5 py-1 bg-indigo-500 hover:bg-indigo-400 text-white rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                      >
                        <PlusCircle className="w-3.5 h-3.5 text-amber-300" /> Aplicar labor al presupuesto
                      </button>
                    </div>
                    
                    <div className="space-y-2" id="ai_results_tasks">
                      {aiResult.recommendedTasks.map((task, idx) => (
                        <div key={idx} className="p-2.5 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-slate-100">{task.name}</p>
                            <p className="text-[11px] text-slate-400">{task.description}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 text-[10px] font-mono rounded">
                              {task.estimatedHours} hrs estimadas
                            </span>
                            <span className="block text-[10px] text-slate-500 font-bold mt-1">Dificultad: {task.difficulty}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 3. Suggested Parts */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-mono text-indigo-300 tracking-wider uppercase font-bold">Repuestos con probabilidad de recambio:</h4>
                    <div className="flex flex-wrap gap-2" id="ai_results_parts">
                      {aiResult.suggestedParts.map((sub, idx) => (
                        <div key={idx} className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                          <span>{sub.name} (<strong className="font-mono text-[10px] text-indigo-300">${sub.estimatedCost}</strong>)</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Mechanics Tasks layout list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h3 className="text-slate-800 font-bold flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4 text-indigo-600" /> Presupuesto de Labores y tareas
              </h3>

              {/* Task addition sub-form */}
              <form onSubmit={handleAddTaskSubmit} className="p-3 bg-slate-50 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-end" id="form_add_task">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Servicio Labor *</label>
                  <input
                    type="text"
                    required
                    value={taskName}
                    onChange={(e) => setTaskName(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                    placeholder="Ej. Cambio de bujías"
                  />
                </div>
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase block">Breve Detalle</label>
                  <input
                    type="text"
                    value={taskDesc}
                    onChange={(e) => setTaskDesc(e.target.value)}
                    className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                    placeholder="Rutina de desarme"
                  />
                </div>
                <div className="md:col-span-4">
                  <div className="flex gap-2 items-end">
                    <div className="flex-1 space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold uppercase block">Precio ($)</label>
                      <input
                        type="number"
                        min="0"
                        value={taskRate}
                        onChange={(e) => setTaskRate(e.target.value === "" ? "" : Number(e.target.value))}
                        className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-lg font-mono font-bold text-slate-800"
                        placeholder="0"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold text-white bg-indigo-650 hover:bg-indigo-700 active:scale-95 transition rounded-lg h-[32px] cursor-pointer flex items-center justify-center gap-1 shrink-0 shadow-xs select-none"
                    >
                      <Plus className="w-4 h-4" /> Agregar
                    </button>
                  </div>
                </div>
              </form>

              {/* Tasks mapping */}
              <div className="space-y-2">
                {mainOrder.tasks.length > 0 ? (
                  mainOrder.tasks.map(task => {
                    if (editingTaskId === task.id) {
                      return (
                        <div key={task.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">Editar Trabajo / Labor</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                            <div className="sm:col-span-5 space-y-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">Servicio Labor *</label>
                              <input
                                type="text"
                                value={editTaskName}
                                onChange={(e) => setEditTaskName(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                                placeholder="Nombre de la labor"
                              />
                            </div>
                            <div className="sm:col-span-4 space-y-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">Detalle descriptivo</label>
                              <input
                                type="text"
                                value={editTaskDesc}
                                onChange={(e) => setEditTaskDesc(e.target.value)}
                                className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800"
                                placeholder="Breve nota"
                              />
                            </div>
                            <div className="sm:col-span-3 space-y-1">
                              <label className="text-[10px] text-slate-400 font-bold uppercase">Precio ($) *</label>
                              <input
                                type="number"
                                value={editTaskRate}
                                onChange={(e) => setEditTaskRate(e.target.value === "" ? "" : Number(e.target.value))}
                                className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-800 font-mono font-bold"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                if (editTaskName.trim()) {
                                  if (onEditTask) {
                                    onEditTask(mainOrder.id, task.id, {
                                      name: editTaskName.trim(),
                                      description: editTaskDesc.trim(),
                                      costPerHour: Number(editTaskRate) || 0
                                    });
                                  }
                                  setEditingTaskId(null);
                                }
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer select-none"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Aplicar cambios</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingTaskId(null)}
                              className="px-3 py-1.5 bg-white border border-slate-205 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition cursor-pointer"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={task.id} 
                        className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                          task.status === 'completada' 
                            ? 'bg-emerald-50/40 border-emerald-100 text-slate-600' 
                            : 'bg-white border-slate-100 text-slate-800'
                         }`}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => onToggleTask(mainOrder.id, task.id)}
                            className={`p-1.5 rounded-lg border transition cursor-pointer shrink-0 ${
                              task.status === 'completada' 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-400'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <div>
                            <p className={`font-bold ${task.status === 'completada' ? 'line-through text-slate-400' : ''}`}>
                              {task.name}
                            </p>
                            {task.description && <p className="text-[11px] text-slate-400">{task.description}</p>}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right font-mono text-xs font-bold text-slate-800">
                            <span>{Math.round(task.costPerHour).toLocaleString('es-PY')} Gs.</span>
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTaskId(task.id);
                              setEditTaskName(task.name);
                              setEditTaskDesc(task.description || "");
                              setEditTaskRate(task.costPerHour);
                            }}
                            className="px-2 py-1 text-[11px] font-bold text-indigo-650 hover:text-indigo-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
                          >
                            Editar
                          </button>

                          <button
                            onClick={() => onRemoveTask(mainOrder.id, task.id)}
                            className="text-slate-300 hover:text-rose-500 cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No se han registrado tareas o horas de labor mecánico en esta orden.
                  </div>
                )}
              </div>
            </div>

            {/* Managed Materials (PartsUsed) list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <div className="flex justify-between items-center flex-wrap gap-2">
                <h3 className="text-slate-800 font-bold flex items-center gap-2 text-sm">
                  <ClipboardList className="w-4 h-4 text-indigo-600" /> Repuestos Utilizados en Reparación
                </h3>
                <div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setIsManualPartMode(false)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${!isManualPartMode ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Del Inventario
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualPartMode(true)}
                    className={`px-2.5 py-1 rounded-md transition cursor-pointer ${isManualPartMode ? 'bg-white text-indigo-600 shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Ingreso Libre (Manual)
                  </button>
                </div>
              </div>

              {/* Part addition subform */}
              {isManualPartMode ? (
                <form onSubmit={handleAddManualPartSubmit} className="p-3 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3" id="form_add_parts_manual">
                  <div className="sm:col-span-5 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Nombre del Repuesto *</label>
                    <input
                      type="text"
                      required
                      value={manualPartName}
                      onChange={(e) => setManualPartName(e.target.value)}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-slate-850 font-semibold"
                      placeholder="Ej. Filtro de combustible original"
                    />
                  </div>
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Precio Unitario ($) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={manualPartPrice}
                      onChange={(e) => setManualPartPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                      placeholder="0.0"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Cant. *</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={manualPartQty}
                      onChange={(e) => setManualPartQty(Number(e.target.value) || 1)}
                      className="w-full text-xs px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg w-full h-[32px] cursor-pointer transition select-none flex items-center justify-center gap-1 self-end shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Registrar
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAddPartSubmit} className="p-3 bg-slate-50 rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-3 items-end" id="form_add_parts_used">
                  <div className="sm:col-span-6 space-y-1 w-full flex-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">Repuesto del Inventario *</label>
                    <select
                      required
                      value={selectedPartId}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSelectedPartId(val);
                        // Clear custom price so user has to enter it themselves from scratch
                        setSelectedPartCustomPrice("");
                      }}
                      className="w-full text-xs px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-705"
                    >
                      <option value="">-- Busque repuesto en stock --</option>
                      {repuestos.map(part => (
                        <option 
                          key={part.id} 
                          value={part.id}
                          disabled={part.stock <= 0}
                        >
                          {part.name} - Cód: {part.code} (Stock: {part.stock}) - ${part.price}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 space-y-1 w-full shrink-0">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Precio ($)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={selectedPartCustomPrice}
                      onChange={(e) => setSelectedPartCustomPrice(e.target.value === "" ? "" : Number(e.target.value))}
                      className="w-full text-xs px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1 w-full shrink-0">
                    <label className="text-[10px] text-slate-400 font-bold uppercase block">Cant.</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={selectedPartQty}
                      onChange={(e) => setSelectedPartQty(Number(e.target.value) || 1)}
                      className="w-full text-xs px-2 py-1.5 bg-slate-100 border border-slate-200 rounded-lg font-mono font-bold text-slate-800"
                    />
                  </div>
                  <button
                    type="submit"
                    className="sm:col-span-2 px-4 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg w-full h-[32px] cursor-pointer transition select-none flex items-center justify-center gap-1 shadow-xs"
                  >
                    <Plus className="w-4 h-4" /> Asignar
                  </button>
                </form>
              )}

              {/* Parts usage map */}
              <div className="space-y-2">
                {mainOrder.partsUsed.length > 0 ? (
                  mainOrder.partsUsed.map(item => (
                    <div key={item.partId} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center text-xs">
                      <div className="space-y-0.5">
                        <p className="font-bold text-slate-800">{item.name}</p>
                        <span className="text-[10px] text-slate-400 font-mono">ID Repuesto: {item.partId}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right font-mono text-[11px] font-semibold text-slate-600">
                          <span>{item.quantity} unidades @ ${item.price} c/u</span>
                          <span className="block font-bold text-slate-804">${(item.quantity * item.price).toFixed(1)}</span>
                        </div>
                        <button
                          onClick={() => onRemovePartFromOrder(mainOrder.id, item.partId)}
                          className="text-slate-400 hover:text-rose-500 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-slate-400 text-xs">
                    No se han cargado repuestos o consumibles a esta orden de trabajo todavía.
                  </div>
                )}
              </div>
            </div>

            {/* Images section */}
            <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase">Evidencia Fotográfica</span>
                <label className="px-3 py-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs select-none">
                  <Camera className="w-3.5 h-3.5 shrink-0" />
                  <span>Cargar Imagen</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && onUpdateImages) {
                        const files = Array.from(e.target.files);
                        Promise.all(files.map((file: File) => {
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = (ev) => resolve(ev.target?.result as string);
                            reader.readAsDataURL(file);
                          });
                        })).then(base64Images => {
                          const existingImages = mainOrder.images || [];
                          onUpdateImages(mainOrder.id, [...existingImages, ...base64Images]);
                        });
                      }
                    }}
                  />
                </label>
              </div>

              {mainOrder.images && mainOrder.images.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {mainOrder.images.map((imgUrl, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl border border-slate-200 aspect-square">
                      <img src={imgUrl} alt={`Evidencia ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => {
                          if (window.confirm("¿Eliminar imagen?") && onUpdateImages) {
                            const newImages = [...mainOrder.images!];
                            newImages.splice(idx, 1);
                            onUpdateImages(mainOrder.id, newImages);
                          }
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-rose-50 hover:text-rose-600 rounded-lg shadow-sm text-slate-600 transition opacity-0 group-hover:opacity-100"
                        title="Eliminar imagen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-slate-400 border border-dashed border-slate-200 rounded-xl bg-white">
                  <ImageIcon className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold">No se adjuntaron fotos de la reparación</p>
                </div>
              )}
            </div>

            {/* Mechanics feedback notes & global financial summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-6">
              
              {/* Internal notes */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase">Bitácora interna y observaciones mecánicas</span>
                <textarea
                  rows={4}
                  value={mainOrder.notes}
                  onChange={(e) => onUpdateNotes(mainOrder.id, e.target.value)}
                  className="w-full text-xs p-3 bg-white border border-slate-200 rounded-lg leading-relaxed text-slate-700 font-medium"
                  placeholder="Detalles técnicos adicionales, estado del motor, códigos arrojados del escáner..."
                />
              </div>

              {/* Cost breakdown */}
              <div className="space-y-4 font-sans text-sm flex flex-col justify-between">
                <span className="text-xs font-bold text-slate-500 font-mono uppercase">Resumen de liquidación</span>
                
                <div className="space-y-2 border-b border-dashed border-slate-200 pb-3 font-medium text-slate-600">
                  <div className="flex justify-between">
                    <span>Base Diagnóstico/Carga:</span>
                    <span className="font-mono">{Math.round(mainOrder.laborCost).toLocaleString('es-PY')} Gs.</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Labores Mecánicos:</span>
                    <span className="font-mono">
                      {Math.round(mainOrder.tasks.reduce((sum, t) => sum + (t.hours * t.costPerHour), 0)).toLocaleString('es-PY')} Gs.
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Insumos y Repuestos:</span>
                    <span className="font-mono">
                      {Math.round(mainOrder.partsUsed.reduce((sum, p) => sum + (p.quantity * p.price), 0)).toLocaleString('es-PY')} Gs.
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center text-lg font-bold pt-1">
                  <span className="text-indigo-900 text-base">Total Presupuestado:</span>
                  <span className="font-mono text-xl text-slate-900">{Math.round(mainOrder.totalCost).toLocaleString('es-PY')} Gs.</span>
                </div>
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-10 text-center text-slate-400 space-y-2">
            <ClipboardList className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-base font-bold">Seleccione una Orden para Administrar</p>
            <p className="text-xs">Usted puede abrir, auditar presupuestos, aplicar diagnósticos IA, editar labores y actualizar el progreso de la camioneta/auto seleccionando una fila del lado izquierdo.</p>
          </div>
        )}
      </div>
    )}

      {/* Dynamic official printing modal */}
      {isPrintModalOpen && mainOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto print:p-0 print:bg-white print:absolute print:inset-auto">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full flex flex-col max-h-[90vh] overflow-hidden print:shadow-none print:border-none print:max-h-none print:overflow-visible">
            
            {/* Header controls (hidden on print) */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-800 text-sm">Vista de Impresión Oficial de Planilla de Trabajo</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition select-none shadow-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Planilla</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Area content */}
            <div className="p-8 overflow-y-auto space-y-6 text-slate-800 text-xs font-sans print:p-0 print:overflow-visible" id="printable_work_order_sheet">
              {/* Receipt Header logo and info */}
              <div className="flex justify-between items-start pb-4 border-b-2 border-slate-900 gap-4">
                <div className="space-y-1">
                  <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-sans uppercase">SISTEMA ERP AUTO-TALLER CENTRAL</h1>
                  <p className="text-[10px] text-slate-500 font-mono">SERVICIOS MECÁNICOS PREVENTIVOS Y RECONSTRUCCIÓN</p>
                  <p className="text-[10px] text-slate-500">Dirección: Avda. Central de Vehículos 2026, Of. 3 • Tel: +56 9 8765 4321</p>
                </div>
                <div className="text-right space-y-1">
                  <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 print:bg-white inline-block">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase font-mono">Planilla de Trabajo N°</span>
                    <strong className="text-base text-slate-900 font-mono font-extrabold">{mainOrder.orderNumber}</strong>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono">Fecha Ingreso: {new Date(mainOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {/* SECTION 1: PROPIETARIO DEL VEHÍCULO Y CONTACTO */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-sans border-b border-slate-200 pb-1 flex items-center gap-1">
                  <User className="w-4 h-4 text-slate-500 print:hidden" />
                  DATOS DE LA PERSONA PROPIETARIA (DUEÑO)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl print:bg-white print:border print:border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Nombre del Cliente</span>
                    <strong className="text-xs text-slate-800 font-bold">{mainClient ? mainClient.name : 'N/A'}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Número identificatorio (Cédula de Identidad)</span>
                    <strong className="text-xs text-slate-800 font-bold font-mono">{mainClient ? mainClient.taxId : 'N/A'}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Teléfono de Contacto</span>
                    <strong className="text-xs text-slate-800 font-bold">{mainClient ? mainClient.phone : 'N/A'}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Correo Electrónico</span>
                    <span className="text-xs text-slate-600 font-medium">{mainClient ? mainClient.email : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Dirección Particular</span>
                    <span className="text-xs text-slate-600 font-medium">{mainClient ? (mainClient.address || "Dirección no registrada") : 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DATOS DEL VEHÍCULO */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-sans border-b border-slate-200 pb-1 flex items-center gap-1">
                  <Car className="w-4 h-4 text-slate-500 print:hidden" />
                  ESPECIFICACIÓN COMPLETA DEL VEHÍCULO
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-slate-50 p-4 rounded-xl print:bg-white print:border print:border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Marca</span>
                    <span className="text-xs text-slate-800 font-bold">{mainVehicle ? mainVehicle.brand : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Modelo</span>
                    <span className="text-xs text-slate-800 font-bold">{mainVehicle ? mainVehicle.model : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Año</span>
                    <span className="text-xs text-slate-800 font-bold font-mono">{mainVehicle ? mainVehicle.year : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Patente / Matrícula</span>
                    <span className="text-xs text-indigo-700 font-mono font-extrabold uppercase bg-indigo-50 px-1.5 py-0.5 rounded print:p-0 print:bg-transparent">{mainVehicle ? mainVehicle.plate : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Motorización / Cilindrada</span>
                    <span className="text-xs text-slate-800 font-bold font-mono">{mainVehicle ? (mainVehicle.engine || "N/A") : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Kilometraje de Entrada</span>
                    <span className="text-xs text-slate-700 font-bold font-mono">{mainOrder.mileage.toLocaleString()} KM</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Nivel de Combustible</span>
                    <span className="text-xs text-slate-700 font-bold">{mainOrder.fuelLevel}</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Color Carrocería</span>
                    <span className="text-xs text-slate-700 font-semibold">{mainVehicle ? (mainVehicle.color || "N/A") : 'N/A'}</span>
                  </div>
                  <div className="space-y-0.5 md:col-span-2">
                    <span className="text-[9px] text-slate-400 uppercase font-mono block">Estado General de Recepción</span>
                    <span className="text-xs text-slate-600 font-medium">Bajo Diagnóstico Activo / Custodia</span>
                  </div>
                </div>
              </div>

              {/* SECTION 3: MOTIVO DE INGRESO */}
              <div className="p-3.5 bg-amber-50/20 border border-amber-200/50 rounded-xl space-y-1 print:bg-white print:border-slate-200">
                <span className="text-[9px] text-amber-800 font-extrabold uppercase font-mono block">Diagnóstico Preliminar / Síntomas Reportados por el Propietario</span>
                <p className="text-slate-700 font-medium italic leading-relaxed text-xs">
                  &ldquo;{mainOrder.description}&rdquo;
                </p>
                {mainOrder.notes && (
                  <div className="mt-2 pt-2 border-t border-dashed border-amber-200/50">
                    <span className="text-[9px] text-slate-400 font-bold uppercase font-mono block">Observaciones y notas internas del mecánico asignado:</span>
                    <p className="text-slate-600 leading-normal font-medium text-xs">{mainOrder.notes}</p>
                  </div>
                )}
              </div>

              {/* SECTION 4: PLANILLA DE TRABAJOS DETALLADOS (MANO DE OBRA) */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-sans border-b border-slate-200 pb-1">
                  DETALLE DE MANO DE OBRA, LABORES Y CONFIGURACIÓN DE PRECIOS
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden print:rounded-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <th className="py-2.5 px-3">Servicio / Labor Realizada</th>
                        <th className="py-2.5 px-3">Especificación o Breve Detalle</th>
                        <th className="py-2.5 px-3 text-center">Horas de Trabajo</th>
                        <th className="py-2.5 px-3 text-right">Precio por Hora</th>
                        <th className="py-2.5 px-3 text-right">Total Submonto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {/* Diagnostic Base cost row */}
                      <tr className="text-xs">
                        <td className="py-2 px-3 font-bold">Cargo por Diagnóstico y Control Base</td>
                        <td className="py-2 px-3 text-slate-400 italic">Inspección de de sistemas, ingreso a taller, escáner automotriz</td>
                        <td className="py-2 px-3 text-center font-mono text-slate-450">-</td>
                        <td className="py-2 px-3 text-right font-mono text-slate-450">-</td>
                        <td className="py-2 px-3 text-right font-mono font-bold">${mainOrder.laborCost.toFixed(1)}</td>
                      </tr>
                      {/* Dynamic tasks mapping */}
                      {mainOrder.tasks.length > 0 ? (
                        mainOrder.tasks.map((task) => (
                          <tr key={task.id} className="text-xs">
                            <td className="py-2 px-3 font-bold">{task.name}</td>
                            <td className="py-2 px-3 text-slate-500">{task.description || "Sin descripción"}</td>
                            <td className="py-2 px-3 text-center font-mono">{task.hours} hrs</td>
                            <td className="py-2 px-3 text-right font-mono">${task.costPerHour.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">${(task.hours * task.costPerHour).toFixed(1)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">No se registran cargos de labores secundarias en esta planilla.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: PLANILLA DE REPUESTOS Y MATERIALES COLOCADOS */}
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 text-[11px] uppercase tracking-wider font-sans border-b border-slate-200 pb-1">
                  DETALLE DE REPUESTOS, CONSUMIBLES Y MATERIALES INSTALADOS
                </h3>
                <div className="border border-slate-200 rounded-xl overflow-hidden print:rounded-none">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-[9px] text-slate-500 uppercase font-mono tracking-wider font-bold">
                        <th className="py-2.5 px-3">Denominación del Repuesto / Pieza</th>
                        <th className="py-2.5 px-3">Identificador / Origen</th>
                        <th className="py-2.5 px-3 text-center">Unidades</th>
                        <th className="py-2.5 px-3 text-right">Precio Unitario</th>
                        <th className="py-2.5 px-3 text-right">Total Submonto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {mainOrder.partsUsed.length > 0 ? (
                        mainOrder.partsUsed.map((item) => (
                          <tr key={item.partId} className="text-xs">
                            <td className="py-2 px-3 font-bold">{item.name}</td>
                            <td className="py-2 px-3 text-slate-400 font-mono text-[10px]">
                              {item.partId.startsWith('man-') ? "Ingreso Manual Libre" : `Cód Stock: ${item.partId}`}
                            </td>
                            <td className="py-2 px-3 text-center font-mono">x{item.quantity}</td>
                            <td className="py-2 px-3 text-right font-mono">${item.price.toFixed(1)}</td>
                            <td className="py-2 px-3 text-right font-mono font-bold">${(item.quantity * item.price).toFixed(1)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-slate-400 italic">No se colocaron repuestos del inventario ni piezas de recambio en este servicio.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 6: DESGLOSE ECONÓMICO FINAL */}
              <div className="p-4 bg-slate-900 text-white rounded-xl flex justify-between items-center flex-wrap gap-4 print:bg-white print:border-2 print:border-slate-900 print:text-slate-900">
                <div className="grid grid-cols-3 gap-6 text-[10px] uppercase tracking-wider font-mono font-bold text-slate-300 print:text-slate-650">
                  <div>
                    <span>Total Manos de Obra:</span>
                    <p className="text-sm text-white font-mono font-bold print:text-slate-900">
                      {Math.round(mainOrder.laborCost + mainOrder.tasks.reduce((sum, t) => sum + (t.hours * t.costPerHour), 0)).toLocaleString('es-PY')} Gs.
                    </p>
                  </div>
                  <div>
                    <span>Total Repuestos e Insumos:</span>
                    <p className="text-sm text-white font-mono font-bold print:text-slate-900">
                      {Math.round(mainOrder.partsUsed.reduce((sum, p) => sum + (p.quantity * p.price), 0)).toLocaleString('es-PY')} Gs.
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-amber-400 uppercase font-mono tracking-wider font-bold block print:text-slate-800">Monto Final Consolidado</span>
                  <strong className="text-2xl text-white font-mono font-extrabold print:text-slate-900">
                    {Math.round(mainOrder.totalCost).toLocaleString('es-PY')} Gs.
                  </strong>
                </div>
              </div>

              {/* DOUBLE SIGNATURE BLOCK */}
              <div className="grid grid-cols-2 gap-12 pt-16 text-center text-[11px] font-sans">
                <div className="space-y-1">
                  <div className="border-t border-slate-400/80 w-48 mx-auto mt-6"></div>
                  <strong className="font-bold text-slate-800 block">Firma del Mecánico Principal</strong>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Taller Central Express</span>
                </div>
                <div className="space-y-1">
                  <div className="border-t border-slate-400/80 w-48 mx-auto mt-6"></div>
                  <strong className="font-bold text-slate-800 block">Firma de Conformidad Cliente</strong>
                  <span className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">C.I. / Ced.: {mainClient ? mainClient.taxId : '......................'}</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
