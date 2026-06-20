import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { listarChatsUsuario, obtenerCalificaciones, actualizarUsuario } from "@mercadovivo/core";
import { logout, uploadImage } from "@mercadovivo/firebase";
import type { Calificacion } from "@mercadovivo/types";
import { Spinner, Button } from "@mercadovivo/ui";

export default function PerfilPage() {
  const { usuario, loading } = useAuth();
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [editando, setEditando] = useState(false);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [telefono, setTelefono] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!usuario) return;
    obtenerCalificaciones(usuario.id).then(setCalificaciones);
    setNombre(usuario.nombre);
    setDescripcion(usuario.descripcion ?? "");
    setTelefono(usuario.telefono);
  }, [usuario]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleGuardar = async () => {
    if (!usuario) return;
    setGuardando(true);
    try {
      await actualizarUsuario(usuario.id, { nombre, descripcion, telefono });
      setEditando(false);
    } finally {
      setGuardando(false);
    }
  };

  const handleFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !usuario) return;
    setSubiendoFoto(true);
    try {
      const url = await uploadImage(`avatars/${usuario.id}`, file);
      await actualizarUsuario(usuario.id, { avatarUrl: url });
    } finally {
      setSubiendoFoto(false);
    }
  };

  if (loading) return <div className="py-20"><Spinner /></div>;
  if (!usuario) return null;

  const positivos = calificaciones.filter((c) => c.pulgar === "positivo").length;
  const negativos = calificaciones.filter((c) => c.pulgar === "negativo").length;
  const resenas = calificaciones.filter((c) => c.resena).slice(0, 5);

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      {/* Perfil */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-green-500 to-green-700" />
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-10 mb-4">
            {/* Avatar con upload */}
            <label className="cursor-pointer relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl bg-white border-4 border-white shadow-md overflow-hidden flex items-center justify-center text-3xl font-bold text-green-700">
                {subiendoFoto ? (
                  <Spinner size="sm" />
                ) : usuario.avatarUrl ? (
                  <img src={usuario.avatarUrl} alt={usuario.nombre} className="w-full h-full object-cover" />
                ) : (
                  usuario.nombre.charAt(0).toUpperCase()
                )}
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-white text-xs font-medium">📷</span>
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFoto} />
            </label>
            <div className="flex-1 pb-1">
              <h2 className="text-xl font-bold text-gray-900">{usuario.nombre}</h2>
              <p className="text-gray-500 text-sm">{usuario.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium capitalize">
                {usuario.rol}
              </span>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>Salir</Button>
          </div>

          {/* Descripción */}
          {!editando ? (
            <div>
              <p className="text-gray-600 text-sm">
                {usuario.descripcion || <span className="text-gray-400 italic">Sin descripción todavía</span>}
              </p>
              <button onClick={() => setEditando(true)} className="text-xs text-green-600 font-medium mt-2 hover:text-green-700">
                ✏️ Editar perfil
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Teléfono"
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <textarea
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Contá un poco sobre vos o tu comercio..."
                rows={3}
                className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" loading={guardando} onClick={handleGuardar}>Guardar</Button>
                <Button size="sm" variant="outline" onClick={() => setEditando(false)}>Cancelar</Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reputación */}
      {calificaciones.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Reputación</h3>
          <div className="flex gap-6 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👍</span>
              <div>
                <p className="text-2xl font-bold text-green-700">{positivos}</p>
                <p className="text-xs text-gray-400">Positivos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👎</span>
              <div>
                <p className="text-2xl font-bold text-red-500">{negativos}</p>
                <p className="text-xs text-gray-400">Negativos</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⭐</span>
              <div>
                <p className="text-2xl font-bold text-gray-900">{calificaciones.length}</p>
                <p className="text-xs text-gray-400">Total</p>
              </div>
            </div>
          </div>
          {resenas.length > 0 && (
            <div className="flex flex-col gap-3">
              {resenas.map((c) => (
                <div key={c.id} className="flex gap-3 bg-gray-50 rounded-2xl p-3">
                  <span className="text-xl">{c.pulgar === "positivo" ? "👍" : "👎"}</span>
                  <p className="text-sm text-gray-700 italic">"{c.resena}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links rápidos */}
      <div className="grid grid-cols-2 gap-3">
        <Link to="/mis-publicaciones" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">🏪</span>
          <span className="text-sm font-medium text-gray-700">Mis publicaciones</span>
        </Link>
        <Link to="/chats" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow flex items-center gap-3">
          <span className="text-2xl">💬</span>
          <span className="text-sm font-medium text-gray-700">Mis chats</span>
        </Link>
      </div>
    </div>
  );
}
