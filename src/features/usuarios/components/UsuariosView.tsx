import React, { useState, useEffect } from "react";
import { UserPlus, Shield, Mail, User, Plus, Check, Loader2, AlertCircle } from "lucide-react";

interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
  createdAt?: string;
}

interface UsuariosViewProps {
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

export default function UsuariosView({ authFetch }: UsuariosViewProps) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState("operador");
  const [showForm, setShowForm] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await authFetch("/api/usuarios");
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Error al obtener la lista de usuarios.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    if (!nombre || !email || !password) {
      setError("Todos los campos obligatorios deben completarse.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await authFetch("/api/usuarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, email, password, rol }),
      });

      if (res.ok) {
        const nuevoUsuario = await res.json();
        setUsuarios([nuevoUsuario, ...usuarios]);
        setSuccess(`Usuario "${nombre}" creado exitosamente.`);
        // Reset form
        setNombre("");
        setEmail("");
        setPassword("");
        setRol("operador");
        setShowForm(false);
      } else {
        const errData = await res.json().catch(() => ({}));
        setError(errData.message || "Error al crear el usuario.");
      }
    } catch (err) {
      console.error(err);
      setError("Error de red al intentar crear el usuario.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="usuarios_view_container">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800 tracking-tight font-sans">
            Gestión de Usuarios del Sistema
          </h1>
          <p className="text-xs text-slate-500 font-sans mt-1">
            Administra los operadores y administradores que tienen acceso a este ERP de Taller.
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setError(null);
            setSuccess(null);
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          {showForm ? "Ocultar Formulario" : "Nuevo Usuario"}
        </button>
      </div>

      {/* Alertas */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-rose-800">Ha ocurrido un error</p>
            <p className="text-xs text-rose-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-start gap-3 animate-fade-in">
          <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-emerald-800">Operación exitosa</p>
            <p className="text-xs text-emerald-600 mt-1">{success}</p>
          </div>
        </div>
      )}

      {/* Formulario de creación */}
      {showForm && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 max-w-xl">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
            Registrar Nuevo Usuario
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Nombre Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Eej. Juan Pérez"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Email / Usuario *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@taller.com"
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contraseña *
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  Rol del Sistema
                </label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                >
                  <option value="operador">Operador (Acceso Estándar)</option>
                  <option value="admin">Administrador (Acceso Completo)</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Crear Usuario
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Listado de usuarios */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Usuarios Registrados ({usuarios.length})
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-xs font-medium">Cargando usuarios desde la base de datos...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <p className="text-xs font-medium">No se encontraron usuarios en el sistema.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Email / Usuario
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Fecha Registro
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {usuarios.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-extrabold text-slate-600">
                          {user.nombre.substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-bold text-slate-700">
                          {user.nombre}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          user.rol === "admin"
                            ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                            : "bg-slate-50 text-slate-600 border border-slate-150"
                        }`}
                      >
                        <Shield className="w-3 h-3 shrink-0" />
                        {user.rol}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            user.activo ? "bg-emerald-500 animate-pulse" : "bg-slate-300"
                          }`}
                        />
                        <span className="text-[11px] font-medium text-slate-500">
                          {user.activo ? "Activo" : "Inactivo"}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("es-ES", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })
                        : "N/A"}
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
