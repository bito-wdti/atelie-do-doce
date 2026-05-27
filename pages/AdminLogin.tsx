import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, ArrowRight, ChefHat } from "lucide-react";
import { toast } from "react-hot-toast";
import { authApi } from "../services/api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getEmail = (user: string) => {
    return user.includes("@") ? user : `${user}@delivery.com`;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authApi.login(password);
      toast.success("Bem-vindo, Admin!");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error("Erro ao entrar: " + (error.message || "Usuário ou senha incorretos."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo */}
        <div className="flex flex-col items-center gap-4 mb-10">
          <div className="p-6 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center shrink-0">
            <ChefHat className="w-16 h-16" />
          </div>
          <div>
            <p className="text-gray-500 text-base leading-relaxed mt-4">
              Ateliê do Doce
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Usuário"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                required
              />
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
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
              {loading ? "Validando..." : "Entrar no Sistema"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-gray-400 text-base leading-relaxed pt-8">
          Área de Segurança • 2026
        </p>
      </div>
    </div>
  );
}
