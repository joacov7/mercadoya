import React from "react";
import { Link } from "react-router-dom";
import { APP_NAME, APP_CITY } from "@mercadovivo/config";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar simple */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🛒</span>
          <span className="font-bold text-green-700 text-xl">{APP_NAME}</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/vendo" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Vendo</Link>
          <Link to="/busco" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Busco</Link>
          <Link to="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">Ingresar</Link>
          <Link to="/register" className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors">
            Registrarse gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-green-200 font-medium mb-3 uppercase tracking-widest text-sm">Plataforma local · {APP_CITY}</p>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            Conectá con los <br />comercios de <span className="text-amber-300">Gualeguay</span>
          </h1>
          <p className="text-xl text-green-100 mb-10 max-w-xl mx-auto">
            Publicá lo que buscás, descubrí lo que ofrecen los comercios locales y cerrá el trato por WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-8 py-4 rounded-2xl text-lg transition-colors"
            >
              Quiero buscar productos
            </Link>
            <Link
              to="/register"
              className="bg-white/20 hover:bg-white/30 text-white font-bold px-8 py-4 rounded-2xl text-lg border border-white/30 transition-colors"
            >
              Soy comerciante
            </Link>
          </div>
        </div>
      </section>

      {/* Cómo funciona */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">¿Cómo funciona?</h2>
          <p className="text-gray-500 mb-12">Simple y rápido. Sin pagos online. Sin complicaciones.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: "✍️", step: "1", title: "Publicá lo que buscás", desc: "En 3 clics describí qué necesitás y qué rubro es." },
              { icon: "🏪", step: "2", title: "Los comercios responden", desc: "Comercios locales te envían ofertas con precio y disponibilidad." },
              { icon: "💬", step: "3", title: "Cerrá el trato por WhatsApp", desc: "Hablá directamente con el comercio y coordiná el pago o envío." },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center text-2xl mb-4 mx-auto">
                  {item.icon}
                </div>
                <div className="text-xs font-bold text-green-600 uppercase tracking-widest mb-2">Paso {item.step}</div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Beneficios */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Para los vecinos</h2>
            <ul className="space-y-4">
              {[
                "Encontrá cualquier producto en Gualeguay sin salir de casa",
                "Publicá lo que buscás y esperá que los comercios te contacten",
                "Compará precios de distintos comercios locales",
                "Sin registro de tarjeta, sin pagos online",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="text-green-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Para los comercios</h2>
            <ul className="space-y-4">
              {[
                "Recibí consultas de clientes que ya saben lo que quieren",
                "Publicá tus productos y promociones del día",
                "Respondé solicitudes de vecinos en tiempo real",
                "Presencia digital local sin costos de marketplace",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-gray-600">
                  <span className="text-amber-500 mt-0.5">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-green-700 text-white py-20 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-extrabold mb-4">¿Listo para empezar?</h2>
          <p className="text-green-200 mb-8 text-lg">Unite a la comunidad de compras locales de Gualeguay. Es gratis.</p>
          <Link
            to="/register"
            className="bg-amber-400 hover:bg-amber-300 text-gray-900 font-bold px-10 py-4 rounded-2xl text-xl inline-block transition-colors"
          >
            Registrarme ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6 text-center text-gray-400 text-sm">
        © 2025 {APP_NAME} · {APP_CITY} · Hecho con ❤️ local
      </footer>
    </div>
  );
}
