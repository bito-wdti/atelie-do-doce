import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Mail, Shield, Calendar, ChevronRight, Cake } from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      return;
    }

    fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Sessão inválida");
        return res.json();
      })
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("userToken");
        localStorage.removeItem("userName");
        navigate("/login");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userName");
    window.dispatchEvent(new Event("user-auth-changed"));
    toast.success("Até logo!");
    navigate("/");
  };

  const initials = (name: string) =>
    name
      .split(" ")
      .slice(0, 2)
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col items-center px-4 py-12">
      <div className="w-full max-w-sm space-y-6">

        {/* Avatar + nome */}
        <div className="flex flex-col items-center gap-3 pb-2">
          <div className="w-24 h-24 rounded-[2rem] bg-primary text-white flex items-center justify-center text-3xl font-bold shadow-2xl shadow-primary/30 shrink-0">
            {initials(user.name)}
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight leading-tight">
              {user.name}
            </h1>
            <p className="text-gray-400 text-sm font-medium mt-0.5">{user.role}</p>
          </div>
        </div>

        {/* Informações */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-gray-400 leading-none mb-1">E-mail</p>
              <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 px-5 py-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 leading-none mb-1">Tipo de conta</p>
              <p className="text-sm font-semibold text-gray-800">{user.role}</p>
            </div>
          </div>

          {user.created_at && (
            <div className="flex items-center gap-4 px-5 py-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 leading-none mb-1">Membro desde</p>
                <p className="text-sm font-semibold text-gray-800">{formatDate(user.created_at)}</p>
              </div>
            </div>
          )}
        </div>

        {/* Atalho para o cardápio */}
        <Link
          to="/"
          className="flex items-center justify-between w-full bg-white rounded-2xl border border-gray-100 px-5 py-4 hover:bg-indigo-50/30 transition-colors group"
        >
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
              <Cake className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-semibold text-gray-800">Ver cardápio</span>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
        </Link>

        {/* Botão Sair */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border border-red-100 text-red-500 font-semibold bg-white hover:bg-red-50 transition-all active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </div>
    </div>
  );
}
