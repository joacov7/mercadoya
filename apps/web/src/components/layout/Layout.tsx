import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import CarritoFlotante from "../CarritoFlotante";

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl pb-28 md:pb-10">
        <Outlet />
      </main>
      <CarritoFlotante />
    </div>
  );
}
