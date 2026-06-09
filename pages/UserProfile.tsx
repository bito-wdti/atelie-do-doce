import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  LogOut, Mail, ChevronRight, Cake, Settings,
  ShoppingBag, ChevronDown, ChevronUp, MapPin, CreditCard,
  Package, Clock, ClipboardList, Phone, PenLine,
} from "lucide-react";
import { toast } from "react-hot-toast";

const API_URL = (import.meta as any).env?.VITE_API_URL || "http://localhost:3001/api";

const STATUS_STYLES: Record<string, { pill: string; dot: string }> = {
  "Pendente":           { pill: "bg-yellow-100 text-yellow-700",  dot: "bg-yellow-400" },
  "Em Preparo":         { pill: "bg-blue-100 text-blue-700",      dot: "bg-blue-400" },
  "Saiu para Entrega":  { pill: "bg-violet-100 text-violet-700",  dot: "bg-violet-400" },
  "Entregue":           { pill: "bg-green-100 text-green-700",    dot: "bg-green-400" },
  "Cancelado":          { pill: "bg-red-100 text-red-600",        dot: "bg-red-400" },
};

function fmt(val: number) {
  return val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function parseAddress(raw: string | null | undefined): string {
  if (!raw) return "";
  try {
    const a = JSON.parse(raw);
    let line = [a.address, a.number].filter(Boolean).join(", ");
    if (a.complement) line += ` (${a.complement})`;
    if (a.neighborhood) line += ` — ${a.neighborhood}`;
    if (a.cep) line += `, CEP ${a.cep}`;
    return line;
  } catch {
    return raw;
  }
}

/* ──────────────────────────────────────────────────────────── */
/*  Order card                                                   */
/* ──────────────────────────────────────────────────────────── */
function OrderCard({ order }: { order: any }) {
  const [expanded, setExpanded] = useState(false);
  const style = STATUS_STYLES[order.status] ?? { pill: "bg-gray-100 text-gray-500", dot: "bg-gray-300" };

  return (
    <div className={`bg-white rounded-2xl border overflow-hidden transition-shadow ${expanded ? "border-indigo-100 shadow-md shadow-indigo-50" : "border-gray-100"}`}>

      {/* Row sempre visível */}
      <button
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 transition-colors text-left gap-3"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="relative shrink-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-primary" />
            </div>
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border-2 border-white ${style.dot}`} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 leading-tight">Pedido #{order.id}</p>
            <p className="text-xs text-gray-400 mt-0.5">{fmtDate(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <span className={`hidden sm:inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full ${style.pill}`}>
            {order.status}
          </span>
          <span className="text-sm font-bold text-gray-800">{fmt(Number(order.total_amount))}</span>
          {expanded
            ? <ChevronUp className="w-4 h-4 text-gray-400" />
            : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>
      </button>

      {/* Status visível em mobile */}
      {!expanded && (
        <div className={`sm:hidden mx-5 mb-3 -mt-1 inline-flex text-[10px] font-bold px-2.5 py-1 rounded-full ${style.pill}`}>
          {order.status}
        </div>
      )}

      {/* Detalhes expandidos */}
      {expanded && (
        <div className="bg-gray-50/60 border-t border-gray-100 px-5 py-4 space-y-4 animate-fade-in">

          {order.order_items?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
                <Package className="w-3 h-3" /> Itens do pedido
              </p>
              <div className="space-y-2.5">
                {order.order_items.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-gray-100">
                    {item.product?.img && (
                      <img src={item.product.img} alt={item.product_name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate">{item.product_name}</p>
                      {item.observation && (
                        <p className="text-[10px] text-primary italic truncate mt-0.5">Obs: {item.observation}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-[10px] text-gray-400 font-medium">{item.quantity}×</p>
                      <p className="text-xs font-bold text-gray-700">{fmt(item.unit_price * item.quantity)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-3">
            {order.delivery_address && (
              <div className="bg-white rounded-xl px-3 py-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> Entrega
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">{order.delivery_address}</p>
              </div>
            )}
            {order.payment_method && (
              <div className="bg-white rounded-xl px-3 py-3 border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                  <CreditCard className="w-3 h-3" /> Pagamento
                </p>
                <p className="text-xs text-gray-700 font-semibold">{order.payment_method}</p>
              </div>
            )}
          </div>

          {order.notes && (
            <div className="bg-white rounded-xl px-3 py-3 border border-gray-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Observações
              </p>
              <p className="text-xs text-gray-500 italic leading-relaxed">{order.notes}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-gray-200">
            <span className="text-xs text-gray-400 font-medium">Total do pedido</span>
            <span className="text-base font-bold text-primary">{fmt(Number(order.total_amount))}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────── */
/*  Page                                                         */
/* ──────────────────────────────────────────────────────────── */
export default function UserProfile() {
  const [user, setUser]     = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) { navigate("/login"); return; }
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API_URL}/users/me`,   { headers: h }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
      fetch(`${API_URL}/orders/my`,  { headers: h }).then(r => r.ok ? r.json() : []),
    ])
      .then(([u, o]) => { setUser(u); setOrders(o || []); })
      .catch(() => { localStorage.removeItem("userToken"); localStorage.removeItem("userName"); navigate("/login"); })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    ["userToken","userName","checkoutData","cart"].forEach(k => localStorage.removeItem(k));
    window.dispatchEvent(new Event("user-auth-changed"));
    toast.success("Até logo!");
    navigate("/");
  };

  const initials = (n: string) => n.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }
  if (!user) return null;

  const deliveryAddress = parseAddress(user.delivery_address);

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-10 md:py-14">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col-reverse lg:grid lg:grid-cols-12 gap-6 lg:gap-8">

          {/* ══ ESQUERDA: Histórico ══ */}
          <div className="lg:col-span-7 space-y-3">

            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-primary" />
                <h2 className="text-sm font-bold text-gray-700 tracking-wide">Últimos pedidos</h2>
              </div>
              {orders.length > 0 && (
                <span className="text-xs text-gray-400 font-medium">{orders.length} {orders.length === 1 ? "pedido" : "pedidos"}</span>
              )}
            </div>

            {orders.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 px-6 py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="w-6 h-6 text-primary/50" />
                </div>
                <p className="text-sm font-bold text-gray-500">Nenhum pedido ainda</p>
                <p className="text-xs text-gray-400 mt-1 mb-5">Quando você fizer um pedido, ele aparecerá aqui.</p>
                <Link to="/"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-primary hover:brightness-110 transition-all px-4 py-2 rounded-full shadow-sm shadow-primary/20">
                  <Cake className="w-3.5 h-3.5" /> Ver cardápio
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map(o => <OrderCard key={o.id} order={o} />)}
              </div>
            )}
          </div>

          {/* ══ DIREITA: Perfil ══ */}
          <div className="lg:col-span-5 space-y-4">

            {/* ── Card de perfil ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">

              {/* Hero: avatar + nome */}
              <div className="relative bg-gradient-to-br from-indigo-50 to-white px-6 pt-7 pb-5 flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-primary/25 shrink-0 overflow-hidden">
                  {user.avatar_url
                    ? <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    : initials(user.name)}
                </div>
                <div className="min-w-0">
                  <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{user.name}</h1>
                  <p className="text-xs text-primary font-semibold mt-0.5">{user.role}</p>
                </div>
                <Link to="/profile/settings"
                  title="Editar perfil"
                  className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 transition-colors shadow-sm">
                  <PenLine className="w-3.5 h-3.5" />
                </Link>
              </div>

              {/* Dados de contato e endereço */}
              <div className="divide-y divide-gray-50">

                <div className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">E-mail</p>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Telefone</p>
                    {user.telefone ? (
                      <p className="text-sm font-semibold text-gray-800">{user.telefone}</p>
                    ) : (
                      <Link to="/profile/settings" className="text-xs font-semibold text-primary/70 hover:text-primary transition-colors">
                        Não informado — adicionar
                      </Link>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3 px-5 py-3.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Endereço padrão</p>
                    {deliveryAddress ? (
                      <p className="text-xs font-semibold text-gray-700 leading-relaxed">{deliveryAddress}</p>
                    ) : (
                      <Link to="/profile/settings?tab=address" className="text-xs font-semibold text-primary/70 hover:text-primary transition-colors">
                        Não cadastrado — adicionar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Ações ── */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y divide-gray-50">
              <Link to="/profile/settings"
                className="flex items-center justify-between px-5 py-4 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Settings className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Alterar meus dados</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </Link>

              <Link to="/"
                className="flex items-center justify-between px-5 py-4 hover:bg-indigo-50/30 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                    <Cake className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm font-semibold text-gray-800">Ver cardápio</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
              </Link>
            </div>

            {/* ── Logout ── */}
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-red-100 text-red-500 text-sm font-semibold bg-white hover:bg-red-50 transition-all active:scale-95">
              <LogOut className="w-4 h-4" />
              Sair da conta
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
