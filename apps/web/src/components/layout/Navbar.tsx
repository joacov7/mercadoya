import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { logout } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";

export default function Navbar() {
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
    }`;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-green-700 text-lg">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/vendo" className={linkClass}>#Vendo</NavLink>
            <NavLink to="/busco" className={linkClass}>#Busco</NavLink>
            {firebaseUser && <NavLink to="/publicar" className={linkClass}>Publicar</NavLink>}
          </div>

          <div className="flex items-center gap-3">
            {firebaseUser ? (
              <>
                <NavLink to="/perfil" className={linkClass}>Mi perfil</NavLink>
                <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 transition-colors">
                  Salir
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Ingresar
                </Link>
                <Link
                  to="/register"
                  className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Registrarse
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
