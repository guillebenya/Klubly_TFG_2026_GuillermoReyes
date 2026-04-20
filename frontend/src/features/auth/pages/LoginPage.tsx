import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/auth.service";
import { Lock, User, AlertCircle } from "lucide-react";
import logo from "../../../assets/Klubly_Logo.png";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authService.login(username, password);
      navigate("/dashboard"); // Si sale bien, vamos al dashboard
    } catch (err: any) {
      setError("Credenciales incorrectas. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-indigo-500 px-4">
      <div className="w-full max-w-md rounded-2xl bg-slate-50 p-8 shadow-2xl ring-1 ring-white/10">
        <div className="mb-8 text-center">
          <img src={logo} alt="Klubly Logo" className="mx-auto mb-4 w-32" />
          <h1 className="text-2xl font-bold text-black">Iniciar sesión</h1>
          <p className="mt-2 text-slate-500">
            Por favor, introduce tu usuario y contraseña
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-sm text-red-400 ring-1 ring-red-500/50">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-500">
              Usuario
            </label>
            <div className="relative mt-1">
              <User
                className="absolute top-3 left-3 text-slate-400"
                size={18}
              />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg bg-gray-200 py-2.5 pr-4 pl-10 text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-sky-500 transition-all"
                placeholder="usuario"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-500">
              Contraseña
            </label>
            <div className="relative mt-1">
              <Lock
                className="absolute top-3 left-3 text-slate-400"
                size={18}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg bg-gray-200 py-2.5 pr-4 pl-10 text-slate-900 placeholder-slate-400 outline-none ring-1 ring-slate-300 focus:ring-2 focus:ring-sky-500 transition-all"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-500 py-3 font-semibold text-white hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 disabled:opacity-50 transition-all cursor-pointer"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
