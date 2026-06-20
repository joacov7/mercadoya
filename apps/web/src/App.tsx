import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@mercadovivo/hooks";
import Layout from "./components/layout/Layout";
import LandingPage from "./pages/LandingPage";
import HomePage from "./pages/HomePage";
import FeedVendo from "./pages/FeedVendo";
import FeedBusco from "./pages/FeedBusco";
import DetalleVendo from "./pages/DetalleVendo";
import DetalleBusco from "./pages/DetalleBusco";
import PublicarElegir from "./pages/PublicarElegir";
import PublicarBusco from "./pages/PublicarBusco";
import PublicarVendo from "./pages/PublicarVendo";
import MisPublicaciones from "./pages/MisPublicaciones";
import ChatPage from "./pages/ChatPage";
import ChatsPage from "./pages/ChatsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PerfilPage from "./pages/PerfilPage";
import PerfilComercio from "./pages/PerfilComercio";
import { Spinner } from "@mercadovivo/ui";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  return firebaseUser ? <>{children}</> : <Navigate to="/login" replace />;
}

function RootRoute() {
  const { firebaseUser, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>;
  return firebaseUser ? <Navigate to="/home" replace /> : <LandingPage />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route element={<Layout />}>
        <Route path="/home" element={<PrivateRoute><HomePage /></PrivateRoute>} />
        <Route path="/vendo" element={<FeedVendo />} />
        <Route path="/vendo/:id" element={<DetalleVendo />} />
        <Route path="/busco" element={<FeedBusco />} />
        <Route path="/busco/:id" element={<DetalleBusco />} />
        <Route path="/comercio/:id" element={<PerfilComercio />} />
        <Route path="/publicar" element={<PrivateRoute><PublicarElegir /></PrivateRoute>} />
        <Route path="/publicar/vendo" element={<PrivateRoute><PublicarVendo /></PrivateRoute>} />
        <Route path="/publicar/busco" element={<PrivateRoute><PublicarBusco /></PrivateRoute>} />
        <Route path="/mis-publicaciones" element={<PrivateRoute><MisPublicaciones /></PrivateRoute>} />
        <Route path="/chats" element={<PrivateRoute><ChatsPage /></PrivateRoute>} />
        <Route path="/chat/:chatId" element={<PrivateRoute><ChatPage /></PrivateRoute>} />
        <Route path="/perfil" element={<PrivateRoute><PerfilPage /></PrivateRoute>} />
      </Route>
    </Routes>
  );
}
