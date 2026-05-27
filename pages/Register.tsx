import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, Mail, ArrowRight, ChefHat, Check, X } from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

function getPasswordErrors(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  };
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const navigate = useNavigate();

  const pwChecks = getPasswordErrors(password);
  const passwordValid = Object.values(pwChecks).every(Boolean);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordValid) {
      setPasswordTouched(true);
      toast.error("A senha não atende aos requisitos mínimos.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: "Cliente" }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          body.error ||
          (body.errors && body.errors.join(" ")) ||
          `Erro ${res.status}`;
        throw new Error(msg);
      }

      toast.success("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: "Mínimo 8 caracteres", ok: pwChecks.length },
    { label: "Uma letra maiúscula", ok: pwChecks.upper },
    { label: "Um número", ok: pwChecks.number },
    { label: 'Um símbolo (!@#$%...)', ok: pwChecks.symbol },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-sm space-y-8 text-center">
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
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                required
              />
            </div>

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

            <div className="space-y-2">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Senha"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setPasswordTouched(true);
                  }}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                  required
                />
              </div>

              {passwordTouched && (
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1 text-left">
                  {requirements.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      {ok ? (
                        <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                      ) : (
                        <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      )}
                      <span className={`text-xs ${ok ? "text-green-600" : "text-red-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative group">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type="password"
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 focus:border-primary focus:bg-white rounded-xl py-4 pl-12 pr-6 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/80 text-white py-5 rounded-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95 group text-base leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Cadastrando..." : "Criar Conta"}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>

          <p className="text-gray-400 text-sm leading-relaxed pt-2">
            Já tem conta?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline transition-colors">
              Fazer login
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
