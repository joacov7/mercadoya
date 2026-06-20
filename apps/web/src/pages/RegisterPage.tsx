import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerEmail } from "@mercadovivo/firebase";
import { crearUsuario } from "@mercadovivo/core";
import { APP_NAME } from "@mercadovivo/config";
import { Button, Input } from "@mercadovivo/ui";

export default function RegisterPage() {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { user } = await registerEmail(email, password);
      await crearUsuario(user.uid, {
        nombre,
        email,
        telefono,
        whatsapp: telefono,
        rol: "cliente",
      });
      navigate("/home");
    } catch {
      setError("No se pudo crear la cuenta. El email ya puede estar en uso.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🛒</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{APP_NAME}</h1>
          <p className="text-gray-500 text-sm mt-1">Creá tu cuenta gratis</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <Input label="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} required placeholder="Juan García" />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          <Input label="Teléfono / WhatsApp" value={telefono} onChange={(e) => setTelefono(e.target.value)} required placeholder="3446123456" />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Mínimo 6 caracteres" minLength={6} />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" loading={loading} size="lg" className="w-full">Crear cuenta</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿Ya tenés cuenta? <Link to="/login" className="text-green-600 font-medium">Ingresá</Link>
        </p>
      </div>
    </div>
  );
}
