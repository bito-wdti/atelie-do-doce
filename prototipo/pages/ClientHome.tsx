import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  ArrowRight,
  Cake,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Star,
  Plus,
  Minus,
  Eye
} from "lucide-react";
import { supabase } from '../supabaseClient';
import { Link } from "react-router-dom";
import { Toaster, toast } from 'react-hot-toast';

export default function ClientHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching products:', error);
    } else {
      setProducts(data || []);
    }
  };

  const [categories, setCategories] = useState<any[]>([{ id: "Todos", name: "Todas as Categorias", slug: "Todos" }]);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });

    if (!error && data) {
      setCategories([{ id: "Todos", name: "Todas as Categorias", slug: "Todos" }, ...data]);
    } else {
       // Fallback defaults
       setCategories([
         { id: "Todos", name: "Todas as Categorias", slug: "Todos" },
         { id: "Normais", name: "Bolos Tradicionais", slug: "Normais" },
         { id: "Vulcões", name: "Bolos Vulcões", slug: "Vulcões" },
         { id: "Bolos", name: "Bolos Diversos", slug: "Bolos" },
         { id: "Tortas", name: "Tortas", slug: "Tortas" },
         { id: "Doces", name: "Doces", slug: "Doces" },
         { id: "Bebidas", name: "Bebidas", slug: "Bebidas" }
       ]);
    }
  };

  const getCategoryIcon = (slug: string) => {
    if (slug === "Todos") return Heart;
    if (slug === "Doces" || slug === "Doces Gourmet") return Heart;
    if (slug === "Bebidas") return Phone;
    return Cake;
  };

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [isStaticDropdownOpen, setIsStaticDropdownOpen] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      (selectedCategory === "Todos" || p.category === selectedCategory || window.innerWidth < 768) &&
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const currentCategoryName = categories.find(c => (c.slug === selectedCategory || c.id === selectedCategory))?.name || "Todas as Categorias";

  useEffect(() => {
    fetchProducts();
    fetchCategories();

    // Handle hash scrolling on initial load
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const id = hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 500); // Wait for content to load
    }
  }, []);
  const [bgPosition, setBgPosition] = useState({ x: 50, y: 85 });
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        setIsSticky(heroBottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <section
        id="inicio"
        ref={heroRef}
        className="relative md:h-[320px] min-h-[250px] flex items-center max-w-7xl mx-4 md:mx-auto mt-6 rounded-[32px] overflow-hidden border border-pink-50 bg-white"
      >
        {/* Background Image with Opacity */}
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat transition-opacity duration-700 opacity-65 md:opacity-100"
          style={{
            backgroundImage: "url('/propo.png')",
            backgroundPosition: `${bgPosition.x}% ${bgPosition.y}%`,
          }}
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent" />

        <div className="w-full px-6 md:px-12 relative z-10 flex justify-start items-center overflow-hidden">
          <div className="space-y-2 z-10 text-left pt-2 md:pt-4 animate-fade-in max-w-[90%] md:max-w-2xl md:ml-12 -mt-2 md:mt-0">
            <span className="text-[#975233] font-bold tracking-[0.2em] uppercase text-[9px] md:text-xs">
              CONFEITARIA ARTESANAL
            </span>
            <h1 className="text-2xl md:text-5xl font-display font-bold leading-tight text-gray-900 md:max-w-full">
              <span className="text-[#FE5B95]">Karolayne</span>{" "}
              <span className="text-[#975233]">Doces</span>
            </h1>
            <p className="text-gray-500 md:max-w-md text-sm md:text-base leading-relaxed">
              Os bolos mais deliciosos da região para reuniões, aniversários e
              casamentos. Nossas delícias são preparadas diariamente com os
              melhores ingredientes.
            </p>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-start gap-4 pt-2 md:mt-0 relative -top-2 md:top-0">
              <div className="bg-[#FE5B95] text-white hover:opacity-90 px-4 py-2 md:px-6 md:py-2 rounded-full font-bold shadow-md transition-all w-auto inline-flex items-center justify-center gap-2 group text-xs md:text-sm cursor-default">
                Desde 2023 
                <div className="bg-white/20 p-1 rounded-full group-hover:translate-x-1 transition-transform">
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 640 640">
                    <path d="M360 128L116.3 320L544 320C544 192 432 128 360 128zM64 336L64 320.5L76.2 310.9L340.2 102.9L348.9 96L360 96C404.3 96 457.6 115.2 499.9 151.8C543.1 189.2 576 245.7 576 320L576 544L64 544L64 336zM96 416L544 416L544 352L96 352L96 416zM96 448L96 512L544 512L544 448L96 448z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Static Search & Category Container */}
      <div id="cardapio" className="max-w-7xl mx-auto px-4 md:px-12 mt-4 md:mt-12 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#FE5B95] w-5 h-5 transition-transform group-focus-within:scale-110" />
          <input
            type="text"
            placeholder="Explorar cardápio..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-pink-100 rounded-[1.5rem] text-base focus:outline-none focus:ring-2 focus:ring-[#FE5B95]/10 focus:border-[#FE5B95] text-gray-700 transition-all shadow-sm hover:shadow-md placeholder:text-gray-400 font-medium"
          />
        </div>

        {/* Desktop Static Category Dropdown */}
        <div className="hidden md:block relative w-72">
          <button
            onClick={() => setIsStaticDropdownOpen(!isStaticDropdownOpen)}
            className="w-full h-full px-5 py-4 bg-white border border-pink-100 rounded-[1.5rem] text-sm text-left text-gray-700 flex items-center justify-between group hover:bg-pink-50/50 transition-all focus:ring-2 focus:ring-[#FE5B95]/10 focus:border-[#FE5B95] outline-none shadow-sm hover:shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-pink-50 text-[#FE5B95]">
                <Cake className="w-4 h-4" />
              </div>
              <span className="font-semibold">{currentCategoryName}</span>
            </div>
            {isStaticDropdownOpen ? (
              <ChevronUp className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            )}
          </button>

          {isStaticDropdownOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-pink-100 overflow-hidden z-50 animate-fade-in py-2">
              {categories.map((cat) => {
                const Icon = getCategoryIcon(cat.slug);
                return (
                  <button
                    key={`static-${cat.id}`}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      setIsStaticDropdownOpen(false);
                      // Scroll to top of list if selecting a category
                      if (cat.slug !== "Todos") {
                        const element = document.getElementById(`category-${cat.slug}`);
                        if (element) {
                          window.scrollTo({ top: element.offsetTop - 100, behavior: 'smooth' });
                        }
                      }
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-pink-50 ${
                      selectedCategory === cat.slug ? "text-[#FE5B95] bg-pink-50/30" : "text-gray-600"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${selectedCategory === cat.slug ? "text-[#FE5B95]" : "text-gray-400"}`} />
                    <span className="text-sm font-medium">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div
        className={`fixed top-14 md:top-16 left-0 w-full bg-white/95 backdrop-blur-md z-40 transition-all duration-300 border-b border-pink-100 shadow-sm ${
          isSticky
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-5 flex flex-col md:flex-row items-center gap-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FE5B95] w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar itens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-pink-50/50 border border-transparent rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#FE5B95] text-gray-700 transition-all placeholder:text-gray-400"
            />
          </div>

          <div className="hidden md:block relative flex-1 w-full">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full pl-4 pr-10 py-3 bg-pink-50/50 border border-transparent rounded-xl text-sm text-left text-gray-700 flex items-center justify-between group hover:bg-pink-100/50 transition-all focus:ring-1 focus:ring-[#FE5B95] outline-none"
            >
              <div className="flex items-center gap-2">
                <div
                  className={`p-1.5 rounded-lg bg-white text-[#FE5B95] transition-transform ${isDropdownOpen ? "rotate-12" : ""}`}
                >
                  <Cake className="w-4 h-4" />
                </div>
                <span className="font-medium text-gray-700">
                  {currentCategoryName}
                </span>
              </div>
              {isDropdownOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {/* Custom Dropdown Menu (Desktop) */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-pink-100 overflow-hidden z-50 animate-fade-in py-2">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.slug);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors hover:bg-pink-50 ${
                        selectedCategory === cat.slug
                          ? "text-[#FE5B95] bg-pink-50/30"
                          : "text-gray-600"
                      }`}
                    >
                      <Icon
                        className={`w-4 h-4 ${selectedCategory === cat.slug ? "text-[#FE5B95]" : "text-gray-400"}`}
                      />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Horizontal Category Scroll */}
          <div className="md:hidden w-full overflow-x-auto no-scrollbar flex items-center bg-white border-t border-pink-50">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setSelectedCategory(cat.slug);
                  const element = document.getElementById(`category-${cat.slug}`);
                  if (element) {
                    const offset = 140; // Adjust for sticky header
                    const bodyRect = document.body.getBoundingClientRect().top;
                    const elementRect = element.getBoundingClientRect().top;
                    const elementPosition = elementRect - bodyRect;
                    const offsetPosition = elementPosition - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: 'smooth'
                    });
                  }
                }}
                className={`flex-shrink-0 whitespace-nowrap px-6 py-4 text-xs font-bold transition-all border-b-2 ${
                  selectedCategory === cat.slug
                    ? "text-[#FE5B95] border-[#FE5B95]"
                    : "text-gray-400 border-transparent"
                }`}
              >
                {cat.slug.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <section className="pt-2 pb-12 px-4 md:px-12 bg-white max-w-7xl mx-auto mt-2 mb-6">
        <div className="mb-0"></div>

        <div className="space-y-8 md:space-y-10">
          {categories
            .filter((cat) => cat.slug !== "Todos")
            .map((cat) => {
              const categoryProducts = filteredProducts.filter(
                (p) => p.category === cat.slug,
              );
              if (categoryProducts.length === 0) return null;

              return (
                <div key={cat.id} id={`category-${cat.slug}`} className="space-y-3 md:space-y-6 scroll-mt-32">
                  {(selectedCategory === "Todos" ||
                    selectedCategory === cat.slug || window.innerWidth < 768) && (
                    <h3 className="text-lg font-bold text-gray-700 px-2 border-l-4 border-[#FE5B95] ml-2">
                       {cat.name}
                    </h3>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
                    {categoryProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedProduct(p);
                          setQuantity(1);
                          setObservation("");
                        }}
                        className="group bg-white rounded-2xl p-3 md:p-4 flex gap-4 md:gap-5 transition-all duration-300 border border-gray-100 hover:border-[#FE5B95]/30 hover:shadow-md cursor-pointer relative min-h-[120px] md:min-h-[140px]"
                      >
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h3 className="font-semibold text-lg md:text-xl text-gray-800 mb-1 group-hover:text-[#FE5B95] transition-colors leading-tight">
                              {p.name}
                            </h3>
                            <p className="text-[12px] md:text-sm text-gray-400 line-clamp-2 md:line-clamp-3 leading-relaxed">
                              {p.detail || "Confeitaria artesanal de alta qualidade, preparada com ingredientes selecionados."}
                            </p>
                          </div>
                          <div className="mt-1 md:mt-2 flex items-center justify-between">
                            <span className="text-base md:text-xl font-bold text-gray-700">
                              {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>

                        {/* Image Container on the right */}
                        <div className="w-20 h-20 md:w-28 md:h-28 rounded-xl overflow-hidden relative flex-shrink-0 bg-gray-50 border border-gray-50">
                          <img
                            alt={p.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={p.img}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      </section>

      {/* Product Detail Modal */}
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
                    const cartItem = {
                      id: selectedProduct.id,
                      name: selectedProduct.name,
                      price: selectedProduct.price,
                      img: selectedProduct.img,
                      detail: selectedProduct.detail,
                      quantity: quantity,
                      observation: observation
                    };
                    
                    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
                    
                    if (existingItemIndex > -1) {
                      existingCart[existingItemIndex].quantity += quantity;
                    } else {
                      existingCart.push(cartItem);
                    }
                    
                    localStorage.setItem('cart', JSON.stringify(existingCart));
                    window.dispatchEvent(new Event('cart-updated'));
                    toast.success('Adicionado ao carrinho!');
                    setSelectedProduct(null);
                    setQuantity(1);
                    setObservation("");
                  }}
                  className="flex-1 bg-[#FE5B95] text-white h-12 md:h-14 rounded-2xl font-semibold flex items-center justify-between px-6 shadow-lg shadow-pink-200 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  <span className="text-sm md:text-lg font-bold tracking-tight">Adicionar</span>
                  <span className="text-sm md:text-base font-bold ml-4">
                    {(selectedProduct.price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
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
    </>
  );
}
