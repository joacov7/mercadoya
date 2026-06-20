import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { publicarVendo } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";
import { Button, Input, Textarea, Select } from "@mercadovivo/ui";
import { ImageUploader } from "../components/ui/ImageUploader";

export default function PublicarVendo() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [precio, setPrecio] = useState("");
  const [stock, setStock] = useState("");
  const [envioDisponible, setEnvioDisponible] = useState(false);
  const [imagenUrl, setImagenUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !rubro) return;
    setLoading(true);
    setError("");
    try {
      await publicarVendo({
        comercioId: usuario.id,
        titulo,
        descripcion,
        rubro: rubro as Rubro,
        precio: Number(precio),
        stock: Number(stock),
        imagenes: imagenUrl ? [imagenUrl] : [],
        stockDisponible: Number(stock) > 0,
        envioDisponible,
        activo: true,
      });
      navigate("/mis-publicaciones");
    } catch {
      setError("Hubo un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar Vendo</h1>
        <p className="text-gray-500 text-sm mt-1">Publicá tu producto o servicio</p>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Foto del producto</label>
          <ImageUploader
            value={imagenUrl}
            onUpload={setImagenUrl}
            onRemove={() => setImagenUrl("")}
            folder="publicaciones"
          />
        </div>
        <Input
          label="Título del producto"
          placeholder='Ej: "Asado vacío 1kg"'
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />
        <Textarea
          label="Descripción"
          placeholder="Detallá tu producto..."
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
        <Select
          label="Rubro"
          value={rubro}
          onChange={(e) => setRubro(e.target.value as Rubro)}
          options={RUBROS.map((r) => ({ value: r, label: r }))}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Precio ($)"
            type="number"
            placeholder="0"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
            min="0"
          />
          <Input
            label="Stock disponible"
            type="number"
            placeholder="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            min="0"
          />
        </div>
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <div
            onClick={() => setEnvioDisponible(!envioDisponible)}
            className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${
              envioDisponible ? "bg-green-500" : "bg-gray-300"
            }`}
          >
            <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
              envioDisponible ? "translate-x-6" : "translate-x-1"
            }`} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Ofrezco envío con cadete</p>
            <p className="text-xs text-gray-400">Los compradores podrán solicitar envío a domicilio</p>
          </div>
        </label>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <Button type="submit" loading={loading} size="lg" className="w-full">
          Publicar producto
        </Button>
      </form>
    </div>
  );
}
