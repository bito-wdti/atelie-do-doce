import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, MapPin, Clock, CreditCard, ChevronDown, ChevronUp, Check, AlertCircle, ShoppingBag, Truck, Store } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export default function ClientCheckout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(true);
  const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');
  
  // Checkout States
  const [formData, setFormData] = useState({
    fullName: '',
    address: '',
    complement: '',
    cep: '',
    instructions: ''
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(savedCart);
    
    // Load saved form data
    const savedForm = JSON.parse(localStorage.getItem('checkoutData') || '{}');
    if (savedForm.address) setFormData(prev => ({ ...prev, ...savedForm }));
    if (savedForm.deliveryMethod) setDeliveryMethod(savedForm.deliveryMethod);
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = deliveryMethod === 'entrega' ? 5.00 : 0;
    return subtotal + deliveryFee;
  };

  const handleFinishOrder = () => {
    if (deliveryMethod === 'entrega' && (!formData.address || !formData.fullName)) {
      toast.error('Informe o endereço de entrega completo');
      setIsEditingAddress(true);
      return;
    }
    if (deliveryMethod === 'retirada' && !formData.fullName) {
      toast.error('Informe seu nome para retirada');
      setIsEditingAddress(true);
      return;
    }
    if (!paymentMethod) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }
    
    localStorage.setItem('checkoutData', JSON.stringify({ ...formData, paymentMethod, deliveryMethod }));
    navigate('/confirmation');
  };

  const isStep1Complete = deliveryMethod === 'retirada' ? (!!formData.fullName) : (formData.fullName && formData.address && formData.cep);

  return (
    <div className="min-h-screen bg-[#F7F7F7] pb-32">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50 px-4 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/cart')} className="p-2 -ml-2 text-gray-600">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-bold text-[#FE5B95]">Karolayne</span>
          <span className="text-2xl font-display font-bold text-[#975233]">Doces</span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Delivery/Pickup Method Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-2 flex gap-2">
            <button 
              onClick={() => setDeliveryMethod('entrega')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'entrega' ? 'bg-[#FE5B95] text-white shadow-lg shadow-pink-100' : 'text-gray-400'}`}
            >
              <Truck className={`w-4 h-4 ${deliveryMethod === 'entrega' ? 'text-white' : 'text-gray-400'}`} />
              Entrega
            </button>
            <button 
              onClick={() => setDeliveryMethod('retirada')}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'retirada' ? 'bg-[#FE5B95] text-white shadow-lg shadow-pink-100' : 'text-gray-400'}`}
            >
              <Store className={`w-4 h-4 ${deliveryMethod === 'retirada' ? 'text-white' : 'text-gray-400'}`} />
              Retirada
            </button>
          </div>
        </section>

        {/* Delivery Address or Personal Info Card */}
        <section className={`bg-white rounded-2xl shadow-sm border transition-all ${!isStep1Complete ? 'border-orange-400' : 'border-gray-100'} overflow-hidden`}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                {!isStep1Complete && (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800">
                  {deliveryMethod === 'entrega' ? 'Endereço de entrega' : 'Dados para retirada'}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                {!isStep1Complete && (
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                    Obrigatório
                  </span>
                )}
                {isStep1Complete && !isEditingAddress && (
                  <button 
                    onClick={() => setIsEditingAddress(true)}
                    className="text-[#FE5B95] font-bold text-sm"
                  >
                    Trocar
                  </button>
                )}
              </div>
            </div>
            
            {(isEditingAddress || !isStep1Complete) ? (
              <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 gap-3">
                  <input 
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nome de quem vai receber / retirar"
                    className="w-full bg-[#f8f8f8] border-gray-100 focus:border-[#FE5B95]/50 focus:bg-white rounded-xl p-4 text-sm transition-all shadow-inner"
                  />
                  {deliveryMethod === 'entrega' && (
                    <>
                      <input 
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        placeholder="Endereço (Rua, Número, Bairro)"
                        className="w-full bg-[#f8f8f8] border-gray-100 focus:border-[#FE5B95]/50 focus:bg-white rounded-xl p-4 text-sm transition-all shadow-inner"
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <input 
                          name="complement"
                          value={formData.complement}
                          onChange={handleInputChange}
                          placeholder="Complemento"
                          className="w-full bg-[#f8f8f8] border-gray-100 focus:border-[#FE5B95]/50 focus:bg-white rounded-xl p-4 text-sm transition-all shadow-inner"
                        />
                        <input 
                          name="cep"
                          value={formData.cep}
                          onChange={handleInputChange}
                          placeholder="CEP"
                          className="w-full bg-[#f8f8f8] border-gray-100 focus:border-[#FE5B95]/50 focus:bg-white rounded-xl p-4 text-sm transition-all shadow-inner"
                        />
                      </div>
                    </>
                  )}
                </div>
                {isStep1Complete && (
                  <button 
                    onClick={() => setIsEditingAddress(false)}
                    className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl text-sm transition-all active:scale-95"
                  >
                    Salvar {deliveryMethod === 'entrega' ? 'Endereço' : 'Dados'}
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold text-gray-800 leading-tight">
                      {formData.fullName}
                    </p>
                    {deliveryMethod === 'entrega' ? (
                      <p className="text-gray-500 text-sm mt-1">
                        {formData.address}, {formData.complement && `${formData.complement}, `} {formData.cep}
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm mt-1">
                        Retirada na nossa padaria
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {deliveryMethod === 'entrega' ? 'Instruções de entrega (opcional)' : 'Observações para retirada (opcional)'}
                  </label>
                  <textarea
                    name="instructions"
                    value={formData.instructions}
                    onChange={handleInputChange}
                    placeholder="Detalhes adicionais..."
                    className="w-full bg-[#f8f8f8] border-transparent focus:border-[#FE5B95]/20 focus:bg-white rounded-xl p-4 text-sm resize-none transition-all placeholder:text-gray-400"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Store & Items Card */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-gray-50">
            <div className="flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100">
                <img src="/logo.png" alt="Karolayne Doces" className="w-full h-full object-contain" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Karolayne Doces</h3>
                <p className="text-xs text-gray-500">{cartItems.length} {cartItems.length === 1 ? 'produto' : 'produtos'}</p>
              </div>
            </div>
            <button 
               onClick={() => setIsStoreDetailsOpen(!isStoreDetailsOpen)}
               className="text-gray-400 p-1"
            >
              {isStoreDetailsOpen ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
            </button>
          </div>
          
          {isStoreDetailsOpen && (
            <div className="p-5 space-y-4 animate-slide-up">
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-4 items-start">
                  <span className="text-gray-400 font-bold text-sm mt-1">{item.quantity}u</span>
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-50 border border-gray-100">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-bold text-gray-800 leading-tight">{item.name}</p>
                    <p className="text-sm text-gray-800 font-medium mt-1">
                      {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="px-5 py-4 flex justify-between items-center bg-gray-50/30 border-t border-gray-50">
            <span className="text-sm text-gray-600">Entrega estimada:</span>
            <span className="font-bold text-gray-800">15 - 20 min</span>
          </div>
        </section>

        {/* Payment Method Card */}
        <section className={`bg-white rounded-2xl shadow-sm border transition-all ${!paymentMethod ? 'border-orange-400' : 'border-gray-100'}`}>
          <div className="p-5">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                {!paymentMethod && (
                  <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
                    <AlertCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                <h2 className="text-lg font-bold text-gray-800 text-left">Forma de pagamento</h2>
              </div>
              <div className="flex items-center gap-2">
                {!paymentMethod && (
                  <span className="bg-orange-100 text-orange-600 text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                    Obrigatório
                  </span>
                )}
                <button className="text-[#FE5B95] font-bold text-sm">+ Adicionar</button>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { id: 'money', label: 'Dinheiro (Pagamento na entrega)', icon: CreditCard },
                { id: 'card', label: 'Cartão (Maquininha na entrega)', icon: CreditCard },
                { id: 'pix', label: 'PIX (Na entrega)', icon: CreditCard },
              ].map((method) => (
                <button
                  key={method.id}
                  onClick={() => setPaymentMethod(method.id)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-[#FE5B95] bg-pink-50/30' : 'border-gray-50 hover:bg-gray-50'}`}
                >
                  <div className="flex items-center gap-3">
                    <method.icon className={`w-5 h-5 ${paymentMethod === method.id ? 'text-[#FE5B95]' : 'text-gray-400'}`} />
                    <span className={`text-sm font-medium ${paymentMethod === method.id ? 'text-gray-900 font-bold' : 'text-gray-600'}`}>
                      {method.label}
                    </span>
                  </div>
                  {paymentMethod === method.id && (
                    <div className="w-5 h-5 bg-[#FE5B95] rounded-full flex items-center justify-center shadow-lg shadow-pink-100">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Summary Card (Details) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <button 
            onClick={() => setIsOrderDetailsOpen(!isOrderDetailsOpen)}
            className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <h3 className="text-lg font-bold text-gray-800 text-left">Resumo do pedido</h3>
            {isOrderDetailsOpen ? <ChevronUp className="w-6 h-6 text-gray-400" /> : <ChevronDown className="w-6 h-6 text-gray-400" />}
          </button>
          
          {isOrderDetailsOpen && (
            <div className="px-5 pb-5 space-y-4 animate-slide-up">
              <div className="space-y-3 pt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Custo dos produtos</span>
                  <span className="text-gray-800 font-medium">
                    {cartItems.reduce((acc, i) => acc + (i.price * i.quantity), 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{deliveryMethod === 'entrega' ? 'Entrega' : 'Taxa de Retirada'}</span>
                  <div className="flex items-center gap-2">
                    {deliveryMethod === 'entrega' ? (
                      <>
                        <span className="text-gray-300 line-through text-xs">R$ 5,00</span>
                        <span className="text-blue-500 font-bold">R$ 0,00</span>
                      </>
                    ) : (
                      <span className="text-blue-500 font-bold">R$ 0,00</span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                  <span className="text-base font-bold text-gray-800">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:p-6 z-[60]">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col text-left">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total</span>
            <span className="text-2xl font-display font-bold text-[#FE5B95]">
              {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <button 
            onClick={handleFinishOrder}
            disabled={!paymentMethod || !isStep1Complete}
            className={`flex-1 h-14 rounded-2xl font-bold text-lg shadow-lg transition-all ${paymentMethod && isStep1Complete ? 'bg-[#FE5B95] text-white shadow-pink-100 hover:scale-[1.02] active:scale-[0.98]' : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'}`}
          >
            Fazer um pedido
          </button>
        </div>
      </footer>
    </div>
  );
}