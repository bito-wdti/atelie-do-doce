import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trash2, Lock, ArrowRight, ShoppingBag, Plus, Minus, X, Phone, Heart, Eye, Edit } from 'lucide-react';
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
      <main className="max-w-7xl mx-auto px-4 md:px-16 py-24 text-center">
        <div className="flex flex-col items-center gap-6">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center text-[#FE5B95]">
            <ShoppingBag className="w-12 h-12" />
          </div>
          <h1 className="text-2xl font-display font-semibold text-gray-900">Seu carrinho está vazio</h1>
          <p className="text-gray-500 max-w-sm">Parece que você ainda não adicionou nenhuma delícia ao seu carrinho.</p>
          <Link 
            to="/" 
            className="bg-[#FE5B95] text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-pink-200 transition-all hover:scale-105"
          >
            Ver Cardápio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-16 pt-4 pb-32 md:py-12">
      <div className="flex items-center gap-4 mb-4 md:mb-8">
        <Link to="/" className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[#FE5B95] hover:bg-[#FE5B95] hover:text-white transition-all shadow-sm group">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </Link>
      </div>
      
      <div className="flex items-center justify-between gap-4 mb-6 md:mb-10">
        <h1 className="text-xl md:text-3xl font-display font-semibold text-gray-900">Carrinho de Compras</h1>
        <button 
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-xs font-bold"
        >
          <Trash2 className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>
      
      <div className="flex flex-col lg:grid lg:grid-cols-3 gap-8 md:gap-12">
        {/* Cart Items List - Top on Mobile, Left on Desktop */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id} className="bg-white rounded-[1.5rem] p-3 flex items-center gap-3 md:gap-4 shadow-sm border border-gray-100 hover:border-pink-50 transition-all">
              <div 
                className="w-16 h-16 md:w-20 md:h-20 bg-pink-50 rounded-xl overflow-hidden flex-shrink-0 relative group/img cursor-pointer"
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
                <div className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm w-6 h-6 rounded-full flex items-center justify-center shadow-sm border border-pink-100 z-10 transition-transform active:scale-95">
                  <Edit className="w-3.5 h-3.5 text-[#FE5B95]" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm md:text-lg font-bold text-gray-900 truncate leading-tight mb-0.5">{item.name}</h3>
                {item.observation && (
                  <p className="text-[10px] md:text-xs text-[#974e60] font-medium italic truncate mb-1">
                    Obs: {item.observation}
                  </p>
                )}
                <p className="text-[#FE5B95] font-bold text-sm md:text-lg">
                  {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
                <div className="flex items-center bg-pink-50/50 rounded-xl border border-pink-100 p-0.5">
                  <button 
                    onClick={() => {
                        if (item.quantity > 1) {
                            updateQuantity(item.id, -1);
                        } else {
                            removeItem(item.id);
                        }
                    }}
                    className="w-8 h-8 flex items-center justify-center text-[#FE5B95] font-bold hover:bg-white rounded-lg transition-colors"
                  >
                    {item.quantity > 1 ? (
                        "-"
                    ) : (
                        <Trash2 className="w-4 h-4 text-red-500" />
                    )}
                  </button>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (!isNaN(val) && val >= 1) {
                        const newCart = cartItems.map(cartItem => {
                          if (cartItem.id === item.id) {
                            return { ...cartItem, quantity: val };
                          }
                          return cartItem;
                        });
                        setCartItems(newCart);
                        localStorage.setItem('cart', JSON.stringify(newCart));
                        window.dispatchEvent(new Event('cart-updated'));
                      }
                    }}
                    className="w-8 text-center text-xs font-bold text-gray-700 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center text-[#FE5B95] font-bold hover:bg-white rounded-lg transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Add more items button */}
          <div className="flex justify-center pt-4">
            <Link 
              to="/" 
              className="flex items-center gap-2 px-6 py-3 rounded-2xl border-2 border-dashed border-pink-100 text-[#FE5B95] font-bold hover:bg-pink-50 hover:border-pink-200 transition-all group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              <span>Adicionar mais itens</span>
            </Link>
          </div>
        </div>

        {/* Mobile Fixed Bottom Bar */}
        <div className="md:hidden fixed bottom-0 left-0 w-full p-4 bg-white border-t border-pink-100 shadow-[0_-10px_25px_rgba(0,0,0,0.05)] z-50">
          <div className="flex items-center justify-between">
            <div className="text-left">
              <h3 className="text-xs font-bold text-gray-500 mb-0">Total do pedido</h3>
              <span className="text-xl font-display font-normal text-[#FE5B95]">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            <button 
              onClick={() => navigate('/checkout')} 
              className="w-auto px-8 bg-[#FE5B95] text-white py-3 rounded-[1.2rem] font-bold shadow-lg shadow-pink-200 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Próximo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Desktop Summary Card */}
        <div className="hidden md:block lg:col-span-1">
          <div className="bg-white rounded-[1.5rem] p-5 shadow-xl shadow-pink-100/20 border border-pink-50 sticky top-28">
            <h3 className="text-lg font-display font-semibold text-gray-900 mb-4 lowercase first-letter:uppercase">Resumo do pedido</h3>
            
            <div className="pt-4 border-t border-gray-100 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-base font-semibold text-gray-600">Preço Total</span>
                <span className="text-xl md:text-2xl font-display font-normal text-[#FE5B95]">
                  {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>

            <button 
              onClick={() => navigate('/checkout')} 
              className="w-full bg-[#FE5B95] hover:bg-[#ff4081] text-white py-3 rounded-[1.5rem] font-bold shadow-lg shadow-pink-200 transition-all flex items-center justify-center gap-3 group"
            >
              Próximo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Product Detail Modal (for Editing) */}
      {selectedProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-4 overflow-hidden">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md animate-fade-in" 
            onClick={() => setSelectedProduct(null)}
          />
          
          {/* Modal Content */}
          <div className={`relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-5xl bg-white md:rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-slide-up transition-all duration-500 ${showZoom ? 'blur-md scale-[0.98] opacity-60' : ''}`}>
            
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
                  <h2 className="text-xl md:text-2xl font-semibold text-gray-800 tracking-tight leading-tight">
                    {selectedProduct.name}
                  </h2>
                </div>

                <p className="text-gray-500 text-sm md:text-base leading-relaxed">
                  {selectedProduct.detail || "Confeitaria artesanal de alta qualidade, preparada com ingredientes selecionados."}
                </p>

                <div className="text-3xl md:text-4xl font-bold text-[#FE5B95]">
                  {(selectedProduct.price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>

                {/* Reference Box */}
                <div className="bg-pink-50/50 rounded-2xl p-4 flex items-center gap-4 border border-pink-100/50">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-[#FE5B95] shadow-sm flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-gray-800 tracking-tight">Karolayne Doces</h4>
                    <p className="text-xs md:text-sm text-gray-500 font-medium">Tempo estimado   • 15-20 min</p>
                  </div>
                </div>

                {/* Observation */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-pink-400" />
                      Observação para o pedido?
                    </label>
                    <span className="text-xs text-gray-400 font-mono font-bold">{observation.length} / 140</span>
                  </div>
                  <textarea 
                    value={observation}
                    onChange={(e) => setObservation(e.target.value.slice(0, 140))}
                    placeholder="Ex: sem açúcar por cima..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#FE5B95]/20 focus:bg-white transition-all min-h-[80px] resize-none"
                  />
                </div>
              </div>

              {/* Sticky Footer */}
              <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex items-center gap-4">
                <div className="flex items-center bg-gray-50 rounded-2xl p-1.5 border border-gray-100">
                  <button 
                    onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                    className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center text-gray-500 transition-all font-bold"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-gray-700">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-xl hover:bg-white flex items-center justify-center text-gray-500 transition-all font-bold"
                  >
                    <Plus className="w-4 h-4" />
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
                  className="flex-1 bg-[#FE5B95] text-white h-12 md:h-14 rounded-2xl font-bold flex items-center justify-center px-6 shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all text-base md:text-lg"
                >
                  Atualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Fullscreen Image Zoom Overlay */}
      {showZoom && selectedProduct && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-fade-in">
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
            className="relative z-[115] max-w-full max-h-full object-contain rounded-2xl shadow-2xl animate-zoom-in cursor-zoom-out"
          />
        </div>
      )}
      {/* Custom Clear Cart Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 animate-fade-in px-6">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-md" 
            onClick={() => setShowClearConfirm(false)}
          />
          <div className="relative bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl animate-scale-up">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Limpar Carrinho?</h3>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Você tem certeza que deseja remover todos os itens do seu carrinho? Esta ação não pode ser desfeita.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setShowClearConfirm(false)}
                className="py-3 px-6 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition-all"
              >
                Cancelar
              </button>
              <button 
                onClick={clearCart}
                className="py-3 px-6 rounded-2xl bg-red-500 text-white font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-200"
              >
                Limpar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}