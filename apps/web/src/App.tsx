import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import FeedVendo from "./pages/FeedVendo";
import FeedBusco from "./pages/FeedBusco";
import PublicarBusco from "./pages/PublicarBusco";
import PublicarVendo from "./pages/PublicarVendo";
import DetalleBusco from "./pages/DetalleBusco";
import ChatPage from "./pages/ChatPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PerfilPage from "./pages/PerfilPage";
import { Spinner } from "@mercadovivo/ui";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  return firebaseUser ? <>{children}</> : <Navigate to="/login" replace />;
}

function PublicarRoute() {
  const { usuario, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  if (!usuario) return <Navigate to="/login" replace />;
  return usuario.rol === "comercio" ? <PublicarVendo /> : <PublicarBusco />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/vendo" element={<FeedVendo />} />
        <Route path="/busco" element={<FeedBusco />} />
        <Route path="/busco/:id" element={<DetalleBusco />} />
        <Route path="/publicar" element={<PrivateRoute><PublicarRoute /></PrivateRoute>} />
        <Route path="/chat/:chatId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><PerfilPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
