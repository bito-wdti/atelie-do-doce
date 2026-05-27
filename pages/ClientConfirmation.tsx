import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Truck, Info, ShieldCheck, ArrowLeft, Check, Clock, Calendar, MapPin, User, CheckCircle } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { toast } from 'react-hot-toast';

export default function ClientConfirmation() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutData, setCheckoutData] = useState<any>({
    fullName: 'Cliente',
    phone: '',
    cep: '',
    address: 'Endereço não informado',
    number: '',
    complement: '',
    neighborhood: '',
    paymentMethod: '',
    changeFor: '',
    date: '',
    time: '',
    isNow: true,
    orderTime: 'Agora',
    deliveryMethod: 'entrega',
    needsChange: false,
    changeAmount: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);

    const savedCheckout = JSON.parse(localStorage.getItem('checkoutData') || '{}');
    if (Object.keys(savedCheckout).length > 0) {
      setCheckoutData(savedCheckout);
    }
  }, []);

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const deliveryFee = checkoutData.deliveryMethod === 'entrega' ? 5.00 : 0;
  const total = subtotal + deliveryFee;

  const handleFinalizeOrder = async () => {
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio!');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Registrando seu pedido no sistema...');

    try {
      const fullAddress = checkoutData.deliveryMethod === 'entrega'
        ? `${checkoutData.address}, ${checkoutData.number} - ${checkoutData.neighborhood} ${checkoutData.complement ? `(${checkoutData.complement})` : ''} - CEP: ${checkoutData.cep}`
        : 'Retirada na Loja';

      const paymentInfo = checkoutData.paymentMethod === 'money'
        ? (checkoutData.changeAmount ? `Dinheiro (Troco para R$ ${checkoutData.changeAmount})` : 'Dinheiro')
        : (checkoutData.paymentMethod === 'pix' ? 'PIX' : 'Cartão');

      const orderItems = cartItems.map(item => ({
        product_id: item.id,
        product_name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        observation: item.observation || null
      }));

      const orderData = await ordersApi.create({
        customer_name: checkoutData.fullName,
        customer_phone: checkoutData.phone,
        total_amount: total,
        payment_method: paymentInfo,
        delivery_address: fullAddress,
        notes: `Entrega: ${checkoutData.orderTime}. Instruções: ${checkoutData.instructions || 'Nenhuma'}`,
        items: orderItems
      });

      toast.success('Pedido confirmado com sucesso!', { id: toastId });

      // 3. Clear Cart and Navigate to Tracking
      localStorage.removeItem('cart');
      localStorage.removeItem('checkoutData');
      localStorage.setItem('lastOrderId', String(orderData.id));
      if (orderData.tracking_token) {
        const trackingTokens = JSON.parse(localStorage.getItem('orderTrackingTokens') || '{}');
        trackingTokens[String(orderData.id)] = orderData.tracking_token;
        localStorage.setItem('orderTrackingTokens', JSON.stringify(trackingTokens));
      }

      // Save to history
      const history = JSON.parse(localStorage.getItem('orderHistory') || '[]');
      if (!history.includes(orderData.id)) {
        history.push(orderData.id);
        localStorage.setItem('orderHistory', JSON.stringify(history));
      }

      window.dispatchEvent(new Event('cart-updated'));
      navigate(`/tracking/${orderData.id}`);

    } catch (error) {
      console.error('Error saving order:', error);
      toast.error('Erro ao processar pedido. Tente novamente.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getPaymentLabel = () => {
    switch (checkoutData.paymentMethod) {
      case 'money': return 'Dinheiro';
      case 'pix': return 'PIX';
      case 'card': return 'Cartão';
      default: return 'Não selecionado';
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12 animate-fade-in bg-white min-h-screen">
<div className="pt-4"></div>

      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 mb-4">Confirmação Final</h1>
        <p className="text-gray-500 font-medium tracking-tight">Revise os detalhes abaixo para gerar seu número de pedido.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <ShoppingBasket className="text-primary w-5 h-5" />
              </div>
              Itens Escolhidos
            </h2>

            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-xl overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 text-base md:text-lg">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">
                      {item.quantity} x Unidade
                      {item.observation && <span className="block text-[#974e60] font-bold italic">Obs: {item.observation}</span>}
                    </p>
                    <p className="text-primary font-bold mt-1">
                      {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-base font-medium">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-bold text-lg">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-base font-medium">
                <span className="text-gray-500">Taxa de Entrega</span>
                <span className="text-gray-900 font-bold text-lg">
                  {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-800">Total do Pedido</span>
                <span className="text-2xl md:text-3xl font-display font-medium text-primary">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Truck className="text-primary w-5 h-5" />
              </div>
              Informações de Entrega
            </h2>
            <div className="grid md:grid-cols-2 gap-6 md:gap-10">
              <div className="space-y-5">
                <p className="text-sm font-bold text-primary">Destinatário & Local</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-gray-900 font-bold text-lg leading-tight">{checkoutData.fullName || 'Não informado'}</p>
                      <p className="text-xs text-primary font-bold mt-1">{checkoutData.phone || 'Telefone não informado'}</p>
                    </div>
                  </div>
                  {checkoutData.deliveryMethod === 'entrega' ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          {checkoutData.address}, {checkoutData.number}<br />
                          {checkoutData.neighborhood} - {checkoutData.cep}
                          {checkoutData.complement && <span className="block italic text-gray-400 mt-1">({checkoutData.complement})</span>}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800 font-bold">Retirada no Estabelecimento</p>
                        <p className="text-xs text-gray-500 mt-1">Endereço de retirada informado no pedido</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-sm font-bold text-primary">Agendamento & Pagamento</p>
                <div className="bg-indigo-50/50 p-6 rounded-xl border border-indigo-100/50 flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <p className="text-gray-900 font-bold text-lg">{checkoutData.orderTime}</p>
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t border-indigo-100">
                    <CheckCircle className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-primary">Forma de Pagamento</p>
                      <p className="text-sm text-gray-800 font-bold">
                        {getPaymentLabel()}
                        {checkoutData.paymentMethod === 'money' && checkoutData.changeAmount && (
                          <span className="block text-[10px] text-gray-500">Troco para R$ {checkoutData.changeAmount}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 self-start">
          <div className="bg-white rounded-xl p-8 shadow-xl shadow-indigo-100/20 border border-indigo-100 text-center">
            <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Tudo pronto?</h2>
            <p className="text-sm text-gray-500 font-medium tracking-tight mb-8">Ao clicar no botão abaixo, seu pedido será enviado para nossa produção.</p>

            <div className="bg-gray-50/80 rounded-xl p-5 mb-8 text-sm space-y-4 border border-gray-100 text-left">
              <div className="flex gap-3">
                <ShieldCheck className="text-primary w-5 h-5 flex-shrink-0" />
                <p className="text-gray-600 leading-snug">Seu pedido será salvo com segurança no nosso sistema.</p>
              </div>
              <div className="flex gap-3">
                <Info className="text-primary w-5 h-5 flex-shrink-0" />
                <p className="text-gray-600 leading-snug">Você poderá acompanhar o status em tempo real após confirmar.</p>
              </div>
            </div>

            <button
              onClick={handleFinalizeOrder}
              disabled={isSubmitting}
              className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] shadow-xl shadow-indigo-200/30 text-base group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processando...' : 'Confirmar Pedido'}
            </button>

            <p className="text-xs text-center text-gray-400 mt-6 font-bold">
              Processamento Instantâneo
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <Link to="/checkout" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-primary transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Editar detalhes
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
