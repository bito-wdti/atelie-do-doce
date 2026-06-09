import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Lock, ArrowRight, ShoppingBag, Plus, Minus, X, Phone, Heart, Eye, Edit, Package } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';

export default function ClientCart() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [progressWidth, setProgressWidth] = useState('0%');

  useEffect(() => {
    // Inicia a animação de preenchimento
    const timer = setTimeout(() => setProgressWidth('50%'), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);
  }, []);

  const updateQuantity = (id: string, delta: number) => {
    const newCart = cartItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const removeItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart);
    localStorage.setItem('cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cart-updated'));
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem('cart', '[]');
    window.dispatchEvent(new Event('cart-updated'));
    toast.success('Carrinho limpo!');
    setShowClearConfirm(false);
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const total = subtotal; // For now, simple total

  if (cartItems.length === 0) {
    return (
      <div className="bg-[#F9FAFB] min-h-screen flex items-center justify-center p-4">
        <main className="max-w-xl w-full mx-auto px-6 py-16 text-center bg-white rounded-xl shadow-none border border-gray-100 animate-fade-in">
          <div className="flex flex-col items-center gap-6">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-primary">
              <ShoppingBag className="w-12 h-12" />
            </div>
            <h1 className="text-2xl font-display font-semibold text-gray-900">Seu carrinho está vazio</h1>
            <p className="text-gray-500 max-w-sm">Parece que você ainda não adicionou nenhuma delícia ao seu carrinho.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full mt-4">
              <Link
                to="/"
                className="w-full sm:w-auto bg-primary text-white px-10 py-4 rounded-xl font-bold shadow-none transition-all hover:scale-105 active:scale-95"
              >
                Ver Cardápio
              </Link>

              {localStorage.getItem('lastOrderId') && (
                <Link
                  to={`/tracking/${localStorage.getItem('lastOrderId')}`}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-gray-50 border border-gray-100 rounded-xl text-gray-600 font-bold hover:bg-gray-100 transition-all shadow-none"
                >
                  <Package className="w-5 h-5" />
                  Acompanhar Pedido
                </Link>
              )}
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen">
      <main className="max-w-7xl mx-auto px-4 md:px-16 pt-6 pb-72 md:pb-12 md:py-12">
        <div className="flex items-center justify-between mb-8 md:mb-10">
          <Link to="/" className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all border border-gray-100 group shadow-none">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 tracking-tight">Carrinho</h1>

          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 hover:bg-red-500 hover:text-white transition-all border border-gray-100 active:scale-95 shadow-none"
            title="Limpar Carrinho"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>




        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 md:gap-12">
          {/* Cart Items List - Top on Mobile, Left on Desktop */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl p-3 md:p-4 flex items-start gap-4 md:gap-6 shadow-none border border-gray-100 hover:border-indigo-50 transition-all h-28 md:h-[128px] overflow-hidden">
                <div
                  className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50 rounded-xl overflow-hidden shrink-0 relative group/img cursor-pointer shadow-none"
                  onClick={() => {
                    setSelectedProduct(item);
                    setQuantity(item.quantity);
                    setObservation(item.observation || "");
                  }}
                >
                  <img
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform group-hover/img:scale-110"
                    src={item.img}
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col h-full relative">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-1 leading-tight">{item.name}</h3>
                    {item.category && (
                      <p className="text-sm md:text-base text-gray-400 font-medium line-clamp-1">
                        {item.category}
                      </p>
                    )}
                    {item.observation && (
                      <p className="text-xs text-[#974e60] font-medium italic truncate">
                        Obs: {item.observation}
                      </p>
                    )}
                  </div>

                  <div className="mt-auto pb-0.5 flex items-center justify-between">
                    <p className="text-base md:text-lg font-semibold text-gray-900 leading-none">
                      {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            updateQuantity(item.id, -1);
                          } else {
                            removeItem(item.id);
                          }
                        }}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-primary text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-none"
                      >
                        <Minus className="w-4 h-4 md:w-5 md:h-5 stroke-3" />
                      </button>

                      <span className="min-w-[1.2rem] text-center text-base md:text-lg font-bold text-gray-900">{item.quantity}</span>

                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-primary text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-none"
                      >
                        <Plus className="w-4 h-4 md:w-5 md:h-5 stroke-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add more items button */}
            <div className="flex justify-center pt-4">
              <Link
                to="/"
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-gray-900 font-medium hover:bg-gray-50 transition-all group"
              >
                <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                <span>Adicionar mais itens</span>
              </Link>
            </div>
          </div>

          {/* Order Summary Card (Mobile Fixed & Desktop Sticky) */}
          <div className="lg:col-span-1 fixed bottom-0 left-0 w-full z-50 p-4 md:p-0 md:static md:w-auto mt-2 md:mt-0">
            <div className="sticky top-28 w-full max-w-lg mx-auto lg:mx-0 space-y-4">
              <div className="bg-white rounded-xl p-4 md:p-5 shadow-sm border border-gray-100">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-500">Subtotal</span>
                    <span className="text-base font-semibold text-gray-800">{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                  </div>
                  
                  <div className="h-px bg-gray-100/80 w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-500">Taxa de entrega</span>
                    <span className="text-base font-semibold text-gray-800">A calcular</span>
                  </div>
                  
                  <div className="h-px bg-gray-100/80 w-full" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-base md:text-lg font-bold text-gray-900 tracking-tight">Total</span>
                    <span className="text-xl md:text-2xl font-display font-semibold text-primary">
                      {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  const isLoggedIn = !!localStorage.getItem('userToken');
                  if (isLoggedIn) {
                    navigate('/checkout');
                  } else {
                    navigate('/login', { state: { from: '/checkout' } });
                  }
                }}
                className="w-full bg-primary hover:brightness-110 active:scale-95 transition-all text-white py-4 rounded-xl font-medium shadow-none text-base md:text-lg flex items-center justify-center gap-2"
              >
                <span>Próximo</span>
                <span className="w-1 h-1 bg-white/50 rounded-full mx-1" />
                <span>{total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Detail Modal (for Editing) */}
        {
          selectedProduct && (
            <div className="fixed inset-0 z-100 flex items-center justify-center p-4 md:p-6">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in"
                onClick={() => setSelectedProduct(null)}
              />

              {/* Modal Content */}
              <div className={`relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-5xl bg-white md:rounded-xl shadow-none flex flex-col md:flex-row overflow-hidden animate-slide-up transition-all duration-500 ${showZoom ? 'blur-md scale-[0.98] opacity-60' : ''}`}>

                {/* Close Button Mobile */}
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 z-50 md:hidden bg-white/20 backdrop-blur-md p-1.5 rounded-full text-white border border-white/20 shadow-lg"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Left Column: Image */}
                <div
                  className="w-full md:w-[60%] h-64 md:h-auto relative overflow-hidden cursor-zoom-in group/img"
                  onClick={() => setShowZoom(true)}
                >
                  <img
                    src={selectedProduct.img}
                    alt={selectedProduct.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  />
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none md:hidden bg-black/5 opacity-60">
                    <div className="bg-white/10 backdrop-blur-sm p-2 rounded-full border border-white/20">
                      <Eye className="w-5 h-5 text-white/70" />
                    </div>
                  </div>
                </div>

                {/* Right Column: Details */}
                <div className="flex-1 flex flex-col h-full bg-white relative">
                  {/* Close Button Desktop */}
                  <button
                    onClick={() => setSelectedProduct(null)}
                    className="hidden md:flex absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                    <div className="space-y-2">
                      <h2 className="text-xl md:text-2xl font-bold text-gray-800 tracking-tight leading-tight">
                        {selectedProduct.name}
                      </h2>
                    </div>

                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                      {selectedProduct.detail || "Confeitaria artesanal de alta qualidade, preparada com ingredientes selecionados."}
                    </p>

                    <div className="text-3xl md:text-4xl font-bold text-primary">
                      {(selectedProduct.price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>

                    {/* Reference Box */}
                    <div className="bg-indigo-50/50 rounded-xl p-4 flex items-center gap-4 border border-indigo-100/50">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-primary  shadow-none shrink-0">
                        <Phone className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-gray-800 tracking-tight">Ateliê do Doce</h4>
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Tempo estimado   • 15-20 min</p>
                      </div>
                    </div>

                    {/* Observation */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-1">
                        <label className="text-base font-bold text-gray-800 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-primary" />
                          Observação para o pedido?
                        </label>
                        <span className="text-sm text-gray-400 font-bold">{observation.length} / 140</span>
                      </div>
                      <textarea
                        value={observation}
                        onChange={(e) => setObservation(e.target.value.slice(0, 140))}
                        placeholder="Ex: sem açúcar por cima..."
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all min-h-[100px] resize-none  shadow-none"
                      />
                    </div>
                  </div>

                  {/* Sticky Footer */}
                  <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex items-center gap-4">
                    <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-100">
                      <button
                        onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                        className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-none"
                      >
                        <Minus className="w-5 h-5 stroke-3" />
                      </button>
                      <span className="w-8 text-center font-bold text-gray-700">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-105 transition-all shadow-none"
                      >
                        <Plus className="w-5 h-5 stroke-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        const newCart = cartItems.map((item) => {
                          if (item.id === selectedProduct.id) {
                            return {
                              ...item,
                              quantity: quantity,
                              observation: observation
                            };
                          }
                          return item;
                        });

                        setCartItems(newCart);
                        localStorage.setItem('cart', JSON.stringify(newCart));
                        window.dispatchEvent(new Event('cart-updated'));
                        toast.success('Pedido atualizado!');
                        setSelectedProduct(null);
                      }}
                      className="flex-1 bg-primary text-white h-12 md:h-14 rounded-xl font-bold flex items-center justify-center px-6 shadow-none hover:scale-[1.02] active:scale-[0.98] transition-all text-base md:text-lg"
                    >
                      Atualizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        }
        {/* Fullscreen Image Zoom Overlay */}
        {
          showZoom && selectedProduct && (
            <div className="fixed inset-0 z-110 flex items-center justify-center p-4 animate-fade-in">
              {/* Backdrop with Blur */}
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-3xl"
                style={{ WebkitBackdropFilter: 'blur(30px)' }}
                onClick={() => setShowZoom(false)}
              />

              <img
                src={selectedProduct.img}
                alt={selectedProduct.name}
                onClick={() => setShowZoom(false)}
                className="relative z-115 max-w-full max-h-full object-contain rounded-xl shadow-none animate-zoom-in cursor-zoom-out"
              />
            </div>
          )
        }
        {/* Custom Clear Cart Confirmation Modal */}
        {
          showClearConfirm && (
            <div className="fixed inset-0 z-120 flex items-center justify-center p-4 px-6">
              <div
                className="absolute inset-0 bg-black/40 backdrop-blur-md"
                onClick={() => setShowClearConfirm(false)}
              />
              <div className="relative bg-white rounded-xl p-8 max-w-sm w-full text-center shadow-none animate-scale-up">
                <h3 className="text-xl font-semibold font-display text-gray-900 mb-2">Limpar Carrinho?</h3>
                <p className="text-gray-500 mb-8 leading-relaxed font-medium">
                  Você tem certeza que deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="py-3 px-6 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={clearCart}
                    className="py-3 px-6 rounded-xl bg-primary text-white font-semibold hover:brightness-110 transition-all shadow-none"
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          )
        }
      </main >
    </div >
  );
}
