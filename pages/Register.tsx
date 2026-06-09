import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, User, Mail, ArrowRight, ChefHat, Check, X, Phone, CreditCard } from "lucide-react";
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

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function isCpfValid(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digits)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i);
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i);
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(digits[10]);
}

function formatTelefone(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isTelefoneValid(telefone: string) {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(telefone);
}

function isEmailValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function inputBorder(touched: boolean, valid: boolean) {
  if (!touched) return "border-gray-200";
  return valid ? "border-green-500" : "border-red-400";
}

function inputBg(touched: boolean, valid: boolean) {
  if (!touched) return "bg-gray-50 focus:bg-white";
  return valid ? "bg-green-50 focus:bg-white" : "bg-red-50 focus:bg-white";
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [telefone, setTelefone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [passwordTouched, setPasswordTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [cpfTouched, setCpfTouched] = useState(false);
  const [telefoneTouched, setTelefoneTouched] = useState(false);

  const navigate = useNavigate();

  const pwChecks = getPasswordErrors(password);
  const passwordValid = Object.values(pwChecks).every(Boolean);
  const emailValid = isEmailValid(email);
  const cpfValid = isCpfValid(cpf);
  const telefoneValid = isTelefoneValid(telefone);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setPasswordTouched(true);
    setEmailTouched(true);
    setCpfTouched(true);
    setTelefoneTouched(true);

    if (!passwordValid) {
      toast.error("A senha não atende aos requisitos mínimos.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    if (!cpfValid) {
      toast.error("CPF inválido.");
      return;
    }
    if (!telefoneValid) {
      toast.error("Telefone inválido.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, cpf, telefone, role: "Cliente" }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const msg =
          body.error ||
          (body.errors && body.errors.join(" ")) ||
          `Erro ${res.status}`;
        throw new Error(msg);
      }

      const loginRes = await fetch(`${API_URL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const loginBody = await loginRes.json().catch(() => ({}));

      if (loginRes.ok) {
        localStorage.setItem("userToken", loginBody.token);
        localStorage.setItem("userName", loginBody.user?.name || name);
        window.dispatchEvent(new Event("user-auth-changed"));
      }

      toast.success("Cadastro realizado com sucesso!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Erro ao cadastrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const pwRequirements = [
    { label: "Mínimo 8 caracteres", ok: pwChecks.length },
    { label: "Uma letra maiúscula", ok: pwChecks.upper },
    { label: "Um número", ok: pwChecks.number },
    { label: "Um símbolo (!@#$%...)", ok: pwChecks.symbol },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 animate-fade-in font-sans">
      <div className="w-full max-w-sm space-y-8 text-center">
        <Link to="/" className="flex flex-col items-center gap-4 mb-10 group">
          <div className="p-6 rounded-[2rem] bg-primary text-white shadow-2xl shadow-primary/30 flex items-center justify-center shrink-0 group-hover:bg-primary/80 transition-colors">
            <ChefHat className="w-16 h-16" />
          </div>
          <div>
            <p className="text-gray-500 text-base leading-relaxed mt-4 group-hover:text-primary transition-colors">
              Ateliê do Doce
            </p>
          </div>
        </Link>

        <div className="space-y-4">
          <form onSubmit={handleRegister} className="space-y-4">

            {/* Nome */}
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

            {/* E-mail */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="E-mail"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setEmailTouched(true);
                  }}
                  className={`w-full border ${inputBorder(emailTouched, emailValid)} ${inputBg(emailTouched, emailValid)} focus:border-primary rounded-xl py-4 pl-12 pr-10 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                  required
                />
                {emailTouched && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {emailValid
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <X className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
              {emailTouched && !emailValid && (
                <p className="text-xs text-red-400 text-left px-1">E-mail inválido</p>
              )}
            </div>

            {/* CPF */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                  <CreditCard className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="CPF (000.000.000-00)"
                  value={cpf}
                  onChange={(e) => {
                    setCpf(formatCpf(e.target.value));
                    setCpfTouched(true);
                  }}
                  className={`w-full border ${inputBorder(cpfTouched, cpfValid)} ${inputBg(cpfTouched, cpfValid)} focus:border-primary rounded-xl py-4 pl-12 pr-10 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                  required
                />
                {cpfTouched && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {cpfValid
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <X className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
              {cpfTouched && !cpfValid && (
                <p className="text-xs text-red-400 text-left px-1">
                  {cpf.replace(/\D/g, "").length < 11 ? "CPF incompleto" : "CPF inválido"}
                </p>
              )}
            </div>

            {/* Telefone */}
            <div className="space-y-1">
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="Telefone ((00) 00000-0000)"
                  value={telefone}
                  onChange={(e) => {
                    setTelefone(formatTelefone(e.target.value));
                    setTelefoneTouched(true);
                  }}
                  className={`w-full border ${inputBorder(telefoneTouched, telefoneValid)} ${inputBg(telefoneTouched, telefoneValid)} focus:border-primary rounded-xl py-4 pl-12 pr-10 text-base leading-relaxed outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                  required
                />
                {telefoneTouched && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    {telefoneValid
                      ? <Check className="w-4 h-4 text-green-500" />
                      : <X className="w-4 h-4 text-red-400" />
                    }
                  </div>
                )}
              </div>
              {telefoneTouched && !telefoneValid && (
                <p className="text-xs text-red-400 text-left px-1">
                  {telefone.replace(/\D/g, "").length < 11 ? "Telefone incompleto" : "Formato inválido: (00) 00000-0000"}
                </p>
              )}
            </div>

            {/* Senha */}
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
                  {pwRequirements.map(({ label, ok }) => (
                    <div key={label} className="flex items-center gap-1.5">
                      {ok
                        ? <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                        : <X className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      }
                      <span className={`text-xs ${ok ? "text-green-600" : "text-red-400"}`}>
                        {label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirmar senha */}
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
