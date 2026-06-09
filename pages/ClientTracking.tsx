import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { 
  Package, Clock, CheckCircle, Truck, 
  MapPin, ShoppingBag, ArrowLeft, MessageCircle, CreditCard, History, X, ExternalLink
} from 'lucide-react';

export default function ClientTracking() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl && orderId) {
      const trackingTokens = JSON.parse(localStorage.getItem('orderTrackingTokens') || '{}');
      trackingTokens[String(orderId)] = tokenFromUrl;
      localStorage.setItem('orderTrackingTokens', JSON.stringify(trackingTokens));
      window.history.replaceState(null, '', `/tracking/${orderId}`);
    }
    fetchOrder();
    const timer = window.setInterval(fetchOrder, 15000);
    return () => window.clearInterval(timer);
  }, [orderId]);

  async function fetchOrder() {
    setLoading(true);
    try {
      const trackingTokens = JSON.parse(localStorage.getItem('orderTrackingTokens') || '{}');
      const token = trackingTokens[String(orderId)];
      const data = await ordersApi.get(orderId!, token);
      if (data) setOrder(data);
    } catch {
      setOrder(null);
    }
    setLoading(false);
    fetchHistory();
  }

  async function fetchHistory() {
    const historicalIds = JSON.parse(localStorage.getItem('orderHistory') || '[]');
    if (historicalIds.length > 0) {
      const data = await Promise.all(
        historicalIds.map((id: string | number) => {
          const trackingTokens = JSON.parse(localStorage.getItem('orderTrackingTokens') || '{}');
          return ordersApi.get(id, trackingTokens[String(id)]).catch(() => null);
        })
      );
      setHistory(data.filter(Boolean).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    }
  }

  if (loading) return (<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div></div>);
  if (!order) return (<div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 text-center"><Package className="w-16 h-16 text-gray-300 mb-4" /><h2 className="text-2xl font-bold text-gray-800 font-display">Pedido Não Encontrado</h2><Link to="/" className="mt-8 px-6 py-2 bg-primary text-white rounded-full font-bold text-xs">Voltar Para a Loja</Link></div>);

  const steps = [
    { label: 'Pendente', icon: Clock, description: 'Aguardando confirmação' },
    { label: 'Em Preparo', icon: Package, description: 'Estamos preparando seu pedido' },
    { label: 'Saiu para Entrega', icon: Truck, description: 'O entregador já está a caminho!' },
    { label: 'Entregue', icon: CheckCircle, description: 'Seu pedido chegou!' }
  ];

  const currentStep = steps.findIndex(s => s.label === order.status);

  return (
    <div className="min-h-screen bg-white pb-20 font-sans">
      <div className="max-w-3xl mx-auto px-4 pt-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-colors font-bold text-sm">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
          
          {history.length > 0 && (
            <button 
              onClick={() => setShowHistory(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 text-primary rounded-xl font-bold text-xs hover:bg-indigo-100 transition-all shadow-sm"
            >
              <History className="w-4 h-4" /> Histórico de Pedidos
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl p-6 md:p-10 shadow-2xl shadow-indigo-100/20 border border-indigo-50 overflow-hidden relative">

          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-2xl md:text-3xl font-medium text-gray-900 mb-2 font-display">Acompanhe Seu Pedido</h1>
            <p className="text-primary font-bold text-xs">Pedido #{order.id}</p>
            <div className="mt-12 w-full max-w-md mx-auto">
              {steps.map((step, idx) => {
                const isActive = idx <= currentStep;
                const Icon = step.icon;
                return (
                  <div key={idx} className="flex gap-6 items-start relative mb-8 last:mb-0 group">
                    <div className="flex flex-col items-center relative">
                         <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-500 z-10 relative ${isActive ? 'bg-primary text-white shadow-xl shadow-indigo-200' : 'bg-gray-50 text-gray-300'}`}>
                            <Icon className="w-7 h-7" />
                         </div>
                         {idx < steps.length - 1 && (
                            <div className={`w-1 absolute top-14 -bottom-8 left-1/2 -translate-x-1/2 transition-all duration-500 ${idx < currentStep ? 'bg-primary' : 'bg-gray-100'}`} />
                         )}
                    </div>
                    <div className="pt-2 text-left">
                      <h3 className={`font-bold text-xl ${isActive ? 'text-gray-900' : 'text-gray-300'}`}>{step.label}</h3>
                      <p className={`text-base font-medium mt-1 leading-tight ${isActive ? 'text-gray-500' : 'text-gray-200'}`}>{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-8 bg-white rounded-xl p-6 md:p-8 border border-gray-100 shadow-sm"><h3 className="font-bold text-sm text-gray-400 mb-6 uppercase tracking-wider">Resumo da Encomenda</h3>
          <div className="space-y-4">
            {order.order_items?.map((item: any, idx: number) => (
              <div key={idx} className="flex justify-between items-center gap-3 text-base"><span className="text-gray-600 font-bold min-w-0 truncate"><span className="text-primary">{item.quantity}x</span> {item.product?.name || item.product_name}</span><span className="font-black text-gray-900 shrink-0">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}</span></div>
            ))}
            <div className="pt-6 border-t border-gray-100 flex justify-between items-center"><span className="font-bold text-gray-900 text-sm">Total Pago</span><span className="text-2xl font-medium text-primary font-display">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}</span></div>
          </div>
        </div>
        <div className="mt-6 bg-indigo-50/50 rounded-xl p-8 border border-indigo-100 flex flex-col md:flex-row gap-6">
          <div className="flex gap-4">
            <MapPin className="text-primary w-6 h-6 shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Local de Entrega</p>
              <p className="text-base text-gray-700 font-bold leading-relaxed">{order.delivery_address}</p>
            </div>
          </div>
          
          <div className="flex gap-4 border-t md:border-t-0 md:border-l border-indigo-100 pt-6 md:pt-0 md:pl-6">
            <CreditCard className="text-primary w-6 h-6 shrink-0" />
            <div>
              <p className="text-xs font-bold text-primary mb-2 uppercase tracking-wide">Pagamento</p>
              <p className="text-base text-gray-700 font-bold leading-relaxed">{order.payment_method}</p>
              {order.payment_method?.includes('PIX') && (
                <div className="mt-3 p-3 bg-white rounded-xl border border-indigo-100/50">
                  <p className="text-xs text-gray-400 font-bold uppercase mb-1">Chave PIX da Loja</p>
                  <p className="text-sm text-primary font-mono font-bold break-all">84986561077</p>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="mt-10 text-center"><p className="text-sm font-bold text-gray-400 mb-6">Precisa de Ajuda Com o Pedido?</p><a href={`https://wa.me/5584986561077?text=${encodeURIComponent(`Olá! Gostaria de falar sobre o meu pedido #${order.id}`)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-full font-bold text-sm shadow-xl shadow-green-100 hover:scale-105 transition-transform"><MessageCircle className="w-5 h-5" /> Suporte no WhatsApp</a></div>
      </div>

      <OrderHistoryModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        orders={history}
        currentId={orderId}
      />
    </div>
  );
}

function OrderHistoryModal({ isOpen, onClose, orders, currentId }: { isOpen: boolean, onClose: () => void, orders: any[], currentId: any }) {
  if (!isOpen) return null;
  const getTrackingToken = (id: string | number) => {
    const trackingTokens = JSON.parse(localStorage.getItem('orderTrackingTokens') || '{}');
    return trackingTokens[String(id)] || '';
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] animate-slide-up">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-gray-800">Seus Pedidos</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {orders.map((order) => (
            <Link 
              key={order.id} 
              to={`/tracking/${order.id}`}
              onClick={onClose}
              className={`block p-4 rounded-xl border transition-all ${order.id.toString() === currentId.toString() ? 'border-primary bg-indigo-50/30' : 'border-gray-100 hover:border-indigo-200 bg-white'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[10px] font-black text-gray-400 uppercase">Pedido #{order.id}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  order.status === 'Entregue' ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-primary'
                }`}>
                  {order.status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500 font-medium">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </span>
                <span className="text-sm font-black text-gray-900">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                </span>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <button 
            onClick={onClose}
            className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-100 transition-all"
          >
            Fechar Histórico
          </button>
        </div>
      </div>
    </div>
  );
}
