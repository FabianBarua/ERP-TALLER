import { useState } from "react";
import { Presupuesto } from "../../../types";
import { Plus, Trash2, FileText, Printer, ArrowLeft } from "lucide-react";

interface PresupuestosViewProps {
  presupuestos: Presupuesto[];
  onAddPresupuesto: (p: Omit<Presupuesto, "id" | "quoteNumber" | "issueDate">) => void;
  onDeletePresupuesto: (id: string) => void;
}

export default function PresupuestosView({
  presupuestos,
  onAddPresupuesto,
  onDeletePresupuesto,
}: PresupuestosViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [viewingQuoteId, setViewingQuoteId] = useState<string | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [vehicleInfo, setVehicleInfo] = useState("");
  const [items, setItems] = useState<Array<{ id: string; description: string; quantity: number; unitPrice: number }>>([]);

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0 },
    ]);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const handleUpdateItem = (id: string, field: string, value: any) => {
    setItems(
      items.map((i) => (i.id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSave = () => {
    if (!clientName.trim()) {
      alert("Ingrese un nombre de cliente al menos.");
      return;
    }
    const total = items.reduce((acc, i) => acc + i.quantity * i.unitPrice, 0);
    onAddPresupuesto({
      clientName,
      vehicleInfo,
      items,
      total,
    });
    setIsCreating(false);
    setClientName("");
    setVehicleInfo("");
    setItems([]);
  };

  const viewingQuote = presupuestos.find((p) => p.id === viewingQuoteId);

  if (viewingQuote) {
    return (
      <div className="space-y-6 animate-fade-in" id="print_section">
        <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-4">
          <button
            onClick={() => setViewingQuoteId(null)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 hover:bg-slate-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Volver
          </button>
          <button
            onClick={() => {
              const printContents = document.getElementById("print_quote")?.innerHTML;
              const originalContents = document.body.innerHTML;
              if (printContents) {
                document.body.innerHTML = printContents;
                window.print();
                document.body.innerHTML = originalContents;
                location.reload();
              }
            }}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>

        <div className="max-w-3xl mx-auto bg-white rounded-md shadow-xl border border-slate-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
          <div id="print_quote" className="text-sm space-y-6 text-slate-800">
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="space-y-1">
                <h4 className="text-xl font-extrabold text-indigo-700">PRESUPUESTO</h4>
                <p className="text-slate-500 font-mono text-xs">Nro: {viewingQuote.quoteNumber}</p>
              </div>
              <div className="text-right">
                <h4 className="font-bold text-slate-800">Auto Tech</h4>
                <p className="font-mono text-[10px] text-slate-500">
                  Fecha: {new Date(viewingQuote.issueDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Cliente sugerido</span>
                <p className="font-bold text-slate-800">{viewingQuote.clientName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl space-y-1 text-xs">
                <span className="text-[10px] text-slate-400 font-mono uppercase">Vehículo info</span>
                <p className="font-bold text-slate-800">{viewingQuote.vehicleInfo || "N/A"}</p>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-bold text-xs uppercase tracking-wider border-b border-slate-200 pb-1">Detalle de Costos</h5>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-mono">
                    <tr>
                      <th className="py-2 px-3">Descripción</th>
                      <th className="py-2 px-3 text-center">Cant.</th>
                      <th className="py-2 px-3 text-right">Precio Unitario</th>
                      <th className="py-2 px-3 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingQuote.items.length > 0 ? viewingQuote.items.map((i, idx) => (
                      <tr key={idx}>
                        <td className="py-2 px-3">{i.description}</td>
                        <td className="py-2 px-3 text-center">{i.quantity}</td>
                        <td className="py-2 px-3 text-right font-mono">{i.unitPrice.toLocaleString("es-PY")} Gs.</td>
                        <td className="py-2 px-3 text-right font-mono">{(i.quantity * i.unitPrice).toLocaleString("es-PY")} Gs.</td>
                      </tr>
                    )) : <tr><td colSpan={4} className="py-4 text-center text-slate-400">Sin items</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <div className="text-right">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Presupuestado</p>
                <p className="text-2xl font-black text-indigo-700 font-mono">
                  {Math.round(viewingQuote.total).toLocaleString("es-PY")} Gs.
                </p>
              </div>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-200 text-center">
               <p className="text-[10px] text-slate-400 italic">Este documento es solo un presupuesto de referencia y no posee validez legal ni fiscal como factura.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isCreating) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-slate-800">Nuevo Presupuesto Rápido</h2>
            <p className="text-xs text-slate-400">Borrador para clientes sin compromiso</p>
          </div>
          <button
            onClick={() => setIsCreating(false)}
            className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            Cancelar
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nombre Cliente / Referencia</label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm"
              placeholder="Ej. Juan Pérez"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Vehículo (Opcional)</label>
            <input
              type="text"
              value={vehicleInfo}
              onChange={(e) => setVehicleInfo(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm"
              placeholder="Ej. Toyota Corolla 2015"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Items del Presupuesto</label>
          <div className="space-y-2">
            {items.map((item) => (
              <div key={item.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-100">
                <input
                  type="text"
                  placeholder="Descripción"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, "description", e.target.value)}
                  className="flex-1 bg-white border border-slate-200 px-2 py-1.5 rounded text-xs"
                />
                <input
                  type="number"
                  placeholder="Cant"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, "quantity", Number(e.target.value))}
                  className="w-20 bg-white border border-slate-200 px-2 py-1.5 rounded text-xs text-center"
                />
                <input
                  type="number"
                  placeholder="Precio Unit."
                  value={item.unitPrice}
                  onChange={(e) => handleUpdateItem(item.id, "unitPrice", Number(e.target.value))}
                  className="w-32 bg-white border border-slate-200 px-2 py-1.5 rounded text-xs text-right font-mono"
                />
                <button
                  onClick={() => handleRemoveItem(item.id)}
                  className="p-1.5 hover:bg-red-100 text-red-500 rounded transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            onClick={handleAddItem}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 py-2 flex items-center gap-1 cursor-pointer transition"
          >
            <Plus className="w-4 h-4" /> Agregar Ítem
          </button>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
          >
            Guardar Presupuesto
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 flex items-center gap-2">
            Presupuestos
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Maneja borradores de forma rápida y sencilla para enviar a clientes.
          </p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" /> Generar Presupuesto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {presupuestos.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No hay presupuestos generados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-slate-50 text-slate-600 text-xs font-sans border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3 px-4 uppercase tracking-wider">Fecha</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Nro</th>
                  <th className="py-3 px-4 uppercase tracking-wider">Cliente/Vehículo</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Total</th>
                  <th className="py-3 px-4 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {presupuestos.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 text-xs text-slate-500">
                      {new Date(p.issueDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border border-slate-200">
                        {p.quoteNumber}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="text-xs font-bold text-slate-800">{p.clientName}</p>
                      {p.vehicleInfo && <p className="text-[10px] text-slate-400">{p.vehicleInfo}</p>}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-mono text-xs font-bold text-indigo-700">
                        {p.total.toLocaleString("es-PY")} Gs.
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingQuoteId(p.id)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition cursor-pointer"
                          title="Ver y Imprimir"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("¿Eliminar este presupuesto?")) {
                              onDeletePresupuesto(p.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
