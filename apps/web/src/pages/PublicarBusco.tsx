import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { publicarBusco } from "@mercadovivo/core";
import { RUBROS, type Rubro } from "@mercadovivo/config";
import { Button, Input, Textarea, Select } from "@mercadovivo/ui";

export default function PublicarBusco() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [rubro, setRubro] = useState<Rubro | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario || !rubro) return;
    setLoading(true);
    setError("");
    try {
      await publicarBusco({
        clienteId: usuario.id,
        titulo,
        descripcion,
        rubro: rubro as Rubro,
        estado: "abierto",
      });
      navigate("/busco");
    } catch {
      setError("Hubo un error. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Publicar Busco</h1>
        <p className="text-gray-500 text-sm mt-1">En 3 simples pasos los comercios te contactarán</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-5">
        <Input
          label="¿Qué buscás?"
          placeholder='Ej: "5 kg de asado vacío"'
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          required
        />

        <Textarea
          label="Describí con más detalle (opcional)"
          placeholder="Marca preferida, cantidad, características..."
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

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" loading={loading} size="lg" className="w-full mt-2">
          Publicar Busco
        </Button>
      </form>
    </div>
  );
}
