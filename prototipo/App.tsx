import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, User, Cake, Menu, 
  Package, LogOut,
  Bell, Search, X, Instagram, Facebook, Phone, Mail, MapPin, Heart
} from 'lucide-react';

// Pages
import ClientHome from './pages/ClientHome';
import ClientCart from './pages/ClientCart';
import ClientCheckout from './pages/ClientCheckout';
import ClientConfirmation from './pages/ClientConfirmation';
import AdminCatalog from './pages/AdminCatalog';

const ClientLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = savedCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    setCartCount(count);
  };

  useEffect(() => {
    updateCartCount();
    window.addEventListener('cart-updated', updateCartCount);
    return () => window.removeEventListener('cart-updated', updateCartCount);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    
    // Se não estiver na home, navega para a home com a hash
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }

    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#333]">
      {/* Navigation - Hidden on mobile during checkout flow */}
      <nav className={`w-full bg-white border-b border-pink-100 sticky top-0 z-50 shadow-sm md:shadow-none ${['/cart', '/checkout', '/confirmation'].includes(location.pathname) ? 'hidden md:block' : 'block'}`}>
        <div className="max-w-7xl mx-auto h-14 md:h-16 px-4 md:px-8 flex justify-between items-center text-[#333]">
          <div className="flex items-center gap-2">
              {/* Mobile Menu Button */}
              <button className="md:hidden text-gray-700" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                  <Menu className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-2">
                  <img src="/logo.png" alt="Logo" className="h-20 md:h-22 object-contain" />
              </div>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10 text-base font-medium text-gray-600">
            <button onClick={() => scrollToSection('inicio')} className="hover:text-[#FE5B95] hover:scale-110 transition-all duration-300 transform inline-block">Início</button>
            <button onClick={() => scrollToSection('cardapio')} className="hover:text-[#FE5B95] hover:scale-110 transition-all duration-300 transform inline-block">Cardápio</button>
            <button onClick={() => scrollToSection('contato')} className="hover:text-[#FE5B95] hover:scale-110 transition-all duration-300 transform inline-block">Contato</button>
          </div>

          <div className="flex items-center space-x-4 md:space-x-6 text-gray-600">
            <Link to="/cart" className="hover:text-[#FE5B95] transition-colors relative">
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FE5B95] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce-in">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link to="/admin" className="hover:text-[#FE5B95] transition-colors flex items-center gap-1 text-xs font-bold border border-gray-300 rounded px-2 py-1">
               Admin
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#FFF0F5] p-6 flex flex-col gap-6 md:hidden">
            <div className="flex justify-between items-center">
                <span className="text-2xl font-bold font-display text-gray-900 uppercase tracking-tight">Menu</span>
                <button onClick={() => setIsMenuOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <div className="flex flex-col space-y-4 text-lg font-medium text-gray-800">
                <button className="text-left" onClick={() => scrollToSection('inicio')}>Início</button>
                <button className="text-left" onClick={() => scrollToSection('cardapio')}>Cardápio</button>
                <button className="text-left" onClick={() => scrollToSection('contato')}>Contato</button>
                <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Meu Carrinho</Link>
                <Link to="/admin" onClick={() => setIsMenuOpen(false)} className="text-[#FF69B4]">Painel Admin</Link>
            </div>
        </div>
      )}

      {children}
      
      {!['/cart', '/checkout', '/confirmation'].includes(location.pathname) && (
        <footer id="contato" className="bg-gradient-to-b from-white to-[#FFF5F7] pt-6 pb-2 md:pt-12 md:pb-4 border-t border-pink-100 mt-auto">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-12 mb-4">
              {/* Brand Column */}
              <div className="space-y-2 md:space-y-4 text-center md:text-left">
                <div className="flex justify-center md:justify-start items-center gap-2">
                   <img src="/logo.png" alt="Logo" className="h-16 md:h-20 object-contain" />
                </div>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed px-4 md:px-0">
                  Transformando sonhos em doçura desde 2023. Os melhores bolos artesanais da região, feitos com amor e os melhores ingredientes.
                </p>
                <div className="flex justify-center md:justify-start items-center gap-3">
                  <a 
                    href="https://www.instagram.com/karolaynedoces/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-11 h-11 rounded-2xl bg-white border border-pink-100 flex items-center justify-center text-[#FE5B95] hover:bg-[#FE5B95] hover:text-white transition-all shadow-sm hover:scale-110 active:scale-95"
                  >
                    <Instagram className="w-6 h-6" />
                  </a>
                </div>
              </div>

              {/* Quick Links */}
              <div className="md:pt-12 text-center md:text-left hidden md:block md:ml-12">
                <h3 className="text-gray-900 font-bold mb-4 text-base">Links Rápidos</h3>
                <ul className="space-y-2 text-base text-gray-600">
                  <li><Link to="/" className="hover:text-[#FE5B95] transition-colors">Bolos Vulcões</Link></li>
                  <li><Link to="/" className="hover:text-[#FE5B95] transition-colors">Bolos de Festa</Link></li>
                  <li><Link to="/" className="hover:text-[#FE5B95] transition-colors">Doces Gourmet</Link></li>
                  <li><Link to="/" className="hover:text-[#FE5B95] transition-colors">Encomendas Personalizadas</Link></li>
                </ul>
              </div>

              {/* Contact Info */}
              <div className="md:pt-10 text-center md:text-left">
                <h3 className="text-gray-900 font-bold mb-2 md:mb-4 text-sm md:text-base uppercase md:normal-case tracking-wider md:tracking-normal">Atendimento</h3>
                <ul className="space-y-1.5 md:space-y-2 text-xs md:text-base text-gray-600">
                  <li className="flex items-center justify-center md:justify-start gap-3">
                    <MapPin className="w-5 h-5 text-[#FE5B95] shrink-0" />
                    <span>Av. Rio Grande do Norte, 402 - Cidade da Esperança</span>
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-3 group">
                    <a 
                      href={`https://wa.me/5584986561077?text=${encodeURIComponent("Olá, bom dia! Gostaria de saber mais sobre os bolos e doces da Karolayne Doces. 🍰🧁")}`}
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-[#FE5B95] transition-colors"
                    >
                      <div className="w-6 h-6 text-[#FE5B95] shrink-0 fill-current">
                        <svg viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg">
                          <path d="M476.9 161.1C435 119.1 379.2 96 319.9 96C197.5 96 97.9 195.6 97.9 318C97.9 357.1 108.1 395.3 127.5 429L96 544L213.7 513.1C246.1 530.8 282.6 540.1 319.8 540.1L319.9 540.1C442.2 540.1 544 440.5 544 318.1C544 258.8 518.8 203.1 476.9 161.1zM319.9 502.7C286.7 502.7 254.2 493.8 225.9 477L219.2 473L149.4 491.3L168 423.2L163.6 416.2C145.1 386.8 135.4 352.9 135.4 318C135.4 216.3 218.2 133.5 320 133.5C369.3 133.5 415.6 152.7 450.4 187.6C485.2 222.5 506.6 268.8 506.5 318.1C506.5 419.9 421.6 502.7 319.9 502.7zM421.1 364.5C415.6 361.7 388.3 348.3 383.2 346.5C378.1 344.6 374.4 343.7 370.7 349.3C367 354.9 356.4 367.3 353.1 371.1C349.9 374.8 346.6 375.3 341.1 372.5C308.5 356.2 287.1 343.4 265.6 306.5C259.9 296.7 271.3 297.4 281.9 276.2C283.7 272.5 282.8 269.3 281.4 266.5C280 263.7 268.9 236.4 264.3 225.3C259.8 214.5 255.2 216 251.8 215.8C248.6 215.6 244.9 215.6 241.2 215.6C237.5 215.6 231.5 217 226.4 222.5C221.3 228.1 207 241.5 207 268.8C207 296.1 226.9 322.5 229.6 326.2C232.4 329.9 268.7 385.9 324.4 410C359.6 425.2 373.4 426.5 391 423.9C401.7 422.3 423.8 410.5 428.4 397.5C433 384.5 433 373.4 431.6 371.1C430.3 368.6 426.6 367.2 421.1 364.5z"/>
                        </svg>
                      </div>
                      <span>(84) 98656-1077</span>
                    </a>
                  </li>
                  <li className="flex items-center justify-center md:justify-start gap-3">
                    <Mail className="w-5 h-5 text-[#FE5B95] shrink-0" />
                    <span>contato@karolaynedoces.com</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-4 border-t border-pink-100 flex flex-col md:flex-row justify-center items-center gap-4 text-[10px] md:text-sm text-gray-500">
                <p>© 2026 Karolayne Doces. Todos os direitos reservados.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Set initial state based on window width - Removed to default to closed
   React.useEffect(() => {
     if (window.innerWidth >= 768) {
       setIsSidebarOpen(true);
     }
   }, []);

  return (
    <div className="flex h-screen bg-[#FDFBFC] font-sans text-[#1b0d11]">
      <style>{`
        .admin-sidebar-transition {
          transition: width 0.3s ease-in-out, min-width 0.3s ease-in-out, opacity 0.3s ease-in-out;
        }
      `}</style>

      {/* Sidebar - Desktop Only */}
      <aside className={`
        hidden md:flex md:relative h-full z-50 bg-white border-r border-gray-200 flex-col flex-shrink-0 admin-sidebar-transition overflow-hidden
        ${isSidebarOpen ? 'md:w-64 opacity-100' : 'md:w-0 opacity-0'}
      `}>
        <div className="pt-6 px-6 pb-0 flex items-center justify-between gap-3 min-w-[256px]">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="h-24 object-contain" />
            </div>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 text-gray-400 hover:text-[#FE5B95] hover:bg-pink-50 rounded-xl transition-all"
            >
              <X className="w-6 h-6" />
            </button>
        </div>

        <nav className="flex-1 px-4 pt-4 space-y-1 overflow-y-auto">
            {[
                { path: '/admin/catalog', icon: Package, label: 'Produtos' },
            ].map((item) => (
                <Link 
                    key={item.path}
                    to={item.path} 
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors bg-[#FE5B95] text-white shadow-md shadow-[#FE5B95]/20`}
                >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                </Link>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-100 mt-auto">
             <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors">
                <LogOut className="w-5 h-5" />
                <span className="text-sm font-medium">Sair</span>
            </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 flex items-center justify-end md:justify-between px-4 md:px-8 bg-white border-b border-gray-200">
             <div className={`hidden md:flex items-center gap-4 flex-1 transition-all duration-300 ${isSidebarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                <button 
                  className="p-2 text-gray-500 hover:bg-pink-50 hover:text-[#FE5B95] rounded-xl transition-all active:scale-95 animate-fade-in" 
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                    <Menu className="w-6 h-6" />
                </button>
             </div>
            <div className="flex items-center gap-4">
                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#FE5B95] rounded-full border-2 border-white"></span>
                </button>
                <div className="h-8 w-px bg-gray-200 hidden sm:block"></div>
                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-bold font-display leading-none">Admin Karolayne</p>
                        <p className="text-[11px] text-gray-500">Gerente Geral</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-[#FE5B95]/20 overflow-hidden">
                        <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1rhl7DWNp6yAPLEq1RDEaENovXvdNDPfQQfhksRCU6bNlWosvPIj1dSxFTlf2VXJP8xfu2dsY_qQptn4AaVMldJ1OjyNn03heKPuWsWGG4qeCgOWdJV0D-_SskzaHvlztDi48B48vkJj1t2znZPMJtJLH08TDM4PnpTlo5109ji4itHakcJjDgIoH-DjTyvwCxWZ0JSvAFcZZPRfgyStQDfDzJMP7VkMN1dBBsDtWEdhhpjqZv7vFv42XFhaAH6VzSz95OuG6izQS" alt="Admin" className="w-full h-full object-cover" />
                    </div>
                </div>
            </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8">
            {children}
        </div>
      </main>

      {/* Horizontal Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-6 left-6 right-6 h-16 bg-white/90 backdrop-blur-lg border border-pink-100 rounded-full shadow-[0_8px_30px_rgba(254,91,149,0.15)] z-[60] flex items-center justify-around px-4">
        <Link 
          to="/admin/catalog" 
          className={`flex flex-col items-center gap-1 transition-all ${isActive('/admin/catalog') ? 'text-[#FE5B95]' : 'text-gray-400'}`}
        >
          <Package className={`${isActive('/admin/catalog') ? 'w-6 h-6' : 'w-5 h-5'}`} />
          <span className="text-[10px] font-bold">Produtos</span>
        </Link>
        
        <Link 
          to="/" 
          className="flex flex-col items-center gap-1 text-gray-400"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] font-bold">Sair</span>
        </Link>
      </nav>
    </div>
  );
};

import { Toaster, toast } from 'react-hot-toast';

export default function App() {
  return (
    <HashRouter>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#333',
            color: '#fff',
            cursor: 'pointer',
          },
          success: {
            style: {
              background: '#FDF2F8',
              color: '#BE185D',
              border: '1px solid #FBCFE8',
            },
            iconTheme: {
              primary: '#FE5B95',
              secondary: '#fff',
            },
          },
          error: {
            style: {
              background: '#FEF2F2',
              color: '#991B1B',
              border: '1px solid #FECACA',
            },
          },
        }}
      >
        {(t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.2s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              background: t.type === 'success' ? '#FDF2F8' : t.type === 'error' ? '#FEF2F2' : '#333',
              color: t.type === 'success' ? '#BE185D' : t.type === 'error' ? '#991B1B' : '#fff',
              padding: '12px 16px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              border: t.type === 'success' ? '1px solid #FBCFE8' : t.type === 'error' ? '1px solid #FECACA' : 'none',
            }}
          >
            <div style={{ marginRight: '12px', display: 'flex' }}>
              {t.type === 'success' && <span style={{ color: '#FE5B95' }}>✓</span>}
              {t.type === 'error' && <span>✕</span>}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 500 }}>{String(t.message)}</div>
            <div style={{ marginLeft: '12px', opacity: 0.5, fontSize: '12px' }}>✕</div>
          </div>
        )}
      </Toaster>
      <Routes>
        {/* Client Routes */}
        <Route path="/" element={<ClientLayout><ClientHome /></ClientLayout>} />
        <Route path="/cart" element={<ClientLayout><ClientCart /></ClientLayout>} />
        <Route path="/checkout" element={<ClientLayout><ClientCheckout /></ClientLayout>} />
        <Route path="/confirmation" element={<ClientLayout><ClientConfirmation /></ClientLayout>} />

        {/* Admin Routes - All consolidated to Catalog */}
        <Route path="/admin" element={<AdminLayout><AdminCatalog /></AdminLayout>} />
        <Route path="/admin/catalog" element={<AdminLayout><AdminCatalog /></AdminLayout>} />
        <Route path="/admin/*" element={<AdminLayout><AdminCatalog /></AdminLayout>} />
      </Routes>
    </HashRouter>
  );
}