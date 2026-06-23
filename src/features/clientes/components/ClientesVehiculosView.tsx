import { useState, FormEvent } from "react";
import { 
  Users, 
  UserPlus, 
  IdCard, 
  Phone, 
  Mail, 
  MapPin, 
  Car, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  CheckCircle,
  FileText,
  SlidersHorizontal,
  PlusCircle,
  Calendar,
  Palette,
  Wrench,
  Sparkles,
  Layers,
  ChevronRight,
  Info,
  Check,
  X,
  ShieldCheck,
  ArrowLeft
} from "lucide-react";
import { Cliente, Vehiculo, OrdenTrabajo } from "../../../types";

interface ClientesVehiculosViewProps {
  clientes: Cliente[];
  vehiculos: Vehiculo[];
  ordenes: OrdenTrabajo[];
  onAddCliente: (cliente: Omit<Cliente, 'id' | 'createdAt'>) => void;
  onUpdateCliente: (cliente: Cliente) => void;
  onAddVehiculo: (vehiculo: Omit<Vehiculo, 'id'>) => void;
  onDeleteVehiculo: (vehiculoId: string) => void;
  onUpdateVehiculo: (vehiculo: Vehiculo) => void;
  onSelectVehicleAndNavigate?: (vehicleId: string) => void;
  onSelectOrderAndNavigate?: (orderId: string) => void;
}

export default function ClientesVehiculosView({
  clientes,
  vehiculos,
  ordenes,
  onAddCliente,
  onUpdateCliente,
  onAddVehiculo,
  onDeleteVehiculo,
  onUpdateVehiculo,
  onSelectVehicleAndNavigate,
  onSelectOrderAndNavigate
}: ClientesVehiculosViewProps) {
  // Navigation tabs state
  const [activeTab, setActiveTab] = useState<'clientes' | 'autos'>('clientes');

  const [expandedClientCars, setExpandedClientCars] = useState<string | null>(null);

  // VIEW 1: Client Centric states
  const [selectedClientId, setSelectedClientId] = useState<string | null>(clientes[0]?.id || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [editClientData, setEditClientData] = useState<Cliente | null>(null);
  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    engine: "",
    plate: "",
    color: ""
  });

  // VIEW 2: General Cars Panel states
  const [autoSearchQuery, setAutoSearchQuery] = useState("");
  const [brandFilter, setBrandFilter] = useState("todos");
  const [isAddingAutoGeneral, setIsAddingAutoGeneral] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [editingVData, setEditingVData] = useState<Vehiculo | null>(null);

  // States for inline owner typing assignment and expanding history
  const [expandedHistoryVehicleId, setExpandedHistoryVehicleId] = useState<string | null>(null);
  const [inlineAssigningVId, setInlineAssigningVId] = useState<string | null>(null);
  const [ownerInputText, setOwnerInputText] = useState("");

  // New vehicle in general list (allows direct owner selection)
  const [newAutoGeneral, setNewAutoGeneral] = useState({
    brand: "",
    model: "",
    year: new Date().getFullYear(),
    engine: "",
    plate: "",
    color: "",
    ownerId: clientes[0]?.id || ""
  });

  // Unique list of manufacturers for select filter
  const uniqueBrands = ["todos", ...Array.from(new Set(vehiculos.map(v => v.brand)))];

  // Filters for client-centric view
  const filteredClientes = clientes.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.taxId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedClient = clientes.find(c => c.id === selectedClientId);
  const clientVehicles = vehiculos.filter(v => v.ownerId === selectedClientId);

  // Filters for central cars panel view
  const filteredVehiclesGeneral = vehiculos.filter(v => {
    const owner = clientes.find(c => c.id === v.ownerId);
    const ownerName = owner ? owner.name.toLowerCase() : "";
    const matchesSearch = v.brand.toLowerCase().includes(autoSearchQuery.toLowerCase()) || 
                          v.model.toLowerCase().includes(autoSearchQuery.toLowerCase()) || 
                          v.plate.toLowerCase().includes(autoSearchQuery.toLowerCase()) ||
                          ownerName.includes(autoSearchQuery.toLowerCase());
    
    const matchesBrand = brandFilter === "todos" || v.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  // Submit handers Client
  const handleCreateClient = (e: FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.taxId) return;
    onAddCliente(newClient);
    setNewClient({ name: "", email: "", phone: "", taxId: "", address: "" });
    setIsAddingClient(false);
  };

  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    taxId: "",
    address: ""
  });

  const handleUpdateClientSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editClientData) return;
    onUpdateCliente(editClientData);
    setEditClientData(null);
  };

  const handleCreateVehicle = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClientId || !newVehicle.brand || !newVehicle.model || !newVehicle.plate) return;
    onAddVehiculo({
      ...newVehicle,
      plate: newVehicle.plate.toUpperCase(),
      ownerId: selectedClientId
    });
    setNewVehicle({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      engine: "",
      plate: "",
      color: ""
    });
    setIsAddingVehicle(false);
  };

  // Submit handlers General Auto Panel
  const handleCreateAutoGeneral = (e: FormEvent) => {
    e.preventDefault();
    if (!newAutoGeneral.brand || !newAutoGeneral.model || !newAutoGeneral.plate || !newAutoGeneral.ownerId) {
      alert("Marca, modelo, patente y dueño son campos obligatorios.");
      return;
    }
    onAddVehiculo({
      brand: newAutoGeneral.brand,
      model: newAutoGeneral.model,
      year: Number(newAutoGeneral.year),
      engine: newAutoGeneral.engine,
      plate: newAutoGeneral.plate.toUpperCase(),
      color: newAutoGeneral.color,
      ownerId: newAutoGeneral.ownerId
    });
    setNewAutoGeneral({
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      engine: "",
      plate: "",
      color: "",
      ownerId: clientes[0]?.id || ""
    });
    setIsAddingAutoGeneral(false);
  };

  const startEditingVehicle = (v: Vehiculo) => {
    setEditingVehicleId(v.id);
    setEditingVData({ ...v });
  };

  const handleSaveVehicleEdit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingVData) return;
    onUpdateVehiculo({
      ...editingVData,
      plate: editingVData.plate.toUpperCase()
    });
    // Reset states
    setEditingVehicleId(null);
    setEditingVData(null);
  };

  // Stats calculators
  const avgYear = vehiculos.length > 0 
    ? Math.round(vehiculos.reduce((sum, v) => sum + v.year, 0) / vehiculos.length) 
    : new Date().getFullYear();
  const recentVehicles = vehiculos.filter(v => v.year >= 2022).length;

  return (
    <div className="space-y-6" id="client_vehicles_master">
      
      {/* 1. Header with Tab selection */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        <div className="flex bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('clientes')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'clientes'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" /> Gestión por Cliente
          </button>
          <button
            id="tab_trigger_autos_panel"
            onClick={() => setActiveTab('autos')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'autos'
                ? 'bg-white text-indigo-600 shadow-xs'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Car className="w-4 h-4" /> Panel General de Autos
          </button>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-slate-400 font-bold tracking-widest font-mono uppercase select-none">
          {activeTab === 'clientes' ? (
            <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px]">Asociación Directa</span>
          ) : (
            <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[10px]">Flota Multimarca</span>
          )}
        </div>
      </div>

      {/* TAB A: CLIENT CENTRIC MANAGEMENT */}
      {activeTab === 'clientes' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in" id="client_vehicles_panel">
          {/* Left Column: Customers Register */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-5 flex flex-col h-[calc(100vh-270px)] min-h-[500px]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-5.0">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Clientes</h3>
              </div>
              <button
                id="btn_new_client_dialog"
                onClick={() => {
                  setEditClientData(null);
                  setIsAddingClient(prev => !prev);
                }}
                className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" /> Nuevo
              </button>
            </div>

            {isAddingClient && (
              <form onSubmit={handleCreateClient} className="py-4 space-y-3 bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50 mt-3" id="form_add_client">
                <h4 className="text-xs font-mono font-bold text-indigo-700 uppercase">Ingresar Nuevo Cliente</h4>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 text-slate-800 font-semibold"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">RUT / Identidad *</label>
                    <input
                      type="text"
                      required
                      value={newClient.taxId}
                      onChange={(e) => setNewClient({ ...newClient, taxId: e.target.value })}
                      className="w-full text-[11px] px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 text-slate-800 font-bold"
                      placeholder="12.345.678-9 / RFC"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Teléfono *</label>
                    <input
                      type="text"
                      required
                      value={newClient.phone}
                      onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                      className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 text-slate-800 font-semibold"
                      placeholder="+56 9 1234"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Email</label>
                  <input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 text-slate-800 font-semibold"
                    placeholder="juan@correo.com"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Dirección</label>
                  <input
                    type="text"
                    value={newClient.address}
                    onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                    className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden focus:border-indigo-500 text-slate-800 font-medium"
                    placeholder="Calle San Martín"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Guardar Cliente
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingClient(false)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}

            <div className="relative mt-3 mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por nombre, RUT..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs outline-hidden focus:bg-white focus:border-indigo-500 text-slate-700 font-bold"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 mt-2 pr-1 select-none">
              {filteredClientes.length > 0 ? (
                filteredClientes.map(c => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setEditClientData(null);
                      setIsAddingVehicle(false);
                    }}
                    className={`p-3 rounded-xl flex items-center justify-between border transition cursor-pointer ${
                      selectedClientId === c.id 
                        ? 'bg-indigo-50/55 border-indigo-200 text-indigo-900 font-semibold' 
                        : 'bg-white border-transparent hover:bg-slate-50 text-slate-700 hover:border-slate-100'
                    }`}
                  >
                    <div className="space-y-0.5 animate-fade-in">
                      <p className="text-xs font-bold truncate max-w-[170px]">{c.name}</p>
                      <p className="text-[10px] font-mono text-slate-400 font-semibold">{c.taxId}</p>
                    </div>
                    <div className="text-right shrink-0 relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedClientCars(expandedClientCars === c.id ? null : c.id);
                        }}
                        className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold hover:bg-slate-200 cursor-pointer transition select-none"
                      >
                        {vehiculos.filter(v => v.ownerId === c.id).length} autos
                      </button>
                      
                      {expandedClientCars === c.id && vehiculos.filter(v => v.ownerId === c.id).length > 0 && (
                        <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 shadow-xl rounded-xl p-1.5 z-50 w-52 text-left">
                          <p className="text-[9px] font-bold text-slate-400 px-1.5 py-1 mb-0.5 uppercase tracking-wider">Flota Registrada</p>
                          {vehiculos.filter(v => v.ownerId === c.id).map(v => (
                            <button
                               key={v.id}
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setActiveTab('autos');
                                 setAutoSearchQuery(v.plate);
                                 setExpandedHistoryVehicleId(v.id);
                                 setExpandedClientCars(null);
                               }}
                               className="w-full text-left p-1.5 px-2 text-[11px] text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg font-semibold cursor-pointer transition flex items-center justify-between"
                            >
                               <span className="truncate">{v.brand} {v.model}</span>
                               <span className="font-mono text-[9px] text-slate-400 bg-slate-100 px-1 py-0.5 rounded ml-2">{v.plate}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-slate-400 text-xs">
                  No se encontraron clientes.
                </div>
              )}
            </div>
          </div>

          {/* Right Column details list specifically for owner */}
          <div className="lg:col-span-2 space-y-6">
            {selectedClient ? (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                
                {/* Client Profile card */}
                <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4 h-fit">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-600 font-mono tracking-wider uppercase">Ficha de Propietario</span>
                    <button
                      onClick={() => setEditClientData(selectedClient)}
                      className="p-1 px-2.5 bg-slate-50 hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit className="w-3.5 h-3.5" /> Editar
                    </button>
                  </div>

                  {editClientData ? (
                    <form onSubmit={handleUpdateClientSubmit} className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-mono">Nombre</label>
                        <input
                          type="text"
                          required
                          value={editClientData.name}
                          onChange={(e) => setEditClientData({ ...editClientData, name: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-mono">DNI / RUT</label>
                        <input
                          type="text"
                          required
                          value={editClientData.taxId}
                          onChange={(e) => setEditClientData({ ...editClientData, taxId: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-mono">Teléfono</label>
                        <input
                          type="text"
                          required
                          value={editClientData.phone}
                          onChange={(e) => setEditClientData({ ...editClientData, phone: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-mono">Email</label>
                        <input
                          type="email"
                          value={editClientData.email}
                          onChange={(e) => setEditClientData({ ...editClientData, email: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-mono">Dirección</label>
                        <input
                          type="text"
                          value={editClientData.address || ""}
                          onChange={(e) => setEditClientData({ ...editClientData, address: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 border border-slate-200 rounded-lg outline-hidden text-slate-800 font-semibold"
                        />
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Actualizar
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditClientData(null)}
                          className="px-2 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3 pt-2" id="client_display_details">
                      <h4 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight">{selectedClient.name}</h4>
                      
                      <div className="space-y-2.5 text-slate-600 text-xs">
                        <div className="flex items-center gap-2">
                          <IdCard className="w-4 h-4 text-slate-400 shrink-0" />
                          <span>ID/RUT: <strong className="font-mono text-slate-800 font-semibold">{selectedClient.taxId}</strong></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                          <a href={`tel:${selectedClient.phone}`} className="hover:underline hover:text-indigo-600 font-medium">{selectedClient.phone}</a>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                          <a href={`mailto:${selectedClient.email}`} className="hover:underline hover:text-indigo-600 truncate font-medium">{selectedClient.email}</a>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{selectedClient.address || "Dirección no registrada"}</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 text-[10px] font-medium text-slate-400">
                        <span>Miembro desde: {new Date(selectedClient.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Fleet of cars for this single owner */}
                <div className="md:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-xs p-5 space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-indigo-600" />
                      <h3 className="font-bold text-slate-800 text-sm">Autos en Flota</h3>
                    </div>
                    <button
                      onClick={() => setIsAddingVehicle(prev => !prev)}
                      className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Vincular Auto
                    </button>
                  </div>

                  {isAddingVehicle && (
                    <form onSubmit={handleCreateVehicle} className="p-4 bg-slate-50 border border-slate-100 rounded-xl space-y-3" id="form_add_vehicle_centric">
                      <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide">Vincular nuevo auto a {selectedClient.name}</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Marca *</label>
                          <input
                            type="text"
                            required
                            value={newVehicle.brand}
                            onChange={(e) => setNewVehicle({ ...newVehicle, brand: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-800 font-bold"
                            placeholder="Ej. Chevrolet, Toyota"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Modelo *</label>
                          <input
                            type="text"
                            required
                            value={newVehicle.model}
                            onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-800 font-bold"
                            placeholder="Ej. Onix, Corolla"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Año *</label>
                          <input
                            type="number"
                            required
                            min="1950"
                            max={new Date().getFullYear() + 1}
                            value={newVehicle.year}
                            onChange={(e) => setNewVehicle({ ...newVehicle, year: parseInt(e.target.value) || 2020 })}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg font-bold"
                            placeholder="2020"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Placa/Patente *</label>
                          <input
                            type="text"
                            required
                            value={newVehicle.plate}
                            onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-800 font-bold uppercase"
                            placeholder="AB-CD-12"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-slate-400 uppercase font-bold">Color</label>
                          <input
                            type="text"
                            value={newVehicle.color}
                            onChange={(e) => setNewVehicle({ ...newVehicle, color: e.target.value })}
                            className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-850 font-semibold"
                            placeholder="Plata"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-400 uppercase font-bold">Motorización</label>
                        <input
                          type="text"
                          value={newVehicle.engine}
                          onChange={(e) => setNewVehicle({ ...newVehicle, engine: e.target.value })}
                          className="w-full text-xs px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg outline-hidden text-slate-800 font-bold"
                          placeholder="Ej. 1.6L Flex / Electrónico"
                        />
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                        >
                          Guardar e Integrar
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAddingVehicle(false)}
                          className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition h-fit cursor-pointer"
                        >
                          Ignorar
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                    {clientVehicles.length > 0 ? (
                      clientVehicles.map(vehicle => (
                        <div
                          key={vehicle.id}
                          onClick={() => {
                            setActiveTab('autos');
                            setAutoSearchQuery(vehicle.plate);
                            setExpandedHistoryVehicleId(vehicle.id);
                          }}
                          className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex justify-between items-center relative hover:bg-slate-100/50 hover:border-indigo-200 transition group cursor-pointer"
                        >
                          <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-slate-200 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 rounded-xl transition shrink-0 mt-0.5">
                              <Car className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-xs font-bold text-slate-800">{vehicle.brand} {vehicle.model}</p>
                              <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-500 font-sans">
                                <span>Año: <strong className="text-slate-700 font-semibold">{vehicle.year}</strong></span>
                                <span className="truncate">Motor: <strong className="text-slate-700 font-mono">{vehicle.engine || "N/A"}</strong></span>
                                <span>Color: <strong className="text-slate-700 font-semibold">{vehicle.color || "N/A"}</strong></span>
                                <span className="flex items-center gap-1 font-semibold text-slate-700">
                                  Placa: 
                                  <strong className="font-mono bg-indigo-50 text-indigo-700 px-1 rounded uppercase">{vehicle.plate}</strong>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteVehiculo(vehicle.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition rounded cursor-pointer shrink-0 z-10"
                            title="Eliminar vehículo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center gap-2">
                        <Car className="w-8 h-8 text-slate-300" />
                        <p className="text-xs font-bold">No hay vehículos vinculados</p>
                        <p className="text-[10px]">Haga clic en 'Vincular Auto' para comenzar.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-10 text-center text-slate-400 space-y-2">
                <Users className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-base font-bold">Seleccione un cliente para ver su ficha</p>
                <p className="text-xs">Usted puede buscar y seleccionar cualquier fila del panel izquierdo para ver su historial vehicular e información de contacto.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB B: COMPLETE UNIFIED GENERAL VEHICLE PANEL */}
      {activeTab === 'autos' && (
        <div className="space-y-6 animate-fade-in" id="autos_central_view">
          
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
            
            {/* Search and manufacturer brand selectors */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar auto por dueño, marca, modelo o patente..."
                  value={autoSearchQuery}
                  onChange={(e) => setAutoSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100/80 rounded-xl text-xs outline-hidden focus:bg-white focus:border-indigo-500 text-slate-800 font-bold"
                />
              </div>

              <select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-slate-600 outline-hidden focus:bg-white focus:border-indigo-500 capitalize"
              >
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>{brand === "todos" ? "Marcas (Todas)" : brand}</option>
                ))}
              </select>
            </div>

            {/* Insert vehicle button from general grid */}
            <button
              id="btn_trigger_add_auto_general"
              onClick={() => setIsAddingAutoGeneral(prev => !prev)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer w-full md:w-auto justify-center shrink-0"
            >
              <PlusCircle className="w-4 h-4" /> Registrar Nuevo Auto
            </button>
          </div>

          {/* Form container to add a general vehicle with select owner */}
          {isAddingAutoGeneral && (
            <form onSubmit={handleCreateAutoGeneral} className="p-6 bg-slate-50 border border-slate-100 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in" id="form_add_auto_general">
              
              <div className="md:col-span-4 pb-2 border-b border-slate-200 flex justify-between items-center">
                <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wide">Ficha Alta Nuevo de Vehículo en Sistema</h3>
                <button 
                  type="button" 
                  onClick={() => setIsAddingAutoGeneral(false)}
                  className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Fabricante / Marca *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Chevrolet, Nissan"
                  value={newAutoGeneral.brand}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, brand: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Modelo Automóvil *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sentra, Spark GT"
                  value={newAutoGeneral.model}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, model: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Año Modelo *</label>
                <input
                  type="number"
                  required
                  min="1950"
                  max={new Date().getFullYear() + 2}
                  value={newAutoGeneral.year}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, year: parseInt(e.target.value) || 2021 })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Matrícula / Patente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. YT-8134 / Plate"
                  value={newAutoGeneral.plate}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, plate: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-extrabold uppercase placeholder:normal-case"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Color del Auto</label>
                <input
                  type="text"
                  placeholder="Ej. Rojo Metálico"
                  value={newAutoGeneral.color}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, color: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-bold">Motorización / Cilindrada</label>
                <input
                  type="text"
                  placeholder="Ej. 2.0L Turbo / 1.4"
                  value={newAutoGeneral.engine}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, engine: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-[10px] text-slate-500 uppercase font-extrabold text-indigo-700">Asignar Propietario / Dueño del Auto *</label>
                <select
                  required
                  value={newAutoGeneral.ownerId}
                  onChange={(e) => setNewAutoGeneral({ ...newAutoGeneral, ownerId: e.target.value })}
                  className="w-full text-xs px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 font-bold focus:border-indigo-500 outline-hidden"
                >
                  <option value="">-- Seleccione un Dueño/Cliente registrado --</option>
                  {clientes.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.taxId})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 items-end justify-end md:col-span-4 pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Registrar e Integrar
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingAutoGeneral(false)}
                  className="px-5 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Descartar
                </button>
              </div>
            </form>
          )}

          {editingVehicleId && editingVData && (
            <div className="p-6 bg-amber-50/50 border border-amber-100 rounded-2xl">
              <form onSubmit={handleSaveVehicleEdit} className="space-y-4">
                <div className="pb-2 border-b border-amber-200 flex justify-between items-center">
                  <h3 className="font-extrabold text-slate-850 text-xs uppercase tracking-wide">Modificar Especificación de Automóvil</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Fabricante / Marca</label>
                    <input 
                      type="text"
                      required
                      value={editingVData.brand}
                      onChange={(e) => setEditingVData({ ...editingVData, brand: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Modelo</label>
                    <input 
                      type="text"
                      required
                      value={editingVData.model}
                      onChange={(e) => setEditingVData({ ...editingVData, model: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Año Modelo</label>
                    <input 
                      type="number"
                      required
                      value={editingVData.year}
                      onChange={(e) => setEditingVData({ ...editingVData, year: parseInt(e.target.value) || 2020 })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Matrícula</label>
                    <input 
                      type="text"
                      required
                      value={editingVData.plate}
                      onChange={(e) => setEditingVData({ ...editingVData, plate: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-extrabold font-mono uppercase"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Motorización</label>
                    <input 
                      type="text"
                      value={editingVData.engine}
                      onChange={(e) => setEditingVData({ ...editingVData, engine: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Color</label>
                    <input 
                      type="text"
                      value={editingVData.color}
                      onChange={(e) => setEditingVData({ ...editingVData, color: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-3">
                    <label className="text-[10px] text-slate-500 uppercase font-bold font-mono">Dueño</label>
                    <select
                      value={editingVData.ownerId}
                      onChange={(e) => setEditingVData({ ...editingVData, ownerId: e.target.value })}
                      className="w-full text-xs px-3 py-2 bg-white border border-indigo-200 rounded-lg text-slate-800 font-bold focus:border-indigo-500 outline-hidden"
                    >
                      {clientes.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.taxId})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold px-4 py-2 transition"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingVehicleId(null);
                      setEditingVData(null);
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-bold px-4 py-2 transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* List/Row display of vehicles */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="autos_rows_table">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-705 border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-mono font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3.5 px-4 font-extrabold">Automóvil</th>
                    <th className="py-3.5 px-4 font-extrabold">Patente / Matrícula</th>
                    <th className="py-3.5 px-4 font-extrabold">Dueño / Propietario (Escribir nombre para asignar)</th>
                    <th className="py-3.5 px-4 text-center font-extrabold w-44">Historial de Trabajos</th>
                    <th className="py-3.5 px-4 text-right font-extrabold w-28">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredVehiclesGeneral.length > 0 ? (
                    filteredVehiclesGeneral.map((v) => {
                      const owner = clientes.find(c => c.id === v.ownerId);
                      const vehicleOrders = ordenes.filter(o => o.vehicleId === v.id);
                      const isExpanded = expandedHistoryVehicleId === v.id;
                      const isAssigningInline = inlineAssigningVId === v.id;

                      return (
                        <tr key={v.id} className="transition flex flex-col table-row hover:bg-slate-50/50">
                           {/* Inner container to hold matching columns */}
                           <td 
                             onClick={() => onSelectVehicleAndNavigate?.(v.id)}
                             className="py-4 px-4 font-sans focus:outline-hidden cursor-pointer hover:bg-slate-100/50 rounded-l-xl group"
                             title="Ver órdenes de trabajo"
                           >
                             <div className="flex items-center gap-2.5">
                               <div className="p-2 bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white rounded-xl shrink-0 transition">
                                 <Car className="w-4 h-4" />
                               </div>
                               <div className="min-w-0">
                                 <p className="font-extrabold text-slate-800 text-sm leading-snug group-hover:text-indigo-600 transition">{v.brand} {v.model}</p>
                                 <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold font-sans mt-0.5 whitespace-nowrap">
                                   <span>Año: {v.year}</span>
                                   <span>&bull;</span>
                                   <span className="truncate">Motor: {v.engine || "N/A"}</span>
                                   <span>&bull;</span>
                                   <span>Color: {v.color || "N/A"}</span>
                                 </div>
                               </div>
                             </div>
                           </td>

                           <td 
                             onClick={() => onSelectVehicleAndNavigate?.(v.id)}
                             className="py-4 px-4 vertical-middle align-middle cursor-pointer hover:bg-slate-100/50 group/plate"
                             title="Ver órdenes de trabajo"
                           >
                             <div className="inline-block border border-slate-300 group-hover/plate:border-indigo-400 rounded bg-white shadow-xs px-2.5 py-0.5 relative min-w-[70px] select-none text-center transition">
                               <span className="absolute top-0 inset-x-0 h-0.5 bg-blue-600 group-hover/plate:bg-indigo-650 rounded-t transition" />
                               <span className="text-[10px] font-extrabold font-mono text-slate-800 group-hover/plate:text-indigo-650 tracking-wide block uppercase leading-none pt-1 transition">
                                 {v.plate}
                               </span>
                             </div>
                           </td>

                          <td className="py-4 px-4 vertical-middle align-middle font-sans">
                            {isAssigningInline ? (
                              <div className="relative min-w-[200px] max-w-xs z-30">
                                <div className="flex gap-1 items-center">
                                  <input
                                    type="text"
                                    autoFocus
                                    className="w-full text-xs p-1.5 py-1 border border-indigo-200 focus:border-indigo-500 rounded-lg bg-white font-semibold outline-hidden"
                                    placeholder="Escriba el nombre del dueño..."
                                    value={ownerInputText}
                                    onChange={(e) => setOwnerInputText(e.target.value)}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setInlineAssigningVId(null);
                                      setOwnerInputText("");
                                    }}
                                    className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 bg-white rounded-lg h-7 w-7 flex items-center justify-center cursor-pointer shrink-0"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Floating Suggestions matching typed characters */}
                                <div className="absolute top-full left-0 right-0 max-h-40 overflow-y-auto bg-white border border-slate-100 rounded-lg shadow-lg z-50 p-1 space-y-0.5 mt-1">
                                  {clientes
                                    .filter(c => c.name.toLowerCase().includes(ownerInputText.toLowerCase()))
                                    .slice(0, 5)
                                    .map(c => (
                                      <button
                                        key={c.id}
                                        type="button"
                                        onClick={() => {
                                          onUpdateVehiculo({ ...v, ownerId: c.id });
                                          setInlineAssigningVId(null);
                                          setOwnerInputText("");
                                        }}
                                        className="w-full text-left text-[11px] hover:bg-indigo-50 hover:text-indigo-700 p-1.5 rounded-md font-bold transition flex justify-between"
                                      >
                                        <span>{c.name}</span>
                                        <span className="text-[9px] text-slate-400 font-mono font-normal">({c.taxId})</span>
                                      </button>
                                    ))}
                                  
                                  {/* Auto-create client on fly if they keep typing */}
                                  {ownerInputText.trim().length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const tempId = `cli-${Date.now()}`;
                                        onAddCliente({
                                          name: ownerInputText,
                                          taxId: `Ced-${Math.floor(10000000 + Math.random() * 90000000)}`,
                                          phone: "N/A",
                                          email: "noreply@correo.com",
                                          address: ""
                                        });
                                        onUpdateVehiculo({ ...v, ownerId: tempId });
                                        setInlineAssigningVId(null);
                                        setOwnerInputText("");
                                        alert(`Cliente "${ownerInputText}" registrado y asignado como nuevo dueño.`);
                                      }}
                                      className="w-full text-left text-[11px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-1.5 rounded-md font-bold transition flex items-center gap-1 leading-normal"
                                    >
                                      <Plus className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span>Registrar "{ownerInputText}" como nuevo dueño y vincular</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                {owner ? (
                                  <div className="flex flex-col">
                                    <strong className="font-extrabold text-slate-800 text-xs">{owner.name}</strong>
                                    <span className="text-[10px] text-slate-400 font-medium">Cédula: {owner.taxId} | Tel: {owner.phone}</span>
                                    <button
                                      onClick={() => {
                                        setInlineAssigningVId(v.id);
                                        setOwnerInputText(owner.name);
                                      }}
                                      className="text-[10px] text-indigo-600 hover:underline hover:text-indigo-700 font-extrabold text-left mt-0.5 cursor-pointer"
                                    >
                                      Cambiar dueño
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex flex-col">
                                    <span className="text-red-500 font-bold text-xs">Sin Propietario</span>
                                    <button
                                      onClick={() => {
                                        setInlineAssigningVId(v.id);
                                        setOwnerInputText("");
                                      }}
                                      className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-[10px] font-bold text-left mt-1 w-fit transition cursor-pointer"
                                    >
                                      Escribir dueño
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>

                          <td className="py-4 px-4 text-center vertical-middle align-middle">
                            <button
                              onClick={() => setExpandedHistoryVehicleId(isExpanded ? null : v.id)}
                              className={`px-3 py-1 rounded-xl text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer ${
                                isExpanded 
                                  ? 'bg-slate-900 text-white shadow-xs' 
                                  : 'bg-indigo-50 text-indigo-750 hover:bg-indigo-100'
                              }`}
                            >
                              <FileText className="w-3.5 h-3.5 shrink-0" />
                              <span>Historial ({vehicleOrders.length})</span>
                            </button>
                          </td>

                          <td className="py-4 px-4 text-right vertical-middle align-middle">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => startEditingVehicle(v)}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition cursor-pointer"
                                title="Editar características del automóvil"
                              >
                                <Edit className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  onDeleteVehiculo(v.id);
                                }}
                                className="p-1 px-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                                title="Eliminar del sistema"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        <Car className="w-10 h-10 text-slate-200 mx-auto mb-2" />
                        <p className="text-sm font-bold">No se encontraron automóviles para este filtro</p>
                        <p className="text-xs">Usted puede buscar por marca, modelo, patente o dueño registrado.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Render historical expanded table below isExpanded */}
          {expandedHistoryVehicleId && (() => {
            const selectedV = vehiculos.find(v => v.id === expandedHistoryVehicleId);
            if (!selectedV) return null;
            const historyOrders = ordenes.filter(o => o.vehicleId === expandedHistoryVehicleId);
            
            return (
              <div className="bg-slate-50 p-5 rounded-2xl border border-indigo-100/45 space-y-4 animate-fade-in relative mt-4">
                <button
                  onClick={() => {
                    setExpandedHistoryVehicleId(null);
                    setAutoSearchQuery("");
                  }}
                  className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center gap-1.5 w-fit cursor-pointer shadow-xs mb-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver al listado general
                </button>
                
                <div className="border-b border-slate-200/60 pb-2">
                  <h4 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5 uppercase font-sans">
                    <Wrench className="w-4 h-4 text-indigo-600" />
                    Historial de trabajos: {selectedV.brand} {selectedV.model} [{selectedV.plate}]
                  </h4>
                  <p className="text-xs text-slate-500">Listado cronológico de ingresos, servicios realizados y repuestos colocados en este vehículo.</p>
                </div>

                {historyOrders.length > 0 ? (
                  <div className="space-y-3.5 max-h-[400px] overflow-y-auto pr-1">
                    {historyOrders.map((order) => {
                      const laborCostTotal = order.tasks.reduce((sum, t) => sum + (t.hours * t.costPerHour), 0) + order.laborCost;
                      const partsCostTotal = order.partsUsed.reduce((sum, p) => sum + (p.price * p.quantity), 0);
                      
                      let statusBadge = "bg-slate-100 text-slate-600 border-slate-200";
                      if (order.status === "no_iniciado") statusBadge = "bg-slate-100 text-slate-700 border-slate-300";
                      else if (order.status === "en_proceso") statusBadge = "bg-blue-50 text-blue-700 border-blue-100";
                      else if (order.status === "congelado") statusBadge = "bg-amber-50 text-amber-700 border-amber-100";
                      else if (order.status === "terminado") statusBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";

                      return (
                        <div 
                          key={order.id} 
                          onClick={() => onSelectOrderAndNavigate?.(order.id)}
                          className="p-4 bg-white border border-slate-200/80 rounded-xl shadow-xs space-y-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-indigo-300 hover:shadow-md cursor-pointer transition select-none"
                        >
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2 text-xs">
                              <span className="font-mono text-xs font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
                                {order.orderNumber}
                              </span>
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${statusBadge}`}>
                                {order.status}
                              </span>
                              <span className="text-slate-400 font-semibold font-mono">
                                Ingreso: {new Date(order.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            
                            <div>
                              <p className="text-slate-700 font-medium font-sans text-xs italic leading-relaxed">
                                &ldquo;{order.description}&rdquo;
                              </p>
                              {order.notes && (
                                <p className="text-[10px] text-slate-400 mt-1 leading-normal italic bg-slate-50 p-2 rounded-lg">
                                  <strong>Observación técnica:</strong> {order.notes}
                                </p>
                              )}
                            </div>

                            {/* Inner labor & parts summaries */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-[11px] font-sans">
                              {order.tasks.length > 0 && (
                                <div className="p-2 bg-slate-50/70 rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Mano de Obra & Labores:</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-medium">
                                    {order.tasks.map((t, idx) => (
                                      <li key={idx}>{t.name} ({Math.round(t.hours * t.costPerHour).toLocaleString('es-PY')} Gs.)</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              
                              {order.partsUsed.length > 0 && (
                                <div className="p-2 bg-slate-50/70 rounded-lg">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase font-mono block mb-1">Repuestos colocados:</span>
                                  <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-medium">
                                    {order.partsUsed.map((p, idx) => (
                                      <li key={idx}>{p.name} (x{p.quantity}) - {Math.round(p.price).toLocaleString('es-PY')} Gs. c/u</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* financial breakdown */}
                          <div className="text-right sm:border-l border-slate-100 sm:pl-5 sm:pt-0 pt-2 w-full sm:w-auto shrink-0 space-y-1">
                            <div className="text-[10px] text-slate-400 space-y-0.5 font-medium leading-normal">
                              <p>Costo Mano de Obra: <span className="font-mono text-slate-800 font-bold">{Math.round(laborCostTotal).toLocaleString('es-PY')} Gs.</span></p>
                              <p>Costo Repuestos: <span className="font-mono text-slate-800 font-bold">{Math.round(partsCostTotal).toLocaleString('es-PY')} Gs.</span></p>
                            </div>
                            <div className="pt-1.5 border-t border-dashed border-slate-100">
                              <span className="text-[10px] text-indigo-650 font-bold font-sans uppercase block">Facturación Final</span>
                              <strong className="text-slate-900 font-mono text-base font-extrabold">{Math.round(order.totalCost).toLocaleString('es-PY')} Gs.</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-slate-400 text-xs italic text-center py-8 bg-white border border-dashed border-slate-200 rounded-xl">
                    Este automóvil no registra ninguna orden de trabajo en el historial todavía.
                  </p>
                )}
              </div>
            );
          })()}

        </div>
      )}

    </div>
  );
}
