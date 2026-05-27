import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  ArrowRight,
  Cake,
  Search,
  Package,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Star,
  Plus,
  Minus,
  Eye,
  Settings,
  ShoppingBag,
  LayoutGrid
} from "lucide-react";
import { productsApi } from '../services/api';
import { Link } from "react-router-dom";
import { Toaster, toast } from 'react-hot-toast';

export default function ClientHome() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSticky, setIsSticky] = useState(false);
  const menuRef = useRef<HTMLHeadingElement>(null);

  // Scroll to menu when search starts (only if we are above it)
  useEffect(() => {
    if (searchQuery.length > 0 && isSticky && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      if (rect.top > 100) {
        window.scrollTo({ top: window.scrollY + rect.top - 80, behavior: 'smooth' });
      }
    }
  }, [searchQuery, isSticky]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      const data = await productsApi.list();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const [categories, setCategories] = useState<any[]>([{ id: "Todos", name: "Todas as Categorias", slug: "Todos" }]);

  const fetchCategories = async () => {
    try {
      const data = await productsApi.categories();
      setCategories([{ id: "Todos", name: "Todas as Categorias", slug: "Todos" }, ...data]);
    } catch {
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
    if (slug === "Todos") return LayoutGrid;
    if (slug === "Doces" || slug === "Doces Gourmet") return ShoppingBag;
    if (slug === "Bebidas") return Phone;
    return Cake;
  };

  const getCategoryImage = (slug: string) => {
    const images: any = {
      "Todos": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop",
      "Normais": "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=100&h=100&fit=crop",
      "Vulcões": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=100&h=100&fit=crop",
      "Bolos": "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=100&h=100&fit=crop",
      "Tortas": "https://images.unsplash.com/photo-1519915028121-7d3463d20b13?w=100&h=100&fit=crop",
      "Doces": "https://images.unsplash.com/photo-1582231221568-71e860953a99?w=100&h=100&fit=crop",
      "Bebidas": "https://images.unsplash.com/photo-1544145945-f904253d0c71?w=100&h=100&fit=crop"
    };
    return images[slug] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100&h=100&fit=crop";
  };

  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");
  const [showZoom, setShowZoom] = useState(false);
  const [isStaticDropdownOpen, setIsStaticDropdownOpen] = useState(false);
  const [isStickyDropdownOpen, setIsStickyDropdownOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const filteredProducts = products.filter((p) => {
    const term = searchQuery.toLowerCase().trim();
    const category = categories.find(c => String(c.slug).toLowerCase() === String(p.category).toLowerCase() || String(c.id) === String(p.category));

    // Se houver pesquisa, ignora o filtro de categoria selecionada para busca global
    // No mobile, sempre mostramos tudo agrupado por padrão
    const matchesCategory = searchQuery !== "" || selectedCategory === "Todos" || p.category === selectedCategory || window.innerWidth < 768;

    if (!matchesCategory) return false;

    // Se não houver termo de busca, todos os que passaram no filtro de categoria são válidos
    if (term === "") return true;

    // Busca multi-termo (opcional, mas bom)
    const searchTerms = term.split(/\s+/);
    return searchTerms.every(t =>
      p.name.toLowerCase().includes(t) ||
      category?.name?.toLowerCase().includes(t) ||
      String(p.category).toLowerCase().includes(t) ||
      (p.detail && p.detail.toLowerCase().includes(t))
    );
  });

  const currentCategoryName = categories.find(c => (c.slug === selectedCategory || c.id === selectedCategory))?.name || "Todas as Categorias";

  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  const syncQuantitiesWithCart = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const quantities: Record<string, number> = {};
    cart.forEach((item: any) => {
      quantities[item.id] = item.quantity;
    });
    setItemQuantities(quantities);
  };

  const updateCartQuantity = (product: any, delta: number) => {
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existingItemIndex = existingCart.findIndex((item: any) => item.id === product.id);

    if (existingItemIndex > -1) {
      const newQty = existingCart[existingItemIndex].quantity + delta;
      if (newQty <= 0) {
        existingCart.splice(existingItemIndex, 1);
        toast.error(`${product.name} removido`);
      } else {
        existingCart[existingItemIndex].quantity = newQty;
      }
    } else if (delta > 0) {
      const categoryName = categories.find(c => String(c.slug).toLowerCase() === String(product.category).toLowerCase() || String(c.id) === String(product.category))?.name;
      existingCart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.img,
        detail: product.detail,
        category: categoryName,
        quantity: 1,
        observation: ""
      });
      toast.success(`${product.name} adicionado!`);
    }

    localStorage.setItem('cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cart-updated'));
    syncQuantitiesWithCart();
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsLoading(true);
      await Promise.all([fetchProducts(), fetchCategories()]);
      setIsLoading(false);
    };

    loadAll();
    syncQuantitiesWithCart();

    const handleCartUpdate = () => syncQuantitiesWithCart();
    const handleOpenSearch = () => setIsSearchOpen(true);
    
    window.addEventListener('cart-updated', handleCartUpdate);
    window.addEventListener('open-search', handleOpenSearch);
    
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('open-search', handleOpenSearch);
    };
  }, []);

  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const heroBottom = heroRef.current.getBoundingClientRect().bottom;
        // Permanece sticky se rolar OU se estiver pesquisando
        const stickyState = heroBottom < 0 || searchQuery.length > 0;
        setIsSticky(stickyState);
        window.dispatchEvent(new CustomEvent('sticky-changed', { detail: stickyState }));
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check initially
    return () => window.removeEventListener("scroll", handleScroll);
  }, [searchQuery]);

  // Scroll to menu when searching starts
  const prevSearchRef = useRef("");
  useEffect(() => {
    if (searchQuery.length > 0 && prevSearchRef.current === "" && categories.length > 0) {
      const firstCategory = categories[0]?.slug;
      if (firstCategory) {
        const element = document.getElementById(`category-${firstCategory}`);
        if (element) {
          // Leave some space for the sticky header
          window.scrollTo({ top: element.offsetTop - 140, behavior: "smooth" });
        }
      }
    }
    prevSearchRef.current = searchQuery;
  }, [searchQuery, categories]);

  // Lock scroll when modal or search is open
  useEffect(() => {
    if (selectedProduct || isSearchOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedProduct, isSearchOpen]);

  return (
    <div className="bg-[#F9FAFB] min-h-screen">


      {/* Static Search & Category Container */}
      <div id="cardapio" ref={heroRef} className="max-w-7xl mx-auto px-4 md:px-12 mt-8 md:mt-20">
        {/* Welcome Headline */}
        {isLoading ? (
          <div className="mb-8 md:mb-12 space-y-2 md:space-y-3">
            <div className="h-8 md:h-12 w-48 md:w-[380px] bg-gray-100 rounded-xl animate-pulse" />
            <div className="h-5 md:h-7 w-64 md:w-[300px] bg-gray-100/60 rounded-lg animate-pulse" />
          </div>
        ) : !searchQuery ? (
          <div className="mb-8 md:mb-12 space-y-0.5 md:space-y-1">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 tracking-tighter leading-tight">
              Fome de quê hoje?
            </h1>
            <p className="text-lg md:text-2xl font-medium text-gray-400 tracking-tight">
              O melhor da região na sua porta.
            </p>
          </div>
        ) : null}

        {!isLoading && !searchQuery && (
          <div className="w-full max-w-3xl mb-4 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-6 h-6 transition-transform group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-3 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-gray-700 transition-all shadow-sm font-medium"
              />
            </div>
          </div>
        )}


      </div>



      <div
        className={`fixed top-0 left-0 w-full bg-[#F9FAFB] z-[100] transition-all duration-300 border-b border-gray-100/50 ${isSticky
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0 pointer-events-none"
          }`}
      >
        <div className="max-w-7xl mx-auto px-0 md:px-12 pt-3 md:py-4 flex flex-col items-center gap-2">
          <div className="w-full px-4 md:px-0">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 transition-transform group-focus-within:scale-110" />
              <input
                type="text"
                placeholder="Buscar itens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary text-gray-700 transition-all font-medium shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-primary transition-colors border border-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          {!searchQuery && (
            <div className="w-full flex items-center gap-4 overflow-hidden">
            <div className="hidden md:block relative w-64">
              <button
                onClick={() => setIsStickyDropdownOpen(!isStickyDropdownOpen)}
                className="w-full py-2 px-4 bg-white border border-gray-100 rounded-xl text-sm text-left text-gray-700 flex items-center justify-between hover:bg-gray-50 transition-all outline-none"
              >
                <div className="flex items-center gap-2">
                  <Cake className="w-3.5 h-3.5 text-primary" />
                  <span className="font-medium">{currentCategoryName}</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isStickyDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isStickyDropdownOpen && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-slide-up py-1">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.slug);
                    return (
                      <button
                        key={`sticky-${cat.id}`}
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setIsStickyDropdownOpen(false);
                          const element = document.getElementById(`category-${cat.slug}`);
                          if (element) window.scrollTo({ top: element.offsetTop - 180, behavior: 'smooth' });
                        }}
                        className={`w-full px-4 py-2 text-left flex items-center gap-3 transition-colors hover:bg-indigo-50 ${selectedCategory === cat.slug ? "text-primary bg-indigo-50/30" : "text-gray-700"}`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Mobile Category Scroll (only on mobile) - Scroll to edges */}
            <div className="md:hidden w-full overflow-x-auto no-scrollbar flex items-center bg-transparent px-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={`cat-skel-${i}`} className="shrink-0 px-6 py-4">
                    <div className="w-16 h-4 bg-gray-100 rounded-full animate-pulse" />
                  </div>
                ))
              ) : (
                categories.map((cat) => (
                  <button
                    key={`sticky-mob-${cat.id}`}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      const element = document.getElementById(`category-${cat.slug}`);
                      if (element) {
                        window.scrollTo({ top: element.offsetTop - 180, behavior: 'smooth' });
                      }
                    }}
                    className={`shrink-0 whitespace-nowrap px-4 py-3 text-base font-medium font-display transition-all border-b-2 ${selectedCategory === cat.slug
                      ? "text-primary border-primary"
                      : "text-gray-400 border-transparent"
                      }`}
                  >
                    {cat.name.split(' ')[0]}
                  </button>
                ))
              )}
              <div className="shrink-0 w-8" aria-hidden="true" />
            </div>
          </div>
          )}
        </div>
      </div>

      <section className="pt-0 pb-12 px-4 md:px-12 max-w-7xl mx-auto mt-0 mb-6">
        <div className="space-y-12 md:space-y-16">
          {isLoading ? (
            // Skeletons while loading
            Array.from({ length: 3 }).map((_, i) => (
              <div key={`skel-group-${i}`} className="space-y-4">
                <div className="h-7 bg-gray-100 rounded-xl w-48 animate-pulse ml-0" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={`skel-prod-${i}-${j}`} className="h-28 md:h-[128px] bg-white rounded-xl border border-gray-100 flex items-center p-3 animate-pulse">
                      <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 rounded-xl shrink-0" />
                      <div className="flex-1 ml-4 space-y-3">
                        <div className="h-4 bg-gray-100 rounded-lg w-3/4" />
                        <div className="h-3 bg-gray-50 rounded-lg w-1/2" />
                        <div className="h-4 bg-gray-50 rounded-lg w-1/4 mt-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            categories
              .filter((cat) => cat.slug !== "Todos")
              .map((cat) => {
                const categoryProducts = filteredProducts.filter(
                  (p) => p.category === cat.slug,
                );
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={cat.id} id={`category-${cat.slug}`} className="space-y-4 md:space-y-6 scroll-mt-32">
                    {!searchQuery && (
                      <div className="border-b border-gray-200 pb-2">
                        <h3 className="text-lg font-semibold text-gray-800 font-display leading-tight">
                          {cat.name}
                        </h3>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                      {categoryProducts.map((p, idx) => (
                        <React.Fragment key={p.id}>
                          <div
                            onClick={() => {
                              setSelectedProduct(p);
                              setQuantity(1);
                              setObservation("");
                            }}
                            className="group bg-white rounded-xl flex flex-row items-start p-3 md:p-4 transition-all duration-300 hover:scale-[1.02] cursor-pointer relative overflow-hidden h-28 md:h-[128px] border border-gray-100/50"
                          >
                            {/* Image */}
                            <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50/30 flex items-center justify-center rounded-xl overflow-hidden shrink-0 border-2 border-white">
                              <img
                                alt={p.name}
                                className="w-full h-full object-cover drop-shadow-sm group-hover:scale-110 transition-transform duration-500"
                                src={p.img}
                              />
                            </div>

                            {/* Content */}
                            <div className="flex-1 px-3 md:px-4 min-w-0 flex flex-col h-full relative">
                              <div className="space-y-1.5">
                                <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-1">
                                  {p.name}
                                </h3>
                                <p className="text-sm md:text-base text-gray-400 font-medium line-clamp-1 mt-1">
                                  {p.detail || "Uma verdadeira explosão de sabor."}
                                </p>
                              </div>

                              <div className="flex items-center justify-between mt-auto">
                                <span className="text-base md:text-lg font-semibold text-gray-900">
                                  {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          {/* Divider for mobile/single column - hidden for last item */}
                          {idx < categoryProducts.length - 1 && (
                            <div className="md:hidden h-px bg-gray-200 w-full" />
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </section>

      {/* Product Detail Modal */}
      {
        selectedProduct && (
          <div className="fixed inset-0 z-100 flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setSelectedProduct(null)} />

            <div className={`relative w-full h-full md:h-auto md:max-h-[85vh] md:max-w-5xl bg-white rounded-t-[1.5rem] md:rounded-xl  flex flex-col md:flex-row overflow-hidden animate-slide-in-up md:animate-fade-in transition-all duration-500 ${showZoom ? 'blur-md scale-[0.98] opacity-60' : ''}`}>

              <button onClick={() => setSelectedProduct(null)} className="absolute top-4 left-4 z-50 md:hidden bg-white p-2 rounded-full text-primary border border-gray-100 shadow-sm">
                <ChevronLeft className="w-5 h-5 stroke-[3]" />
              </button>

              <div className="w-full md:w-[60%] h-64 md:h-auto relative overflow-hidden cursor-zoom-in group/img" onClick={() => setShowZoom(true)}>
                <img src={selectedProduct.img} alt={selectedProduct.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110" />
                <div className="absolute inset-0 flex items-center justify-center md:hidden bg-black/5 opacity-60">
                  <div className="bg-white/20 backdrop-blur-sm p-3 rounded-full border border-white/20">
                    <Eye className="w-5 h-5 text-white/90" />
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col bg-white relative rounded-t-[1.5rem] md:rounded-t-none -mt-8 md:mt-0 z-10 shadow-[0_-15px_30px_rgba(0,0,0,0.08)]">
                <button onClick={() => setSelectedProduct(null)} className="hidden md:flex absolute top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-6 h-6" />
                </button>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 custom-scrollbar">
                  <div className="space-y-1">
                    {/* Badge removed */}
                    <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight leading-tight">{selectedProduct.name}</h2>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed font-medium">{selectedProduct.detail || "Uma verdadeira explosão de sabor artesanal, feita com carinho para você."}</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-semibold text-gray-900">
                    {selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </div>

                  {localStorage.getItem('lastOrderId') && (
                    <Link
                      to={`/tracking/${localStorage.getItem('lastOrderId')}`}
                      className="flex items-center gap-3 p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-primary text-sm font-bold hover:bg-indigo-100/50 transition-all  group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center  group-hover:scale-110 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <p className="leading-tight">Você tem um pedido em andamento!</p>
                        <p className="text-[10px] font-medium text-primary mt-0.5">Clique aqui para acompanhar</p>
                      </div>
                    </Link>
                  )}
                  <div className="space-y-4 pt-4">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-base font-medium text-gray-800 flex items-center gap-2"><Heart className="w-4 h-4 text-primary" />Observação para o pedido?</label>
                      <span className="text-sm text-gray-400 font-medium">{observation.length} / 140</span>
                    </div>
                    <textarea value={observation} onChange={(e) => setObservation(e.target.value.slice(0, 140))} placeholder="Ex: sem açúcar por cima..." className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all min-h-[80px] resize-none " />
                  </div>
                </div>

                <div className="p-6 md:p-8 bg-white border-t border-gray-100 flex items-center gap-4">
                  <div className="flex items-center bg-gray-50 rounded-xl p-1 border border-gray-200">
                    <button
                      onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-none"
                    >
                      <Minus className="w-5 h-5 stroke-[3]" />
                    </button>
                    <span className="w-8 text-center font-bold text-gray-700">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-none"
                    >
                      <Plus className="w-5 h-5 stroke-[3]" />
                    </button>
                  </div>
                  <button onClick={() => {
                    const categoryName = categories.find(c => String(c.slug).toLowerCase() === String(selectedProduct.category).toLowerCase() || String(c.id) === String(selectedProduct.category))?.name;
                    const cartItem = { id: selectedProduct.id, name: selectedProduct.name, price: selectedProduct.price, img: selectedProduct.img, detail: selectedProduct.detail, category: categoryName, quantity: quantity, observation: observation };
                    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
                    const existingItemIndex = existingCart.findIndex((item: any) => item.id === cartItem.id);
                    if (existingItemIndex > -1) { existingCart[existingItemIndex].quantity += quantity; } else { existingCart.push(cartItem); }
                    localStorage.setItem('cart', JSON.stringify(existingCart));
                    window.dispatchEvent(new Event('cart-updated'));
                    toast.success('Adicionado ao carrinho!');
                    setSelectedProduct(null); setQuantity(1); setObservation("");
                  }}
                    className="flex-1 bg-primary text-white h-12 md:h-14 rounded-xl font-semibold flex items-center justify-between px-6 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-none"
                  >
                    <span className="text-sm md:text-lg font-bold tracking-tight">Adicionar</span>
                    <span className="text-sm md:text-base font-semibold ml-4">
                      {(selectedProduct.price * quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {
        showZoom && selectedProduct && (
          <div className="fixed inset-0 z-120 flex items-center justify-center p-4 px-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" onClick={() => setShowZoom(false)} />
            <img src={selectedProduct.img} alt={selectedProduct.name} onClick={() => setShowZoom(false)} className="relative z-115 max-w-full max-h-full object-contain rounded-xl  animate-zoom-in cursor-zoom-out transition-transform duration-500 hover:scale-105" />
          </div>
        )
      }

      {/* Full Screen Search Overlay */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-150 bg-white flex flex-col pt-4">
          <div className="flex items-center gap-3 w-full px-4">
            <div className="relative flex-[4] group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-5 h-5 transition-transform group-focus-within:scale-110" />
              <input
                autoFocus
                type="text"
                placeholder="O que você está procurando hoje?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary/10 focus:bg-white text-gray-700 transition-all placeholder:text-gray-400 font-medium"
              />
            </div>
            <button 
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className="flex-1 text-base font-semibold text-primary hover:text-primary-dark transition-colors whitespace-nowrap text-right"
            >
              Cancelar
            </button>
          </div>
          <div className="flex-1 overflow-y-auto pt-6 no-scrollbar">
            {searchQuery && (
              <div className="max-w-7xl mx-auto">
                {filteredProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-10 h-10 text-gray-200" />
                    </div>
                    <p className="text-gray-500 font-medium">Nenhum item encontrado para "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-12">
                     {filteredProducts.map((p) => (
                        <div
                          key={`search-${p.id}`}
                          onClick={() => {
                            setSelectedProduct(p);
                            setIsSearchOpen(false);
                            setQuantity(1);
                            setObservation("");
                          }}
                          className="group bg-white rounded-xl flex flex-row items-start p-3 md:p-4 transition-all duration-300 border border-gray-100/50 h-28 md:h-[128px]"
                        >
                          <div className="w-20 h-20 md:w-24 md:h-24 bg-indigo-50/30 flex items-center justify-center rounded-xl overflow-hidden shrink-0">
                            <img alt={p.name} className="w-full h-full object-cover" src={p.img} />
                          </div>
                          <div className="flex-1 px-3 md:px-4 min-w-0 flex flex-col h-full">
                            <h3 className="font-semibold text-base md:text-lg text-gray-800 line-clamp-1">{p.name}</h3>
                            <p className="text-sm md:text-base text-gray-400 font-medium line-clamp-1 mt-1">{p.detail || "Uma verdadeira explosão de sabor."}</p>
                            <span className="text-base md:text-lg font-semibold text-gray-900 mt-auto">
                              {p.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div >
  );
}
