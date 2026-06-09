import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Lock, Mail, ArrowRight, ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

export default function ClientLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = (location.state as any)?.from || '/profile';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(body.error || `Erro ${res.status}`);
      }

      localStorage.setItem("userToken", body.token);
      localStorage.setItem("userName", body.user?.name || "");
      window.dispatchEvent(new Event("user-auth-changed"));

      toast.success(`Bem-vindo, ${body.user?.name || ""}!`);
      navigate(redirectTo);
    } catch (error: any) {
      toast.error(error.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <Link to="/" className="flex flex-col items-center gap-4 mb-10 group">
          <div className="p-6 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/80 transition-colors">
            <ChefHat className="w-16 h-16" />
          </div>
          <p className="text-gray-500 text-base leading-relaxed mt-4 group-hover:text-primary transition-colors">
            Ateliê do Doce
          </p>
        </Link>

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 text-white py-5 rounded-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95 group text-base leading-relaxed"
            >
              {loading ? "Entrando..." : "Entrar"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-gray-400 text-sm leading-relaxed pt-2">
            Não tem conta?{" "}
            <Link to="/register" className="text-primary font-medium hover:underline transition-colors">
              Cadastre-se
            </Link>
          </p>
        </div>

        <p className="text-gray-400 text-base leading-relaxed pt-8">
          Área de Segurança • 2026
        </p>
      </div>
    </div>
  );
}
