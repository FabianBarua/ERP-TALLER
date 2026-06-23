import React from "react";
import { useState, FormEvent } from "react";
import {
  Package,
  Plus,
  Search,
  TrendingDown,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  AlertTriangle,
  Tag,
  Boxes,
  CircleDollarSign,
  Layers,
  Settings,
  Trash2,
  Edit3,
  Download,
  Upload,
  ScanBarcode,
  X,
  ChevronDown
} from "lucide-react";
import { Repuesto } from "../../../types";

interface InventarioViewProps {
  repuestos: Repuesto[];
  onAddRepuesto: (repuesto: Omit<Repuesto, "id">) => void;
  onUpdateStock: (partId: string, delta: number) => void;
  onUpdateMinStock?: (partId: string, minStock: number) => void;
  onEditRepuesto?: (repuesto: Repuesto) => void;
  onDeleteRepuesto?: (partId: string) => void;
}

export default function InventarioView({
  repuestos,
  onAddRepuesto,
  onUpdateStock,
  onUpdateMinStock,
  onEditRepuesto,
  onDeleteRepuesto,
}: InventarioViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [isAddingPart, setIsAddingPart] = useState(false);
  const [editingPartId, setEditingPartId] = useState<string | null>(null);

  // New/Edit Part state
  const [newPart, setNewPart] = useState({
    code: "",
    name: "",
    category: "Filtros",
    stock: 10,
    minStock: 5,
    cost: 15000,
    price: 35000,
    brandCompat: "",
    carModels: "",
    yearCompat: "",
    location: "",
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannedCode, setScannedCode] = useState("");
  const [scannedPart, setScannedPart] = useState<Repuesto | null>(null);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  // Unique list of categories in catalog for select filters
  const categories = [
    "todos",
    ...Array.from(new Set(repuestos.map((r) => r.category))),
  ];

  // Filters application
  const filteredParts = repuestos.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brandCompat.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "todos" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreatePart = (e: FormEvent) => {
    e.preventDefault();
    if (!newPart.code || !newPart.name) return;

    if (editingPartId) {
      if (onEditRepuesto) {
        onEditRepuesto({
          id: editingPartId,
          ...newPart,
          code: newPart.code.toUpperCase(),
          stock: Number(newPart.stock),
          minStock: Number(newPart.minStock),
          cost: Number(newPart.cost),
          price: Number(newPart.price),
        });
      }
    } else {
      onAddRepuesto({
        ...newPart,
        code: newPart.code.toUpperCase(),
        stock: Number(newPart.stock),
        minStock: Number(newPart.minStock),
        cost: Number(newPart.cost),
        price: Number(newPart.price),
      });
    }

    setNewPart({
      code: "",
      name: "",
      category: "Filtros",
      stock: 10,
      minStock: 5,
      cost: 15000,
      price: 35000,
      brandCompat: "",
      carModels: "",
      yearCompat: "",
      location: "",
    });
    setEditingPartId(null);
    setIsAddingPart(false);
  };

  const handleStartEdit = (part: Repuesto) => {
    setEditingPartId(part.id);
    setNewPart({
      code: part.code,
      name: part.name,
      category: part.category,
      stock: part.stock,
      minStock: part.minStock,
      cost: part.cost,
      price: part.price,
      brandCompat: part.brandCompat || "",
      carModels: part.carModels || "",
      yearCompat: part.yearCompat || "",
      location: part.location || "",
    });
    setIsAddingPart(true);
    // document.getElementById('inventory_panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleExportXls = () => {
    const headers = [
      "ID",
      "Codigo",
      "Nombre",
      "Categoria",
      "Stock",
      "StockMinimo",
      "Costo",
      "Precio",
      "Compatibilidad",
      "Modelos_Auto",
      "Año_Auto",
      "Ubicacion_Estante",
    ];
    const csvContent = [
      headers.join(","),
      ...repuestos.map((r) =>
        [
          r.id,
          r.code,
          `"${r.name.replace(/"/g, '""')}"`,
          `"${r.category.replace(/"/g, '""')}"`,
          r.stock,
          r.minStock,
          r.cost,
          r.price,
          `"${(r.brandCompat || "").replace(/"/g, '""')}"`,
          `"${(r.carModels || "").replace(/"/g, '""')}"`,
          `"${(r.yearCompat || "").replace(/"/g, '""')}"`,
          `"${(r.location || "").replace(/"/g, '""')}"`,
        ].join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `inventario_autotech_${new Date().toISOString().slice(0, 10)}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportXls = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (!text) return;

      const lines = text.split("\n");
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV parser that handles quotes
        const values: string[] = [];
        let inQuotes = false;
        let currentValue = "";

        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === "," && !inQuotes) {
            values.push(currentValue);
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue);

        if (values.length >= 8) {
          onAddRepuesto({
            code: values[1],
            name: values[2].replace(/^"|"$/g, "").replace(/""/g, '"'),
            category: values[3].replace(/^"|"$/g, "").replace(/""/g, '"'),
            stock: parseInt(values[4], 10) || 0,
            minStock: parseInt(values[5], 10) || 0,
            cost: parseFloat(values[6]) || 0,
            price: parseFloat(values[7]) || 0,
            brandCompat: values[8]
              ? values[8].replace(/^"|"$/g, "").replace(/""/g, '"')
              : "",
            carModels: values[9]
              ? values[9].replace(/^"|"$/g, "").replace(/""/g, '"')
              : "",
            yearCompat: values[10]
              ? values[10].replace(/^"|"$/g, "").replace(/""/g, '"')
              : "",
            location: values[11]
              ? values[11].replace(/^"|"$/g, "").replace(/""/g, '"')
              : "",
          });
        }
      }
      e.target.value = ""; // Reset input
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6" id="inventory_panel">
      {/* Header and statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-slate-400 uppercase">
              Artículos Totales
            </span>
            <p className="text-2xl font-extrabold text-slate-800">
              {repuestos.length}
            </p>
          </div>
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-slate-400">
              Total Unidades en Stock
            </span>
            <p className="text-2xl font-extrabold text-slate-800">
              {repuestos.reduce((sum, r) => sum + r.stock, 0)}
            </p>
          </div>
          <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-slate-400">
              Alertas de Stock Especiales
            </span>
            <p className="text-2xl font-extrabold text-rose-600">
              {repuestos.filter((r) => r.stock <= r.minStock).length}
            </p>
          </div>
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-mono font-medium text-slate-400">
              Valorización de Activos (Costo)
            </span>
            <p className="text-xl font-extrabold text-emerald-600">
              {repuestos
                .reduce((sum, r) => sum + r.stock * r.cost, 0)
                .toLocaleString("es-PY")}{" "}
              Gs.
            </p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CircleDollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control panel & Filter bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
        {/* Search, Filter selector */}
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Buscar por código, repuesto, compatibilidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100/80 rounded-xl text-xs outline-hidden focus:bg-white focus:border-indigo-500 text-slate-800 font-semibold"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold text-slate-600 outline-hidden focus:bg-white focus:border-indigo-500 capitalize"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "todos" ? "Categorías (Todas)" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons Menu */}
        <div className="relative z-10 w-full md:w-auto">
          <button
            onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
            className="w-full md:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            Acciones <ChevronDown className="w-4 h-4" />
          </button>

          {isActionMenuOpen && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setIsActionMenuOpen(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 shadow-xl rounded-xl p-2 flex flex-col gap-1 z-20 origin-top-right animate-in fade-in slide-in-from-top-2">
                <button
                  id="btn_trigger_add_part"
                  onClick={() => {
                    setIsAddingPart((prev) => !prev);
                    setIsActionMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left bg-transparent hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-indigo-600" /> Nuevo SKU
                </button>
                <button
                  onClick={() => {
                    setIsScannerOpen(true);
                    setScannedCode("");
                    setScannedPart(null);
                    setIsActionMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left bg-transparent hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <ScanBarcode className="w-4 h-4 text-indigo-600" /> Escanear Código
                </button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <label className="px-3 py-2 text-left bg-transparent hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-emerald-600" /> Importar XLS
                  <input
                    type="file"
                    accept=".csv"
                    className="hidden"
                    onChange={(e) => {
                      handleImportXls(e);
                      setIsActionMenuOpen(false);
                    }}
                  />
                </label>
                <button
                  onClick={() => {
                    handleExportXls();
                    setIsActionMenuOpen(false);
                  }}
                  className="px-3 py-2 text-left bg-transparent hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4 text-emerald-600" /> Exportar XLS
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Adding form drawer */}
      {isAddingPart && (
        <form
          onSubmit={handleCreatePart}
          className="p-6 bg-indigo-50/40 border border-indigo-100 rounded-2xl grid grid-cols-1 md:grid-cols-4 gap-4"
          id="form_add_repuesto_to_inventory"
        >
          <div className="md:col-span-4 pb-2 border-b border-indigo-100/50">
            <h3 className="font-extrabold text-indigo-900 text-xs uppercase tracking-wide">
              {editingPartId
                ? "Editar repuesto existente"
                : "Catalogar un componente o consumible (Nuevo SKU)"}
            </h3>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Código SKU *
            </label>
            <input
              type="text"
              required
              value={newPart.code}
              onChange={(e) => setNewPart({ ...newPart, code: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-bold uppercase"
              placeholder="Ej. FIL-ACE-202"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Nombre del Repuesto *
            </label>
            <input
              type="text"
              required
              value={newPart.name}
              onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold"
              placeholder="Filtro de cabina de carbón activado"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Categoría
            </label>
            <select
              value={newPart.category}
              onChange={(e) =>
                setNewPart({ ...newPart, category: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold"
            >
              <option value="Filtros">Filtros</option>
              <option value="Frenos">Frenos</option>
              <option value="Motor">Motor</option>
              <option value="Suspension">Suspensión</option>
              <option value="Refrigeración">Refrigeración</option>
              <option value="Lubricantes">Lubricantes</option>
              <option value="Eléctrico">Eléctrico</option>
              <option value="Otros">Otros</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Stock Inicial
            </label>
            <input
              type="number"
              min="0"
              value={newPart.stock}
              onChange={(e) =>
                setNewPart({ ...newPart, stock: parseInt(e.target.value) || 0 })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Mínimo Crítico (Alerta)
            </label>
            <input
              type="number"
              min="1"
              value={newPart.minStock}
              onChange={(e) =>
                setNewPart({
                  ...newPart,
                  minStock: parseInt(e.target.value) || 1,
                })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Costo Mayorista (Gs.)
            </label>
            <input
              type="number"
              min="0"
              value={newPart.cost}
              onChange={(e) =>
                setNewPart({ ...newPart, cost: parseInt(e.target.value) || 0 })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Precio de Venta (Gs.)
            </label>
            <input
              type="number"
              min="0"
              value={newPart.price}
              onChange={(e) =>
                setNewPart({ ...newPart, price: parseInt(e.target.value) || 0 })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg font-mono font-bold text-indigo-700"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Modelos / Marcas Compatibles
            </label>
            <input
              type="text"
              value={newPart.brandCompat}
              onChange={(e) =>
                setNewPart({ ...newPart, brandCompat: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold"
              placeholder="Ej. Chevrolet Spark GT, Hyundai Grand i10, Universal..."
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Autos (Detalle)
            </label>
            <input
              type="text"
              value={newPart.carModels}
              onChange={(e) =>
                setNewPart({ ...newPart, carModels: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold"
              placeholder="Ej. Corolla, Civic"
            />
          </div>

          <div className="space-y-1 md:col-span-1">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Año
            </label>
            <input
              type="text"
              value={newPart.yearCompat}
              onChange={(e) =>
                setNewPart({ ...newPart, yearCompat: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold"
              placeholder="Ej. 2010-2015"
            />
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-[10px] text-slate-500 uppercase font-bold">
              Ubicación en Estante
            </label>
            <input
              type="text"
              value={newPart.location}
              onChange={(e) =>
                setNewPart({ ...newPart, location: e.target.value })
              }
              className="w-full text-xs px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 font-semibold"
              placeholder="Ej. Pasillo 3, Estante B"
            />
          </div>

          <div className="flex gap-2 items-end justify-end md:col-span-2 pt-2">
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition w-full cursor-pointer h-[34px]"
            >
              {editingPartId ? "Actualizar" : "Registrar SKU"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingPart(false);
                setEditingPartId(null);
                setNewPart({
                  code: "",
                  name: "",
                  category: "Filtros",
                  stock: 10,
                  minStock: 5,
                  cost: 15000,
                  price: 35000,
                  brandCompat: "",
                  carModels: "",
                  yearCompat: "",
                  location: "",
                });
              }}
              className="px-3 py-2 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-xs font-bold transition h-[34px] cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Row List styled Table for Spare Parts (en fila, no como cuadros) */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
        {/* Table header for desktop screens, stacked elegantly for smaller screens */}
        <div className="hidden lg:grid grid-cols-12 gap-2 bg-slate-50 border-b border-slate-100 px-6 py-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono">
          <div className="col-span-3">Código, Componente y Compatibilidad</div>
          <div className="col-span-1.5 text-center">Categoría</div>
          <div className="col-span-1.5 text-right">Costo / Margen</div>
          <div className="col-span-1.5 text-right">Precio Público</div>
          <div className="col-span-2 text-center">Mínimo Crítico (Editar)</div>
          <div className="col-span-2 text-right pr-2">Stock Disponible</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredParts.length > 0 ? (
            filteredParts.map((part) => {
              const isLowStock = part.stock <= part.minStock;
              const markup =
                part.cost > 0
                  ? (((part.price - part.cost) / part.cost) * 100).toFixed(0)
                  : "0";

              return (
                <div
                  key={part.id}
                  className={`grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-2 px-6 py-4.5 items-center transition ${
                    isLowStock
                      ? "bg-rose-50/35 border-l-4 border-l-rose-500"
                      : "hover:bg-slate-50/40 border-l-4 border-l-indigo-500"
                  }`}
                >
                  {/* SKU & Name details */}
                  <div className="col-span-3 space-y-1 text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[9px] font-extrabold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded tracking-wide">
                        {part.code}
                      </span>
                      {isLowStock && (
                        <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[8px] font-extrabold rounded uppercase tracking-wide">
                          CRÍTICO
                        </span>
                      )}
                    </div>
                    <h4 className="text-xs font-extrabold text-slate-800 tracking-tight leading-normal">
                      {part.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Tag className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">
                        Compatibilidad:{" "}
                        <strong className="font-semibold text-slate-700">
                          {part.brandCompat || "Universal"}
                        </strong>
                      </span>
                    </p>
                  </div>

                  {/* Category badge */}
                  <div className="col-span-1.5 flex lg:justify-center">
                    <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[9px] font-extrabold tracking-wide uppercase font-sans">
                      {part.category}
                    </span>
                  </div>

                  {/* Markup and Wholesale cost */}
                  <div className="col-span-1.5 text-left lg:text-right font-mono text-[11px] leading-tight">
                    <span className="text-[9px] text-slate-400 block lg:hidden uppercase font-sans font-bold">
                      Costo / Margen
                    </span>
                    <p className="font-bold text-slate-600">
                      {part.cost.toLocaleString("es-PY")} Gs.
                    </p>
                    <p className="text-[10px] text-emerald-600 font-extrabold font-sans">
                      +{markup}% marg.
                    </p>
                  </div>

                  {/* Customer retail price */}
                  <div className="col-span-1.5 text-left lg:text-right font-mono text-xs">
                    <span className="text-[9px] text-slate-400 block lg:hidden uppercase font-sans font-bold">
                      PVP Público
                    </span>
                    <p className="font-extrabold text-indigo-600">
                      {part.price.toLocaleString("es-PY")} Gs.
                    </p>
                  </div>

                  {/* Interactive Quantity Minimum (minStock) selector inside the row */}
                  <div className="col-span-2 flex flex-col items-start lg:items-center gap-1.5">
                    <span className="text-[9px] text-slate-400 block lg:hidden uppercase font-sans font-bold">
                      Mínimo para Alerta
                    </span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        value={part.minStock}
                        onChange={(e) =>
                          onUpdateMinStock?.(
                            part.id,
                            Math.max(1, parseInt(e.target.value) || 1),
                          )
                        }
                        className={`w-14 text-center text-xs px-1.5 py-1 font-mono font-bold border border-slate-200 bg-white rounded-lg focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-3xs ${
                          isLowStock
                            ? "text-rose-600 border-rose-300 bg-rose-50/50"
                            : "text-slate-700"
                        }`}
                        title="Modifica la cantidad mínima que debe haber de este repuesto"
                      />
                      <span className="text-[10px] text-slate-400 font-bold select-none">
                        uds.
                      </span>
                    </div>
                  </div>

                  {/* Stock physical units and plus/minus controls */}
                  <div className="col-span-2 flex justify-between lg:justify-end items-center gap-3">
                    <div className="text-left lg:text-right space-y-0.5">
                      <span className="text-[9px] text-slate-400 block lg:hidden uppercase font-sans font-extrabold">
                        Stock Disponible
                      </span>
                      <p
                        className={`font-mono text-sm font-extrabold leading-none ${isLowStock ? "text-rose-600 font-black" : "text-slate-800"}`}
                      >
                        {part.stock} uds.
                      </p>
                    </div>

                    {/* Quick increment / decrement stock steppers */}
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <div className="flex items-center gap-1 border border-slate-100 bg-slate-50/50 p-1 rounded-xl">
                        <button
                          onClick={() => onUpdateStock(part.id, -1)}
                          disabled={part.stock <= 0}
                          className="p-1 px-1.5 text-slate-450 hover:text-rose-500 bg-white hover:bg-rose-50 rounded-lg border border-slate-200/55 disabled:opacity-35 disabled:hover:bg-transparent cursor-pointer transition active:scale-90"
                          title="Restar 1 unidad"
                        >
                          <MinusCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onUpdateStock(part.id, 1)}
                          className="p-1 px-1.5 text-slate-450 hover:text-indigo-600 bg-white hover:bg-indigo-50 rounded-lg border border-slate-200/55 cursor-pointer transition active:scale-90"
                          title="Sumar 1 unidad (Reposición)"
                        >
                          <PlusCircle className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(part)}
                          className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer transition"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Estás seguro de eliminar este repuesto del inventario?",
                              )
                            ) {
                              onDeleteRepuesto?.(part.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer transition"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-16 text-slate-400 space-y-2">
              <Package className="w-12 h-12 text-slate-200 mx-auto" />
              <p className="text-sm font-bold">
                No se encontraron repuestos catalogados
              </p>
              <p className="text-xs">
                Intente modificar su búsqueda o cambiar los filtros de
                categoría.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
              <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                <ScanBarcode className="w-4 h-4 text-indigo-600" />
                Lector de Código de Barras
              </h3>
              <button
                onClick={() => setIsScannerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!scannedCode.trim()) return;
                  const found = repuestos.find(r => r.code.toUpperCase() === scannedCode.trim().toUpperCase());
                  setScannedPart(found || null);
                  if (!found) {
                    alert("No se encontró ningún repuesto con este código SKU.");
                  }
                  // Auto-clear input to be ready for the next scan immediately
                  setScannedCode("");
                }}
                className="space-y-2"
              >
                <label className="text-xs font-bold text-slate-500 uppercase">
                  Escanee el código o ingréselo manualmente
                </label>
                <input
                  type="text"
                  autoFocus
                  value={scannedCode}
                  onChange={(e) => setScannedCode(e.target.value)}
                  placeholder="Escaneando..."
                  className="w-full text-center px-4 py-3 bg-slate-50 border-2 border-indigo-200 focus:border-indigo-500 focus:ring-0 outline-hidden rounded-xl text-lg font-mono font-bold text-slate-800 transition"
                />
                <button type="submit" className="hidden">Buscar</button>
              </form>

              {scannedPart && (
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl space-y-4">
                  <div className="space-y-1">
                    <span className="inline-block px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold tracking-wide uppercase rounded">
                      {scannedPart.category}
                    </span>
                    <h4 className="text-lg font-extrabold text-slate-800 leading-tight">
                      {scannedPart.name}
                    </h4>
                    <p className="font-mono text-xs text-slate-500 font-bold">{scannedPart.code}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-xs space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Ubicación</span>
                      <p className="font-semibold text-slate-700">{scannedPart.location || "No asignada"}</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-indigo-50 shadow-xs space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Stock</span>
                      <p className={`font-extrabold text-sm ${scannedPart.stock <= scannedPart.minStock ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {scannedPart.stock} uds.
                      </p>
                    </div>
                    <div className="col-span-2 bg-white p-3 rounded-lg border border-indigo-50 shadow-xs space-y-1">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Autos Compatibles</span>
                      <p className="font-semibold text-slate-700">{scannedPart.carModels || scannedPart.brandCompat || "Universal"}</p>
                    </div>
                    <div className="col-span-2 bg-white p-3 rounded-lg border border-indigo-50 shadow-xs flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Años</span>
                        <p className="font-semibold text-slate-700">{scannedPart.yearCompat || "Todos"}</p>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Precio Público</span>
                        <p className="font-extrabold text-indigo-700 text-sm font-mono">{scannedPart.price.toLocaleString("es-PY")} Gs.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            {scannedPart && (
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                <button
                  onClick={() => {
                    handleStartEdit(scannedPart);
                    setIsScannerOpen(false);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Editar
                </button>
                <button
                  onClick={() => {
                    setScannedCode("");
                    setScannedPart(null);
                    // autoFocus is on the input, so it will re-focus naturally when state updates
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition cursor-pointer"
                >
                  Escanear Otro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
