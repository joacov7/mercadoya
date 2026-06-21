import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { logout } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";

export default function Navbar() {
  const { firebaseUser, usuario } = useAuth();
  const { unreadCount } = useChats(usuario?.id);
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
          <Link to={firebaseUser ? "/home" : "/"} className="flex items-center gap-2">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-green-700 text-lg">{APP_NAME}</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/vendo" className={linkClass}>Vendo</NavLink>
            <NavLink to="/busco" className={linkClass}>Busco</NavLink>
            {firebaseUser && (
              <>
                <NavLink to="/mis-publicaciones" className={linkClass}>Mis publicaciones</NavLink>
                {(usuario?.rol === "comercio" || usuario?.rol === "admin") && (
                  <NavLink to="/admin/tienda" className={linkClass}>Mi tienda</NavLink>
                )}
                <NavLink to="/chats" className={({ isActive }) =>
                  `relative px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`
                }>
                  Chats
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </NavLink>
              </>
            )}
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
