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

  const bottomNav = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${isActive ? "text-green-600" : "text-gray-400"}`;

  return (
    <>
      {/* Top bar — desktop y mobile */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to={firebaseUser ? "/home" : "/"} className="flex items-center gap-1.5">
              <span className="text-xl">🛒</span>
              <span className="font-bold text-green-700 text-base">{APP_NAME}</span>
            </Link>

            {/* Ubicación — solo desktop */}
            <div className="hidden md:flex items-center gap-1 text-sm text-gray-500">
              <span>📍</span>
              <span>Gualeguay, Entre Ríos</span>
            </div>

            {/* Links desktop */}
            <div className="hidden md:flex items-center gap-1">
              <NavLink to="/vendo" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>Vendo</NavLink>
              <NavLink to="/busco" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>Busco</NavLink>
              {firebaseUser && (
                <>
                  <NavLink to="/mis-publicaciones" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>Mis publicaciones</NavLink>
                  {(usuario?.rol === "comercio" || usuario?.rol === "admin") && (
                    <NavLink to="/admin/tienda" className={({ isActive }) => `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>Mi tienda</NavLink>
                  )}
                  <NavLink to="/chats" className={({ isActive }) => `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-green-100 text-green-700" : "text-gray-600 hover:bg-gray-100"}`}>
                    Chats
                    {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                  </NavLink>
                </>
              )}
            </div>

            {/* Acciones derecha */}
            <div className="flex items-center gap-2">
              {firebaseUser ? (
                <>
                  <NavLink to="/perfil" className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100">
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">
                      {usuario?.nombre?.[0]?.toUpperCase() ?? "?"}
                    </span>
                    Mi perfil
                  </NavLink>
                  <button onClick={handleLogout} className="hidden md:block text-xs text-gray-400 hover:text-red-500 transition-colors">Salir</button>
                  {/* Mobile: solo avatar */}
                  <NavLink to="/perfil" className="md:hidden w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-bold text-green-700">
                    {usuario?.nombre?.[0]?.toUpperCase() ?? "?"}
                  </NavLink>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden md:block">Ingresar</Link>
                  <Link to="/register" className="bg-green-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom nav — solo mobile y solo si está logueado */}
      {firebaseUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex items-center justify-around">
          <NavLink to="/home" className={bottomNav}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Inicio
          </NavLink>
          <NavLink to="/vendo" className={bottomNav}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            Vendo
          </NavLink>
          <NavLink to="/publicar" className="flex flex-col items-center -mt-5">
            <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </div>
            <span className="text-xs text-gray-400 mt-0.5">Publicar</span>
          </NavLink>
          <NavLink to="/chats" className={({ isActive }) => `relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${isActive ? "text-green-600" : "text-gray-400"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            {unreadCount > 0 && <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            Chats
          </NavLink>
          <NavLink to="/perfil" className={bottomNav}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            Perfil
          </NavLink>
        </nav>
      )}
    </>
  );
}
