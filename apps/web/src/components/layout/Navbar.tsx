import React, { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import { useChats } from "@mercadovivo/hooks";
import { logout } from "@mercadovivo/firebase";
import { APP_NAME } from "@mercadovivo/config";

export default function Navbar() {
  const { firebaseUser, usuario } = useAuth();
  const { unreadCount } = useChats(usuario?.id);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const isComercio = usuario?.rol === "comercio" || usuario?.rol === "admin";

  const handleLogout = async () => { await logout(); navigate("/"); };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/vendo?q=${encodeURIComponent(search.trim())}`);
  };

  const navItem = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`;

  const bottomItem = ({ isActive }: { isActive: boolean }) =>
    `flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400"}`;

  return (
    <>
      {/* Top bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex items-center gap-4 h-14">
            {/* Logo */}
            <Link to={firebaseUser ? "/home" : "/"} className="flex items-center gap-2 flex-shrink-0">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-xs font-black">M</span>
              </div>
              <span className="font-bold text-gray-900 text-base hidden sm:block">{APP_NAME}</span>
            </Link>

            {/* Búsqueda — desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
              <div className="relative w-full">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 focus:bg-white transition-colors"
                />
              </div>
            </form>

            {/* Nav links — desktop */}
            {firebaseUser && (
              <div className="hidden md:flex items-center gap-1 ml-auto">
                <NavLink to="/vendo" className={navItem}>Vendo</NavLink>
                <NavLink to="/busco" className={navItem}>Busco</NavLink>
                {isComercio && <NavLink to="/admin/pedidos" className={navItem}>Pedidos</NavLink>}
                {isComercio && <NavLink to="/admin/tienda" className={navItem}>Mi tienda</NavLink>}
                {!isComercio && <NavLink to="/mis-pedidos" className={navItem}>Mis pedidos</NavLink>}
                <NavLink to="/chats" className={({ isActive }) => `relative px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "text-gray-900 bg-gray-100" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}`}>
                  Chats
                  {unreadCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                </NavLink>
              </div>
            )}

            {/* Acciones derecha */}
            <div className={`flex items-center gap-2 ${firebaseUser ? "" : "ml-auto"}`}>
              {firebaseUser ? (
                <>
                  <NavLink to="/perfil" className="hidden md:flex items-center gap-2 pl-3 pr-4 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="w-6 h-6 bg-gray-900 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {usuario?.nombre?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <span className="text-sm font-medium text-gray-700 hidden lg:block">{usuario?.nombre?.split(" ")[0]}</span>
                  </NavLink>
                  <button onClick={handleLogout} className="hidden md:block text-xs text-gray-400 hover:text-red-500 transition-colors px-2">Salir</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 hidden md:block">Ingresar</Link>
                  <Link to="/register" className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors">
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom nav — mobile */}
      {firebaseUser && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 flex items-center justify-around safe-area-pb">
          <NavLink to="/home" className={bottomItem}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            Inicio
          </NavLink>
          <NavLink to="/vendo" className={bottomItem}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
            </svg>
            Productos
          </NavLink>
          <NavLink to="/publicar" className="flex flex-col items-center -mt-4">
            <div className="w-12 h-12 bg-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </div>
            <span className="text-xs text-gray-400 mt-1 font-medium">Publicar</span>
          </NavLink>
          <NavLink to="/chats" className={({ isActive }) => `relative flex flex-col items-center gap-0.5 px-3 py-2 text-xs font-medium transition-colors ${isActive ? "text-gray-900" : "text-gray-400"}`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
            </svg>
            {unreadCount > 0 && <span className="absolute top-1.5 right-2 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            Chats
          </NavLink>
          <NavLink to="/perfil" className={bottomItem}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            Perfil
          </NavLink>
        </nav>
      )}
    </>
  );
}
