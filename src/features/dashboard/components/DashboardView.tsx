import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";
import { 
  Wrench, 
  Users, 
  Car, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  ShieldAlert,
  Clock,
  CircleDollarSign,
  CheckCircle2,
  Plus,
  ClipboardList,
  Check,
  ChevronRight,
  User,
  PauseCircle,
  HelpCircle,
  Sparkles,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Cliente, Vehiculo, OrdenTrabajo, Repuesto, Factura, OrderStatus, TaskItem } from "../../../types";

interface DashboardViewProps {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  ordenes: OrdenTrabajo[];
  repuestos: Repuesto[];
  facturas: Factura[];
  onNavigate: (view: 'dashboard' | 'clientes' | 'ordenes' | 'inventario' | 'facturas') => void;
  onSelectOrder: (orderId: string) => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  onAddTask: (orderId: string, task: Omit<TaskItem, 'id' | 'status'>) => void;
  onAddPartToOrder: (orderId: string, partId: string, quantity: number, customPrice?: number) => void;
  onAddManualPartToOrder: (orderId: string, name: string, price: number, quantity: number) => void;
  onUpdateNotes: (orderId: string, notes: string) => void;
}

export default function DashboardView({
  clientes,
  vehiculos,
  ordenes,
  repuestos,
  facturas,
  onNavigate,
  onSelectOrder,
  onUpdateStatus,
  onAddTask,
  onAddPartToOrder,
  onAddManualPartToOrder,
  onUpdateNotes
}: DashboardViewProps) {
  
  // Tab states for monitoring
  const [dashboardStatusFilter, setDashboardStatusFilter] = useState<OrderStatus>('en_proceso');
  const [selectedDashboardOrderId, setSelectedDashboardOrderId] = useState<string | null>(null);

  // Form states for manual or automatic task/part charging (inline)
  const [inlineTaskName, setInlineTaskName] = useState("");
  const [inlineTaskCost, setInlineTaskCost] = useState<number | "">("");

  const [inlinePartId, setInlinePartId] = useState("");
  const [inlinePartQty, setInlinePartQty] = useState(1);

  const [inlineManualMode, setInlineManualMode] = useState(false);
  const [inlineManualName, setInlineManualName] = useState("");
  const [inlineManualPrice, setInlineManualPrice] = useState<number | "">("");
  const [inlineManualQty, setInlineManualQty] = useState(1);

  const [inlineNotes, setInlineNotes] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Warning List of Low Stock Spare Parts (Stock <= minStock)
  const criticalSparePartsAlert = repuestos.filter(p => p.stock <= p.minStock);

  const activeOrdersInSelectedStatus = ordenes.filter(o => o.status === dashboardStatusFilter);
  const selectedOrderObj = ordenes.find(o => o.id === selectedDashboardOrderId);

  // Notes synchronization
  useEffect(() => {
    if (selectedOrderObj) {
      setInlineNotes(selectedOrderObj.notes || "");
    } else {
      setInlineNotes("");
    }
  }, [selectedDashboardOrderId, selectedOrderObj?.notes]);

  // Default select first order
  useEffect(() => {
    if (activeOrdersInSelectedStatus.length > 0) {
      const isStillValid = activeOrdersInSelectedStatus.some(o => o.id === selectedDashboardOrderId);
      if (!isStillValid) {
        setSelectedDashboardOrderId(activeOrdersInSelectedStatus[0].id);
      }
    } else {
      setSelectedDashboardOrderId(null);
    }
  }, [dashboardStatusFilter, ordenes]);

  // Economic Metrics (Cargado en Guaraníes!)
  const completedOrders = ordenes.filter(o => o.status === 'terminado');
  const totalTrabajosHechos = completedOrders.length;
  
  const totalMontoRecaudado = facturas
    .filter(f => f.status === 'pagada')
    .reduce((sum, f) => sum + f.total, 0);

  const totalRepuestosCost = completedOrders.reduce((sum, o) => {
    const orderPartsCost = o.partsUsed.reduce((partsSum, p) => partsSum + (p.price * p.quantity), 0);
    return sum + orderPartsCost;
  }, 0);

  const totalManoObraCost = completedOrders.reduce((sum, o) => {
    const orderTasksCost = o.tasks.reduce((tSum, t) => tSum + (t.hours * t.costPerHour), 0);
    return sum + o.laborCost + orderTasksCost;
  }, 0);

  // --- TRABAJOS POR DIA E INGRESOS EN GUARANÍES ---
  // Today's Date String
  const todayStr = new Date().toISOString().split('T')[0];

  // Group completed jobs by day
  const completedJobsByDate = completedOrders.reduce((acc, ord) => {
    if (!ord.createdAt) return acc;
    const dateStr = ord.createdAt.split('T')[0];
    acc[dateStr] = (acc[dateStr] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group paid incomes by day
  const earningsByDate = facturas
    .filter(f => f.status === 'pagada')
    .reduce((acc, f) => {
      const dateStr = (f.issueDate || todayStr).split('T')[0];
      acc[dateStr] = (acc[dateStr] || 0) + f.total;
      return acc;
    }, {} as Record<string, number>);

  // Distinct dates of activity to display (including today) chronologically
  const activityDates = Array.from(new Set([
    todayStr,
    ...completedOrders.map(o => o.createdAt?.split('T')[0]).filter(Boolean),
    ...facturas.filter(f => f.status === 'pagada').map(f => (f.issueDate || todayStr).split('T')[0])
  ])).sort((a, b) => b.localeCompare(a)).slice(0, 5); // top 5 most recent active days

  // Today stats fallback / highlight
  const jobsCompletedToday = completedJobsByDate[todayStr] || 0;
  const earningsToday = earningsByDate[todayStr] || 0;

  // Submit Handlers
  const handleInlineAddTask = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDashboardOrderId || !inlineTaskName) return;
    onAddTask(selectedDashboardOrderId, {
      name: inlineTaskName,
      description: "Ingresada desde Panel de Avances Rápidos",
      hours: 1,
      costPerHour: Number(inlineTaskCost) || 0
    });
    setInlineTaskName("");
    setInlineTaskCost("");
  };

  const handleInlineAddPart = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedDashboardOrderId) return;

    if (inlineManualMode) {
      if (!inlineManualName || inlineManualQty <= 0) return;
      onAddManualPartToOrder(selectedDashboardOrderId, inlineManualName, Number(inlineManualPrice) || 0, Number(inlineManualQty));
      setInlineManualName("");
      setInlineManualPrice("");
      setInlineManualQty(1);
    } else {
      if (!inlinePartId || inlinePartQty <= 0) return;
      onAddPartToOrder(selectedDashboardOrderId, inlinePartId, Number(inlinePartQty));
      setInlinePartId("");
      setInlinePartQty(1);
    }
  };

  const handleInlineSaveNotes = () => {
    if (!selectedDashboardOrderId) return;
    onUpdateNotes(selectedDashboardOrderId, inlineNotes);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const getDayNameLabel = (dateStr: string) => {
    if (dateStr === todayStr) return "Hoy (Actual)";
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (dateStr === yesterday) return "Ayer";
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  };

  return (
    <div className="space-y-6 animate-fade-in" id="dashboard_panel">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold font-sans tracking-tight text-slate-800">Panel de Control General</h2>
          <p className="text-slate-500 text-sm">Resumen financiero y logístico del taller de autos en Guaraníes (Gs.).</p>
        </div>
        <div className="flex gap-2">
          <button 
            id="btn_crear_orden_quick"
            onClick={() => onNavigate('ordenes')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition cursor-pointer shadow-xs font-sans"
          >
            <Wrench className="w-4 h-4" /> Nueva Orden de Trabajo
          </button>
        </div>
      </div>

      {/* SYSTEM BROADCAST / CRITICAL STOCK ALERTS */}
      {criticalSparePartsAlert.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-3xs" id="dashboard_stock_alerts_panel">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-xl shrink-0 animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-xs font-black text-rose-900 uppercase tracking-wide">¡ALERTA DE REPUESTOS CRÍTICOS (BAJO STOCK MÍNIMO)!</h4>
              <p className="text-[11px] text-rose-700">Se detectaron {criticalSparePartsAlert.length} repuestos cuyos niveles en stock alcanzaron o son menores al mínimo configurado.</p>
              
              {/* Horizontal scroll list of warning items */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {criticalSparePartsAlert.map(part => (
                  <span 
                    key={part.id} 
                    onClick={() => onNavigate('inventario')}
                    className="cursor-pointer px-2 py-1 bg-white hover:bg-rose-100 border border-rose-200 text-[10px] font-mono font-bold text-rose-800 rounded-lg flex items-center gap-1.5 transition"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                    {part.code} ({part.name}): <strong>{part.stock} uds.</strong> (mín. {part.minStock})
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('inventario')}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-[10px] font-bold transition flex items-center gap-1 cursor-pointer self-stretch md:self-auto justify-center"
          >
            Reponer Stock <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Grid of Key Indicators in Paraguayan Guaraníes (Gs.) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Cantidad de trabajos hechos */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
          id="stat_trabajos_hechos"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Trabajos Regulados</span>
            <p className="text-3xl font-extrabold text-indigo-600">{totalTrabajosHechos}</p>
            <p className="text-xs text-slate-500 font-medium">Órdenes terminadas de todos los tiempos</p>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 2: Monto Recaudado */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
          id="stat_monto_recaudado"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Ingresos Caja Cobrados</span>
            <p className="text-2xl font-extrabold text-emerald-600">{Math.round(totalMontoRecaudado).toLocaleString('es-PY')} Gs.</p>
            <p className="text-xs text-slate-500 font-medium">Facturas cobradas con éxito</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CircleDollarSign className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 3: Inversión en Repuestos */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
          id="stat_cuanto_en_repuestos"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Gasto en Repuestos</span>
            <p className="text-2xl font-extrabold text-cyan-600">{Math.round(totalRepuestosCost).toLocaleString('es-PY')} Gs.</p>
            <p className="text-xs text-slate-500 font-medium">Asignados a órdenes terminadas</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-xl">
            <ClipboardList className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Card 4: Monto en Mano de Obra */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between"
          id="stat_cuanto_en_mano_obra"
        >
          <div className="space-y-1">
            <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest block">Mano de Obra Facturada</span>
            <p className="text-2xl font-extrabold text-amber-600">{Math.round(totalManoObraCost).toLocaleString('es-PY')} Gs.</p>
            <p className="text-xs text-slate-500 font-medium">Labores técnicas de mecánicos</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
        </motion.div>
      </div>


    </div>
  );
}
