import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginEmail } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";
import { Button, Input } from "@mercadovivo/ui";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginEmail(email, password);
      navigate("/vendo");
    } catch {
      setError("Email o contraseña incorrectos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🛒</span>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">{APP_NAME}</h1>
          <p className="text-gray-500 text-sm mt-1">Ingresá a tu cuenta</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="tu@email.com" />
          <Input label="Contraseña" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <Button type="submit" loading={loading} size="lg" className="w-full">Ingresar</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          ¿No tenés cuenta? <Link to="/register" className="text-green-600 font-medium">Registrate</Link>
        </p>
      </div>
    </div>
  );
}
