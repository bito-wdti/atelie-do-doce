import React, { useState, useEffect } from 'react';
import { ShoppingBasket, Truck, Info, ShieldCheck, ArrowLeft, Check, Clock, Calendar, MapPin, User, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ClientConfirmation() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutData, setCheckoutData] = useState<any>({
    fullName: 'Cliente',
    address: 'Endereço não informado',
    complement: '',
    cep: '',
    date: '',
    time: '',
    instructions: '',
    deliveryMethod: 'entrega'
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

  // Format date to long version for the card
  const getFormattedDate = () => {
    if (!checkoutData.date) return 'Data não selecionada';
    return checkoutData.date; // already in dd/mm/aaaa
  };

  const sendWhatsAppMessage = () => {
    const itemsList = cartItems.map(item => 
      `• ${item.name} (${item.quantity}x) ${item.observation ? `- ${item.observation}` : ''}`
    ).join('\n');

    const message = `Resumo do Pedido
• Itens:
${itemsList}

Subtotal: ${subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Taxa de Entrega: ${deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
Total: ${total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}

Método de Atendimento
• ${checkoutData.deliveryMethod === 'entrega' ? 'Entrega' : 'Retirada'}

Endereço de Entrega
${checkoutData.deliveryMethod === 'entrega' 
  ? `• ${checkoutData.address}\n• ${checkoutData.complement || 'Sem complemento'}\n• CEP: ${checkoutData.cep}` 
  : '• Retirada na Loja'}

• Data Preferencial: ${checkoutData.date}
• Horário Preferencial: ${checkoutData.time}

• Instruções Especiais
• ${checkoutData.instructions || 'Nenhuma'}

• Pedido enviado automaticamente pelo sistema.`;

    const phone = "5584999469335"; // Número oficial
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-16 py-8 md:py-12">
      {/* Progress Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-center max-w-xl mx-auto relative px-4">
          <Link to="/cart" className="flex flex-col items-center z-10 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#FE5B95] text-white flex items-center justify-center font-bold shadow-lg shadow-pink-100 group-hover:scale-110 transition-transform">
              <Check className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 group-hover:text-[#FE5B95] transition-colors">Carrinho</span>
          </Link>
          <div className="flex-1 h-0.5 bg-pink-100 mx-2 -mt-6"></div>
          <Link to="/checkout" className="flex flex-col items-center z-10 group cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-[#FE5B95] text-white flex items-center justify-center font-bold shadow-lg shadow-pink-100 group-hover:scale-110 transition-transform">
              <Check className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-2 group-hover:text-[#FE5B95] transition-colors">Detalhes</span>
          </Link>
          <div className="flex-1 h-0.5 bg-pink-100 mx-2 -mt-6"></div>
          <div className="flex flex-col items-center z-10">
            <div className="w-10 h-10 rounded-full bg-[#FE5B95] text-white flex items-center justify-center font-bold ring-8 ring-pink-50">
              3
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#FE5B95] mt-2">Confirmar</span>
          </div>
        </div>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-display font-semibold text-gray-900 mb-4">Confirmação Final</h1>
        <p className="text-gray-500 font-medium tracking-tight">Revise seu pedido antes de seguirmos para o WhatsApp.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <ShoppingBasket className="text-[#FE5B95] w-5 h-5" />
              </div>
              Resumo do Pedido
            </h2>
            
            <div className="space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 group">
                  <div className="w-20 h-20 md:w-24 md:h-24 bg-pink-50 rounded-[1.5rem] overflow-hidden flex-shrink-0 transition-transform group-hover:scale-105">
                    <img alt={item.name} className="w-full h-full object-cover" src={item.img} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 text-base md:text-lg">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-400 font-medium">
                      {item.quantity} x Unidade
                      {item.observation && <span className="block text-[#974e60] font-bold italic">Obs: {item.observation}</span>}
                    </p>
                    <p className="text-[#FE5B95] font-bold mt-1">
                      {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-gray-100 space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Subtotal</span>
                <span className="text-gray-900 font-bold">
                  {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-500">Taxa de {checkoutData.deliveryMethod === 'entrega' ? 'Entrega' : 'Serviço'}</span>
                <span className="text-gray-900 font-bold">
                  {deliveryFee.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-800">Total Geral</span>
                <span className="text-3xl font-display font-semibold text-[#FE5B95]">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          </div>

          {/* Delivery & Logistics Section */}
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-sm border border-gray-100">
            <h2 className="text-xl md:text-2xl font-bold mb-8 flex items-center gap-3 text-gray-800">
              <div className="w-10 h-10 rounded-xl bg-pink-50 flex items-center justify-center">
                <Truck className="text-[#FE5B95] w-5 h-5" />
              </div>
              Logística & {checkoutData.deliveryMethod === 'entrega' ? 'Entrega' : 'Retirada'}
            </h2>
            <div className="grid md:grid-cols-2 gap-10">
              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-widest text-[#FE5B95]">Destinatário & Local</p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                    <div>
                      <p className="text-gray-900 font-bold text-lg leading-tight">{checkoutData.fullName || 'Não informado'}</p>
                    </div>
                  </div>
                  {checkoutData.deliveryMethod === 'entrega' ? (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-600 font-medium leading-relaxed">
                          {checkoutData.address || 'Endereço não informado'}
                          {checkoutData.complement && `, ${checkoutData.complement}`}
                          {checkoutData.cep && ` - CEP: ${checkoutData.cep}`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#FE5B95] mt-1 shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800 font-bold underline decoration-pink-200 underline-offset-4">Retirada na Loja Karolayne Doces</p>
                        <p className="text-xs text-gray-500 mt-1">Av. Rio Grande do Norte, 402, Natal/RN</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-5">
                <p className="text-sm font-bold uppercase tracking-widest text-[#FE5B95]">Data & Horário</p>
                <div className="bg-pink-50/50 p-6 rounded-2xl border border-pink-100/50 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#FE5B95]" />
                    <p className="text-gray-900 font-bold text-lg">{getFormattedDate()}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-[#FE5B95]" />
                    <p className="text-sm text-[#FE5B95] font-bold uppercase tracking-tight">{checkoutData.time || 'Horário não selecionado'}</p>
                  </div>
                </div>
              </div>
            </div>
            {checkoutData.instructions && (
              <div className="mt-8 pt-8 border-t border-gray-100">
                <p className="text-sm font-bold uppercase tracking-widest text-[#FE5B95] mb-4">Instruções Especiais</p>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-sm text-gray-600 italic leading-relaxed">"{checkoutData.instructions}"</p>
                </div>
              </div>
            )}

            {/* Mobile Only: WhatsApp Button */}
            <div className="lg:hidden mt-10 pt-4 border-t border-gray-100">
              <button 
                onClick={sendWhatsAppMessage}
                className="w-full bg-[#25D366] hover:bg-[#1fb355] text-white font-bold py-5 rounded-[1.5rem] flex items-center justify-center gap-3 transition-all transform hover:scale-[1.02] shadow-xl shadow-green-100/30 text-lg group"
              >
                <svg className="w-6 h-6 fill-white group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                </svg>
                Finalizar via WhatsApp
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:col-span-4 self-start">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-pink-100/20 border border-pink-50 text-center">
            {/* Info Section - Desktop Only */}
            <div>
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                 <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-20"></div>
                <svg className="w-10 h-10 fill-[#25D366] relative z-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
                </svg>
              </div>
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Quase lá!</h2>
              <p className="text-sm text-gray-500 font-medium tracking-tight mb-8">O seu pedido será finalizado no WhatsApp para sua segurança.</p>
              
              <div className="bg-gray-50/80 rounded-[1.5rem] p-5 mb-8 text-sm space-y-4 border border-gray-100 text-left">
                <div className="flex gap-3">
                  <Info className="text-[#FE5B95] w-5 h-5 flex-shrink-0" />
                  <p className="text-gray-600 leading-snug">Um representante confirmará os <strong>detalhes de pagamento</strong> e entrega.</p>
                </div>
                <div className="flex gap-3">
                  <ShieldCheck className="text-[#FE5B95] w-5 h-5 flex-shrink-0" />
                  <p className="text-gray-600 leading-snug">Atendimento humanizado para garantir cada detalhe do seu bolo.</p>
                </div>
              </div>
            </div>

            <button 
              onClick={sendWhatsAppMessage}
              className="w-full bg-[#25D366] hover:bg-[#1fb355] text-white font-bold py-6 rounded-[2rem] flex items-center justify-center gap-4 transition-all transform hover:scale-[1.02] shadow-xl shadow-green-100/30 text-lg group"
            >
               <svg className="w-6 h-6 fill-white group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.432h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"></path>
               </svg>
               Finalizar via WhatsApp
            </button>

            <p className="text-[10px] text-center text-gray-400 mt-6 uppercase tracking-[0.2em] font-bold">
              Resposta imediata no horário comercial
            </p>
          </div>
          
          <div className="mt-8 flex justify-center">
            <Link to="/" className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-[#FE5B95] transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Cancelar e voltar para a loja
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}