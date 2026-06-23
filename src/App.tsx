import React, { useState, useEffect } from "react";
import {
  Wrench,
  Users,
  ClipboardList,
  Boxes,
  CircleDollarSign,
  Menu,
  X,
  Car,
  Award,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Settings,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import {
  Cliente,
  Vehiculo,
  OrdenTrabajo,
  Repuesto,
  Factura,
  Presupuesto,
  OrderStatus,
  TaskItem,
} from "./types";
import {
  INITIAL_CLIENTES,
  INITIAL_VEHICULOS,
  INITIAL_REPUESTOS,
  INITIAL_ORDENES,
  INITIAL_FACTURAS,
} from "./data";

// Sub-views imports
import DashboardView from "./features/dashboard/components/DashboardView";
import ClientesVehiculosView from "./features/clientes/components/ClientesVehiculosView";
import OrdenesTrabajoView from "./features/ordenes/components/OrdenesTrabajoView";
import InventarioView from "./features/inventario/components/InventarioView";
import FacturasView from "./features/facturacion/components/FacturasView";
import PresupuestosView from "./features/facturacion/components/PresupuestosView";
import UsuariosView from "./features/usuarios/components/UsuariosView";


const authFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("erp_token");
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const res = await fetch(url, { ...options, headers });
  if (res.status === 401 && !url.includes("/api/auth/login")) {
    localStorage.removeItem("erp_token");
    window.location.reload(); // Simple way to reset state
  }
  return res;
};
export default function App() {
  const [currentView, setCurrentView] = useState<
    | "dashboard"
    | "clientes"
    | "ordenes"
    | "inventario"
    | "facturas"
    | "presupuestos"
    | "usuarios"
  >("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [globalSelectedOrderId, setGlobalSelectedOrderId] = useState<
    string | null
  >(null);
  const [globalPreselectedVehicleId, setGlobalPreselectedVehicleId] = useState<
    string | null
  >(null);

  // Core records storage
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenTrabajo[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [presupuestos, setPresupuestos] = useState<Presupuesto[]>([]);

  // Settings & Theme & Login State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeName, setThemeName] = useState<
    "claro" | "oscuro" | "minimalista"
  >("claro");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // On first mount: Load from localStorage or set default high-fidelity data
  // Carga inicial de datos desde el backend al montar el componente
  // Carga inicial de datos desde el backend al montar el componente
  useEffect(() => {
    const token = localStorage.getItem("erp_token");
    if (token) {
      setIsLoggedIn(true);
      loadData();
    }

    const savedTheme =
      (localStorage.getItem("erp_theme") as
        | "claro"
        | "oscuro"
        | "minimalista") || "claro";
    setThemeName(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  // 1. Clientes Handlers
  const handleAddCliente = async (
    newClientData: Omit<Cliente, "id" | "createdAt">,
  ) => {
    try {
      const res = await authFetch("/api/clientes", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClientData),
      });
      if (res.ok) {
        const newClient = await res.json();
        setClientes([newClient, ...clientes]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Helper to calculate total cost of order based on current tasks and materials assigned
  const computeOrderTotal = (
    tasksList: TaskItem[],
    partsList: any[],
    laborCost: number,
  ): number => {
    const tasksTotal = tasksList.reduce(
      (sum, t) => sum + t.hours * t.costPerHour,
      0,
    );
    const partsTotal = partsList.reduce(
      (sum, p) => sum + p.quantity * p.price,
      0,
    );
    return Math.round(tasksTotal + partsTotal + laborCost);
  };

  // 3. Órdenes de Trabajo Handlers
  const handleAddOrden = async (ordenData: any) => {
    try {
      const res = await authFetch("/api/ordenes", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ordenData),
      });
      if (res.ok) {
        const newOrder = await res.json();
        setOrdenes([newOrder, ...ordenes]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateImages = async (orderId: string, images: string[]) => {
    const o = ordenes.find((x) => x.id === orderId);
    if (!o) return;
    const updated = { ...o, images };
    try {
      const res = await authFetch(`/api/ordenes/${orderId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (res.ok) {
        const data = await res.json();
        setOrdenes(ordenes.map((x) => (x.id === orderId ? data : x)));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatusFactura = (
    facturaId: string,
    status: "pagada" | "pendiente" | "anulada",
  ) => {
    const invoice = facturas.find((f) => f.id === facturaId);

    const updated = facturas.map((f) =>
      f.id === facturaId ? { ...f, status } : f,
    );
    setFacturas(updated);
    // Advance work order step logistically if invoice is paid
    if (invoice && status === "pagada") {
      handleUpdateOrderStatus(invoice.orderId, "terminado");
    }
  };

  const handleUpdateFactura = async (facturaId: string, updatedData: Partial<Factura>) => {
    const f = facturas.find(x => x.id === facturaId);
    if (!f) return;
    const payload = { ...f, ...updatedData };
    try {
      const res = await authFetch(`/api/facturas/${facturaId}`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        setFacturas(
          facturas.map((f) => (f.id === facturaId ? data : f)),
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateCliente = async (updatedClient: Cliente) => {
    try {
      const res = await authFetch(`/api/clientes/${updatedClient.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedClient) });
      if (res.ok) { const data = await res.json(); setClientes(clientes.map(c => c.id === updatedClient.id ? data : c)); }
    } catch(e) { console.error(e); }
  };

  const handleAddVehiculo = async (newVehicleData: Omit<Vehiculo, "id">) => {
    try {
      const res = await authFetch('/api/vehiculos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newVehicleData) });
      if (res.ok) { const newVeh = await res.json(); setVehiculos([newVeh, ...vehiculos]); }
    } catch(e) { console.error(e); }
  };

  const handleDeleteVehiculo = async (vehicleId: string) => {
    try {
      const res = await authFetch(`/api/vehiculos/${vehicleId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` } });
      if (res.ok) { setVehiculos(vehiculos.filter(v => v.id !== vehicleId)); }
    } catch(e) { console.error(e); }
  };

  const handleUpdateVehiculo = async (updatedVeh: Vehiculo) => {
    try {
      const res = await authFetch(`/api/vehiculos/${updatedVeh.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedVeh) });
      if (res.ok) { const data = await res.json(); setVehiculos(vehiculos.map(v => v.id === updatedVeh.id ? data : v)); }
    } catch(e) { console.error(e); }
  };

  const handleSelectVehicleAndNavigate = (vehicleId: string) => {
    const vehicleOrders = ordenes.filter((o) => o.vehicleId === vehicleId);
    if (vehicleOrders.length > 0) {
      const sorted = [...vehicleOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGlobalSelectedOrderId(sorted[0].id);
      setGlobalPreselectedVehicleId(null);
    } else {
      setGlobalSelectedOrderId(null);
      setGlobalPreselectedVehicleId(vehicleId);
    }
    setCurrentView("ordenes");
  };

  const handleDashboardSelectOrder = (orderId: string) => {
    setGlobalSelectedOrderId(orderId);
    setCurrentView("ordenes");
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await authFetch(`/api/ordenes/${orderId}/status`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
      if (res.ok) { const data = await res.json(); setOrdenes(ordenes.map(o => o.id === orderId ? data : o)); }
    } catch(e) { console.error(e); }
  };

  const handleDeleteOrden = async (orderId: string) => {
    try {
      const res = await authFetch(`/api/ordenes/${orderId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` } });
      if (res.ok) {
        setOrdenes(ordenes.filter(o => o.id !== orderId));
        if (globalSelectedOrderId === orderId) setGlobalSelectedOrderId(null);
      }
    } catch(e) { console.error(e); }
  };

  const updateOrderData = async (orderId: string, transform: (o: OrdenTrabajo) => OrdenTrabajo) => {
    const o = ordenes.find(x => x.id === orderId);
    if (!o) return;
    const updated = transform(o);
    try {
      const res = await authFetch(`/api/ordenes/${orderId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      if (res.ok) { const data = await res.json(); setOrdenes(ordenes.map(x => x.id === orderId ? data : x)); }
    } catch(e) { console.error(e); }
  };

  const handleUpdateNotes = async (orderId: string, notes: string) => {
    await updateOrderData(orderId, o => ({ ...o, notes }));
  };

  const handleAddTaskToOrder = async (orderId: string, taskData: Omit<TaskItem, "id" | "status">) => {
    await updateOrderData(orderId, o => {
      const newTask = { ...taskData, id: `tsk-${Date.now()}`, status: "pendiente" as const };
      const newTasks = [...o.tasks, newTask];
      return { ...o, tasks: newTasks, totalCost: computeOrderTotal(newTasks, o.partsUsed, o.laborCost) };
    });
  };

  const handleToggleTaskStatus = async (orderId: string, taskId: string) => {
    await updateOrderData(orderId, o => {
      const newTasks = o.tasks.map(t => t.id === taskId ? { ...t, status: t.status === "pendiente" ? "completada" as const : "pendiente" as const } : t);
      return { ...o, tasks: newTasks, totalCost: computeOrderTotal(newTasks, o.partsUsed, o.laborCost) };
    });
  };

  const handleRemoveTaskFromOrder = async (orderId: string, taskId: string) => {
    await updateOrderData(orderId, o => {
      const newTasks = o.tasks.filter(t => t.id !== taskId);
      return { ...o, tasks: newTasks, totalCost: computeOrderTotal(newTasks, o.partsUsed, o.laborCost) };
    });
  };

  const handleEditTaskInOrder = async (orderId: string, taskId: string, updatedTaskData: Partial<Omit<TaskItem, "id" | "status">>) => {
    await updateOrderData(orderId, o => {
      const newTasks = o.tasks.map(t => t.id === taskId ? { ...t, ...updatedTaskData } : t);
      return { ...o, tasks: newTasks, totalCost: computeOrderTotal(newTasks, o.partsUsed, o.laborCost) };
    });
  };

  const handleAddPartToOrder = async (orderId: string, partId: string, quantity: number, customPrice?: number) => {
    const part = repuestos.find(r => r.id === partId);
    if (!part) return;
    if (part.stock < quantity) { alert(`Lo lamento, no hay stock suficiente para asignar este repuesto.`); return; }
    
    await updateOrderData(orderId, o => {
      const priceToUse = customPrice !== undefined ? customPrice : part.price;
      const existing = o.partsUsed.find(p => p.partId === partId);
      const newPartsUsed = existing ? o.partsUsed.map(p => p.partId === partId ? { ...p, quantity: p.quantity + quantity, price: priceToUse } : p) : [...o.partsUsed, { partId, name: part.name, quantity, price: priceToUse }];
      return { ...o, partsUsed: newPartsUsed, totalCost: computeOrderTotal(o.tasks, newPartsUsed, o.laborCost) };
    });
    authFetch('/api/inventario').then(r => r.json()).then(setRepuestos);
  };

  const handleAddManualPartToOrder = async (orderId: string, name: string, price: number, quantity: number) => {
    await updateOrderData(orderId, o => {
      const newPartsUsed = [...o.partsUsed, { partId: `manual-${Date.now()}`, name, quantity, price }];
      return { ...o, partsUsed: newPartsUsed, totalCost: computeOrderTotal(o.tasks, newPartsUsed, o.laborCost) };
    });
  };

  const handleRemovePartFromOrder = async (orderId: string, partId: string) => {
    await updateOrderData(orderId, o => {
      const newPartsUsed = o.partsUsed.filter(p => p.partId !== partId);
      return { ...o, partsUsed: newPartsUsed, totalCost: computeOrderTotal(o.tasks, newPartsUsed, o.laborCost) };
    });
    authFetch('/api/inventario').then(r => r.json()).then(setRepuestos);
  };

  const handleAddRepuesto = async (newPartData: Omit<Repuesto, "id">) => {
    try {
      const res = await authFetch('/api/inventario', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newPartData) });
      if (res.ok) { const newPart = await res.json(); setRepuestos([newPart, ...repuestos]); }
    } catch(e) { console.error(e); }
  };

  const handleEditRepuesto = async (updatedPart: Repuesto) => {
    try {
      const res = await authFetch(`/api/inventario/${updatedPart.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updatedPart) });
      if (res.ok) { const data = await res.json(); setRepuestos(repuestos.map(r => r.id === updatedPart.id ? data : r)); }
    } catch(e) { console.error(e); }
  };

  const handleDeleteRepuesto = async (partId: string) => {
    try {
      const res = await authFetch(`/api/inventario/${partId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` } });
      if (res.ok) { setRepuestos(repuestos.filter(r => r.id !== partId)); }
    } catch(e) { console.error(e); }
  };

  const handleUpdateStockDelta = async (partId: string, adjustment: number) => {
    const r = repuestos.find(x => x.id === partId);
    if (!r) return;
    try {
      const res = await authFetch(`/api/inventario/${partId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r, stock: r.stock + adjustment }) });
      if (res.ok) { const data = await res.json(); setRepuestos(repuestos.map(x => x.id === partId ? data : x)); }
    } catch(e) { console.error(e); }
  };

  const handleUpdateMinStock = async (partId: string, newMin: number) => {
    const r = repuestos.find(x => x.id === partId);
    if (!r) return;
    try {
      const res = await authFetch(`/api/inventario/${partId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...r, minStock: newMin }) });
      if (res.ok) { const data = await res.json(); setRepuestos(repuestos.map(x => x.id === partId ? data : x)); }
    } catch(e) { console.error(e); }
  };

  const handleAddFactura = async (newFacturaData: any) => {
    try {
      const res = await authFetch('/api/facturas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newFacturaData) });
      if (res.ok) { const newFactura = await res.json(); setFacturas([newFactura, ...facturas]); }
    } catch(e) { console.error(e); }
  };

  const handleDeleteFactura = async (facturaId: string) => {
    try {
      const res = await authFetch(`/api/facturas/${facturaId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` } });
      if (res.ok) { setFacturas(facturas.filter(f => f.id !== facturaId)); }
    } catch(e) { console.error(e); }
  };

  const handlePayFactura = async (facturaId: string) => {
    const f = facturas.find(x => x.id === facturaId);
    if (!f) return;
    try {
      const res = await authFetch(`/api/facturas/${facturaId}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, status: "pagada" }) });
      if (res.ok) { const data = await res.json(); setFacturas(facturas.map(x => x.id === facturaId ? data : x)); }
    } catch(e) { console.error(e); }
  };

  const handleAddPresupuesto = async (p: any) => {
    try {
      const res = await authFetch('/api/presupuestos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
      if (res.ok) { const newP = await res.json(); setPresupuestos([newP, ...presupuestos]); }
    } catch(e) { console.error(e); }
  };

  const handleUpdatePresupuesto = async (updated: Presupuesto) => {
    try {
      const res = await authFetch(`/api/presupuestos/${updated.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
      if (res.ok) { const data = await res.json(); setPresupuestos(presupuestos.map(p => p.id === updated.id ? data : p)); }
    } catch(e) { console.error(e); }
  };

  const handleDeletePresupuesto = async (id: string) => {
    try {
      const res = await authFetch(`/api/presupuestos/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${localStorage.getItem('erp_token')}` } });
      if (res.ok) { setPresupuestos(presupuestos.filter(p => p.id !== id)); }
    } catch(e) { console.error(e); }
  };


  // Demo hard-reset tool
  const handleHardResetDemo = () => {
    localStorage.removeItem("erp_clientes");
    localStorage.removeItem("erp_vehiculos");
    localStorage.removeItem("erp_ordenes");
    localStorage.removeItem("erp_repuestos");
    localStorage.removeItem("erp_facturas");
    window.location.reload();
  };

  const handleThemeChange = (t: "claro" | "oscuro" | "minimalista") => {
    setThemeName(t);
    localStorage.setItem("erp_theme", t);
    document.documentElement.setAttribute("data-theme", t);
  };

  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUser || !loginPass) return;
    try {
      const res = await authFetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginUser, password: loginPass })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem("erp_token", data.token);
        setIsLoggedIn(true);
        loadData();
      } else {
        alert("Credenciales incorrectas");
      }
    } catch(e) {
      console.error(e);
      alert("Error en el login");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("erp_token");
    setIsLoggedIn(false);
    setLoginUser("");
    setLoginPass("");
  };

  const loadData = () => {
    const token = localStorage.getItem("erp_token");
    if (!token) return;
    
    Promise.all([
      authFetch("/api/clientes").then((r) => { if (!r.ok) throw new Error("401"); return r.json(); }),
      authFetch("/api/vehiculos").then((r) => r.json()),
      authFetch("/api/ordenes").then((r) => r.json()),
      authFetch("/api/inventario").then((r) => r.json()),
      authFetch("/api/facturas").then((r) => r.json()),
      authFetch("/api/presupuestos").then((r) => r.json()),
    ])
      .then(
        ([clientes, vehiculos, ordenes, repuestos, facturas, presupuestos]) => {
          setClientes(clientes);
          setVehiculos(vehiculos);
          setOrdenes(ordenes);
          setRepuestos(repuestos);
          setFacturas(facturas);
          setPresupuestos(presupuestos);
        },
      )
      .catch((err) => {
        console.error("Error al cargar datos del servidor:", err);
        if (err.message === "401") {
           handleLogout();
        }
      });
  };


  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" id="fullscreen_login_root">
        {/* Un espectacular y elegante panel de login para el taller */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-800 flex flex-col">
          <div className="p-8 pb-6 bg-slate-950 flex flex-col items-center select-none text-center">
            <div className="p-3 bg-indigo-600 rounded-2xl text-white mb-3 shadow-lg shadow-indigo-600/30">
              <Wrench className="w-6 h-6 animate-pulse" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white font-sans uppercase">
              Auto Tech
            </h1>
            <span className="text-xs font-mono font-bold tracking-widest text-indigo-400 block uppercase mt-0.5">
              ERP System IA
            </span>
            <p className="text-xs text-slate-400 mt-3 max-w-xs font-sans">
              Por favor ingrese sus credenciales para acceder al sistema integrado de gestión.
            </p>
          </div>

          <div className="p-8 space-y-6 bg-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Email / Usuario
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3.5 text-xs text-slate-400 font-bold">@</span>
                  <input
                    type="text"
                    required
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder="admin"
                    className="w-full text-xs pl-8 pr-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contraseña
                </label>
                <input
                  type="password"
                  required
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-xs px-3 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer mt-2 shadow-md shadow-indigo-600/15 font-sans uppercase tracking-wider"
              >
                Ingresar al ERP
              </button>
            </form>
            <div className="pt-4 border-t border-slate-100 text-center">
              <span className="text-[10px] font-mono font-semibold text-slate-400 block">
                CREDENCIALES DEMO: admin / admin
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-slate-50 flex" id="app_root_layout">
      {/* Dynamic Sidebar / Navigation Drawer */}
      <aside
        className={`w-64 bg-slate-900 text-slate-400 shrink-0 flex flex-col justify-between border-r border-slate-950 p-5 ${
          isSidebarOpen ? "fixed inset-y-0 left-0 z-50" : "hidden lg:flex"
        }`}
      >
        <div className="space-y-6">
          {/* Logo / Title BRAND */}
          <div className="flex items-center gap-2.5 pb-4 border-b border-slate-800 select-none">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Wrench className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white font-sans uppercase">
                Auto Tech
              </h1>
              <span className="text-[10px] font-mono font-bold tracking-widest text-indigo-400 block uppercase">
                ERP System IA
              </span>
            </div>
          </div>

          {/* Navigation Links list */}
          <nav className="space-y-1">
            <button
              onClick={() => {
                setCurrentView("dashboard");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "dashboard"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" /> Panel General
            </button>

            <button
              onClick={() => {
                setCurrentView("clientes");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "clientes"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <Users className="w-4 h-4 shrink-0" /> Clientes y Autos
            </button>

            <button
              onClick={() => {
                setCurrentView("ordenes");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "ordenes"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" /> Órdenes de Trabajo
            </button>

            <button
              onClick={() => {
                setCurrentView("inventario");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "inventario"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <Boxes className="w-4 h-4 shrink-0" /> Control Inventario
            </button>

            <button
              onClick={() => {
                setCurrentView("facturas");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "facturas"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <CircleDollarSign className="w-4 h-4 shrink-0" /> Caja y
              Facturación
            </button>

            <button
              onClick={() => {
                setCurrentView("presupuestos");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "presupuestos"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <ClipboardList className="w-4 h-4 shrink-0" /> Presupuestos
            </button>

            <button
              onClick={() => {
                setCurrentView("usuarios");
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer ${
                currentView === "usuarios"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-slate-800/80 hover:text-slate-100"
              }`}
            >
              <Users className="w-4 h-4 shrink-0 text-slate-400" /> Gestión de Usuarios
            </button>
          </nav>
        </div>

        {/* Footer info box with hard reset template config */}
        <div className="pt-4 border-t border-slate-800">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-300 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold font-sans tracking-wide transition cursor-pointer hover:bg-slate-800/80 hover:text-slate-100"
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />{" "}
            Configuración
          </button>
        </div>
      </aside>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col"
            >
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50">
                <h2 className="text-base font-extrabold text-slate-800">
                  Configuración
                </h2>
                <button
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-1 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-5 space-y-6">
                {/* Theme options */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Apariencia UI
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {(["claro", "oscuro", "minimalista"] as const).map(
                      (themeOpt) => (
                        <button
                          key={themeOpt}
                          onClick={() => handleThemeChange(themeOpt)}
                          className={`py-2 rounded-xl text-xs font-bold font-mono transition cursor-pointer capitalize ${
                            themeName === themeOpt
                              ? "bg-indigo-600 text-white shadow-md"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {themeOpt}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {/* Login mock */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sistema de Acceso
                  </span>

                  {isLoggedIn ? (
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-100 space-y-3 text-center">
                      <p className="text-xs font-bold text-emerald-800">
                        Has accedido como:{" "}
                        <span className="font-mono">{loginUser}</span>
                      </p>
                      <button
                        onClick={handleLogout}
                        className="w-full py-2 bg-white border border-emerald-200 text-emerald-700 hover:bg-emerald-100 text-xs font-bold rounded-lg transition"
                      >
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleLogin} className="space-y-3">
                      <div className="space-y-1">
                        <input
                          type="text"
                          required
                          value={loginUser}
                          onChange={(e) => setLoginUser(e.target.value)}
                          placeholder="Usuario"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                        />
                      </div>
                      <div className="space-y-1">
                        <input
                          type="password"
                          required
                          value={loginPass}
                          onChange={(e) => setLoginPass(e.target.value)}
                          placeholder="Contraseña"
                          className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg bg-slate-50"
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition cursor-pointer mt-1 shadow-sm"
                      >
                        Ingresar
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        {/* Top Header navbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-4 flex justify-between items-center select-none shrink-0 Header_Toolbar">
          <div className="flex items-center gap-3">
            {/* Burger triggers */}
            <button
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              className="p-1 px-2.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg lg:hidden text-slate-700 cursor-pointer"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <span className="text-slate-400 font-mono text-xs hidden sm:inline uppercase font-bold tracking-widest">
              SISTEMA DE GESTIÓN TALLER AUTOMOTRIZ
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="text-[11px] font-mono text-slate-400 font-bold hidden sm:inline uppercase">
                Servidor API ONLINE (Puerto: 3000)
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Frame views loading */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 3 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -3 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {currentView === "dashboard" && (
                <DashboardView
                  clientes={clientes}
                  vehiculos={vehiculos}
                  ordenes={ordenes}
                  repuestos={repuestos}
                  facturas={facturas}
                  onNavigate={setCurrentView}
                  onSelectOrder={handleDashboardSelectOrder}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onAddTask={handleAddTaskToOrder}
                  onAddPartToOrder={handleAddPartToOrder}
                  onAddManualPartToOrder={handleAddManualPartToOrder}
                  onUpdateNotes={handleUpdateNotes}
                />
              )}

              {currentView === "clientes" && (
                <ClientesVehiculosView
                  clientes={clientes}
                  vehiculos={vehiculos}
                  ordenes={ordenes}
                  onAddCliente={handleAddCliente}
                  onUpdateCliente={handleUpdateCliente}
                  onAddVehiculo={handleAddVehiculo}
                  onDeleteVehiculo={handleDeleteVehiculo}
                  onUpdateVehiculo={handleUpdateVehiculo}
                  onSelectVehicleAndNavigate={handleSelectVehicleAndNavigate}
                  onSelectOrderAndNavigate={(orderId) => {
                    setGlobalSelectedOrderId(orderId);
                    setCurrentView("ordenes");
                  }}
                />
              )}

              {currentView === "ordenes" && (
                <OrdenesTrabajoView
                  ordenes={ordenes}
                  clientes={clientes}
                  vehiculos={vehiculos}
                  repuestos={repuestos}
                  onAddOrden={handleAddOrden}
                  onUpdateStatus={handleUpdateOrderStatus}
                  onAddTask={handleAddTaskToOrder}
                  onToggleTask={handleToggleTaskStatus}
                  onRemoveTask={handleRemoveTaskFromOrder}
                  onEditTask={handleEditTaskInOrder}
                  onAddPartToOrder={handleAddPartToOrder}
                  onAddManualPartToOrder={handleAddManualPartToOrder}
                  onRemovePartFromOrder={handleRemovePartFromOrder}
                  onUpdateNotes={handleUpdateNotes}
                  onDeleteOrden={handleDeleteOrden}
                  onUpdateImages={handleUpdateImages}
                  selectedOrderIdFromGlobal={globalSelectedOrderId}
                  onClearGlobalSelection={() => setGlobalSelectedOrderId(null)}
                  preselectedVehicleIdFromGlobal={globalPreselectedVehicleId}
                  onClearGlobalPreselectedVehicleId={() =>
                    setGlobalPreselectedVehicleId(null)
                  }
                />
              )}

              {currentView === "inventario" && (
                <InventarioView
                  repuestos={repuestos}
                  onAddRepuesto={handleAddRepuesto}
                  onUpdateStock={handleUpdateStockDelta}
                  onUpdateMinStock={handleUpdateMinStock}
                  onEditRepuesto={handleEditRepuesto}
                  onDeleteRepuesto={handleDeleteRepuesto}
                />
              )}

              {currentView === "facturas" && (
                <FacturasView
                  facturas={facturas}
                  ordenes={ordenes}
                  clientes={clientes}
                  vehiculos={vehiculos}
                  onAddFactura={handleAddFactura}
                  onUpdateStatusFactura={handleUpdateStatusFactura}
                  onUpdateFactura={handleUpdateFactura}
                  onDeleteFactura={handleDeleteFactura}
                />
              )}

              {currentView === "presupuestos" && (
                <PresupuestosView
                  presupuestos={presupuestos}
                  onAddPresupuesto={handleAddPresupuesto}
                  onDeletePresupuesto={handleDeletePresupuesto}
                />
              )}

              {currentView === "usuarios" && (
                <UsuariosView authFetch={authFetch} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
