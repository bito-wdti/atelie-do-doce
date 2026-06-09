import React, { useState, useEffect, useRef } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, useNavigate, Navigate } from 'react-router-dom';
import {
  ShoppingBag, User, Cake, Menu,
  Package, LogOut,
  Bell, Search, X, Instagram, Facebook, Phone, Mail, MapPin, Heart,
  LayoutDashboard, ClipboardList, Settings, CheckCircle, Info, DollarSign, Calendar, Store, Check, ChefHat
} from 'lucide-react';

// Pages
import ClientHome from './pages/ClientHome';
import ClientCart from './pages/ClientCart';
import ClientCheckout from './pages/ClientCheckout';
import ClientConfirmation from './pages/ClientConfirmation';
import ClientTracking from './pages/ClientTracking';
import AdminCatalog from './pages/AdminCatalog';
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';
import AdminLogin from './pages/AdminLogin';
import ClientLogin from './pages/ClientLogin';
import Register from './pages/Register';
import UserProfile from './pages/UserProfile';
import UserSettings from './pages/UserSettings';
import AdminFinance from './pages/AdminFinance';
import AdminTransactions from './pages/AdminTransactions';

import { authApi, ordersApi } from './services/api';
import { Toaster, toast } from 'react-hot-toast';

// Simple Route Protection
const AdminProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = authApi.isAuthenticated();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
};

const ClientLayout = ({ children }: { children?: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('userToken'));
  const userName = localStorage.getItem('userName') || '';

  useEffect(() => {
    const handleSticky = (e: any) => setIsHeaderSticky(e.detail);
    const handleAuthChange = () => setIsLoggedIn(!!localStorage.getItem('userToken'));
    window.addEventListener('sticky-changed', handleSticky);
    window.addEventListener('user-auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('sticky-changed', handleSticky);
      window.removeEventListener('user-auth-changed', handleAuthChange);
    };
  }, []);
  const [cartCount, setCartCount] = useState(0);
  const [cartTotal, setCartTotal] = useState(0);

  const updateCartData = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const count = savedCart.reduce((acc: number, item: any) => acc + item.quantity, 0);
    const total = savedCart.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);
    setCartCount(count);
    setCartTotal(total);
  };

  useEffect(() => {
    updateCartData();
    window.addEventListener('cart-updated', updateCartData);
    return () => window.removeEventListener('cart-updated', updateCartData);
  }, []);
  const scrollToSection = (sectionId: string) => {
    setIsMenuOpen(false);
    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      return;
    }
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#333]">
      {/* Navigation - Hidden on mobile during checkout flow and home page */}
      <nav className={`w-full bg-[#F9FAFB] sticky top-0 z-50 border-none shadow-none md:shadow-none ${['/cart', '/checkout', '/confirmation'].includes(location.pathname) ? 'hidden md:block' : 'block'}`}>
        <div className={`max-w-7xl mx-auto h-14 md:h-16 px-4 md:px-8 flex justify-between items-center text-[#333] transition-all duration-300 ${isHeaderSticky ? 'opacity-0 h-0 overflow-hidden pointer-events-none' : 'opacity-100'}`}>
          {/* Logo na ponta esquerda */}
          <div className="flex items-center gap-2">
            <ChefHat className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">Ateliê do <span className="text-indigo-600">Doce</span></span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-10 text-base font-medium text-gray-600">
            <button onClick={() => scrollToSection('inicio')} className="transition-all duration-300 inline-block font-medium">Início</button>
            <button onClick={() => scrollToSection('cardapio')} className="transition-all duration-300 inline-block font-medium">Cardápio</button>
            <button onClick={() => scrollToSection('contato')} className="transition-all duration-300 inline-block font-medium">Contato</button>
            {isLoggedIn ? (
              <Link to="/profile" className="inline-flex items-center gap-1.5 font-medium text-indigo-600 transition-all duration-300">
                <User className="w-4 h-4" />
                {userName || 'Meu perfil'}
              </Link>
            ) : (
              <Link to="/login" className="inline-flex items-center gap-1.5 font-medium text-gray-400 hover:text-indigo-600 transition-all duration-300">
                <Settings className="w-4 h-4" />
                Login
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-2 md:space-x-4 text-gray-600">
            <Link to="/cart" className="relative group p-2">
              <ShoppingBag className="w-6 h-6 text-indigo-600 transition-transform group-hover:scale-110" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-semibold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#F9FAFB] animate-in zoom-in duration-300">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>
      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-white p-6 flex flex-col gap-6 md:hidden">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-semibold font-display text-gray-900  tracking-tight">Menu</span>
            <button onClick={() => setIsMenuOpen(false)}><X className="w-6 h-6" /></button>
          </div>
          <div className="flex flex-col space-y-4 text-lg font-medium text-gray-800">
            <button className="text-left" onClick={() => scrollToSection('inicio')}>Início</button>
            <button className="text-left" onClick={() => scrollToSection('cardapio')}>Cardápio</button>
            <button className="text-left" onClick={() => scrollToSection('contato')}>Contato</button>
            <Link to="/cart" onClick={() => setIsMenuOpen(false)}>Meu Carrinho</Link>
            {isLoggedIn ? (
              <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-indigo-600 font-medium">
                <User className="w-5 h-5" />
                {userName || 'Meu perfil'}
              </Link>
            ) : (
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors">
                <Settings className="w-5 h-5" />
                Login
              </Link>
            )}
          </div>
        </div>
      )}
      {children}

      {/* Floating Mobile Cart Bar */}
      {cartCount > 0 && !['/cart', '/checkout', '/confirmation', '/tracking'].some(path => location.pathname.includes(path)) && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.08)] animate-slide-up pb-safe">
          <div className="max-w-md mx-auto flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-sm md:text-base text-gray-500 font-medium mb-0.5">Total sem a entrega</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-semibold text-gray-900">{cartTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                <span className="text-sm text-gray-500 font-medium whitespace-nowrap">/ {cartCount} {cartCount === 1 ? 'item' : 'itens'}</span>
              </div>
            </div>
            <Link to="/cart" className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-xl flex items-center justify-center transition-all active:scale-95 shadow-md shadow-primary/20 shrink-0">
              Ver sacola
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

const AdminLayout = ({ children }: { children?: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [historyNotifications, setHistoryNotifications] = useState<any[]>([]);
  const [historyFilter, setHistoryFilter] = useState('');
  const notificationRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    fetchNotifications();
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node) && window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isHistoryOpen) fetchHistory();
  }, [isHistoryOpen, historyFilter]);

  async function fetchNotifications() {
    const data = await ordersApi.list({ limit: 5 });
    setNotifications(data || []);
  }

  async function fetchHistory() {
    const params: any = { limit: 100 };
    if (historyFilter) {
      const start = new Date(historyFilter); start.setHours(0, 0, 0, 0);
      const end = new Date(historyFilter); end.setHours(23, 59, 59, 999);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }
    const data = await ordersApi.list(params);
    setHistoryNotifications(data || []);
  }

  const handleLogout = () => {
    authApi.logout();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/orders', icon: ClipboardList, label: 'Pedidos' },
    { path: '/admin/finance', icon: DollarSign, label: 'Finanças' },
    { path: '/admin/catalog', icon: Package, label: 'Produtos' },
    { path: '/admin/settings', icon: Settings, label: 'Ajustes' },
  ];

  return (
    <div className="flex h-screen bg-white font-sans text-[#1b0d11] overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-140 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed inset-y-0 left-0 z-150 w-72 bg-white border-r border-gray-100 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-full flex flex-col p-6">
          <div className="flex items-center justify-between mb-10 px-2">
            <Link to="/" className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary text-white shadow-md shadow-primary/30 flex items-center justify-center shrink-0">
                <ChefHat className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-semibold text-gray-900 font-display tracking-tight leading-none text-left">
                  Ateliê do Doce
                </span>
                <span className="text-[10px]  font-semibold tracking-[0.2em] text-gray-400 mt-0.5">Admin</span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-xl text-gray-400 hover:bg-gray-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 space-y-1">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${isActive(item.path) ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group border-t border-gray-50 mt-auto pt-6"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Sair do Painel</span>
          </button>
        </div>
      </aside>

      <main className={`flex-1 flex flex-col min-w-0 md:overflow-hidden overflow-y-auto relative transition-all duration-300 ease-in-out ${isSidebarOpen ? 'lg:ml-72' : 'ml-0'}`}>
        <header className="h-16 flex items-center justify-between px-6 md:px-10 bg-white/80 backdrop-blur-md md:sticky relative top-0 z-60 border-b border-gray-100/50 shrink-0">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="p-2 -ml-2 rounded-none text-gray-500 hover:bg-gray-50 transition-colors animate-fade-in"
                >
                  <Menu className="w-6 h-6" />
                </button>
                <div className="h-6 w-px bg-gray-100"></div>
              </>
            )}
            <h1 className="text-gray-900 font-medium text-lg hidden md:block">
              {menuItems.find(i => isActive(i.path))?.label || 'Início'}
            </h1>
          </div>

          <div className="flex items-center gap-6">

            <div className="relative" ref={notificationRef}>
              <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-2.5 text-gray-400 hover:bg-gray-50 transition-all active:scale-95 relative">
                <Bell className="w-6 h-6" />
                {notifications.length > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-white"></span>}
              </button>
              {isNotificationsOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-slide-up">
                  <div className="p-4 border-b border-gray-50 flex items-center justify-between bg-gray-50/30 text-left">
                    <h3 className="text-gray-900 font-semibold text-sm leading-relaxed text-left  tracking-wider">Notificações</h3>
                    <span className="text-[10px] font-semibold text-white bg-primary px-2 py-0.5 rounded-full">{notifications.length}</span>
                  </div>
                  <div className="max-h-[380px] overflow-y-auto no-scrollbar text-left">
                    {notifications.length === 0 ? (<p className="p-10 text-center text-sm text-gray-500 font-medium">✨ Tudo limpo por aqui!</p>) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => { setIsNotificationsOpen(false); navigate('/admin/orders'); }} className="p-4 flex gap-4 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 text-left group">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 ${n.status === 'Pendente' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>
                            {n.status === 'Pendente' ? <ShoppingBag className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                          </div>
                          <div className="text-left">
                            <p className="text-gray-800 text-sm font-semibold leading-tight text-left">{n.status === 'Pendente' ? 'Novo pedido' : 'Pedido de'} {n.customer_name}</p>
                            <p className="text-gray-400 text-[11px] font-medium mt-1 text-left">Pedido #{n.id} • {new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 text-center border-t border-gray-100 bg-gray-50/30">
                    <button onClick={() => { setIsNotificationsOpen(false); setIsHistoryOpen(true); }} className="text-xs font-semibold text-primary hover:underline transition-colors  tracking-widest cursor-pointer">Ver Todas as Notificações</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 md:overflow-y-auto no-scrollbar bg-[#F9FAFB] text-left">{children}</div>
      </main>

      {/* Full Notifications History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 z-200 flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setIsHistoryOpen(false)}></div>
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div><h2 className="text-xl font-semibold text-gray-900 tracking-tight">Histórico de Notificações</h2><p className="text-gray-500 text-sm mt-0.5">Acompanhe todos os eventos do sistema</p></div>
              <button onClick={() => setIsHistoryOpen(false)} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-4 bg-gray-50/50 border-b border-gray-50 flex items-center gap-4">
              <div className="relative flex-1">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="date" value={historyFilter} onChange={(e) => setHistoryFilter(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:border-[indigo-600] focus:ring-2 focus:ring-indigo-100 outline-none transition-all" />
              </div>
              {historyFilter && <button onClick={() => setHistoryFilter('')} className="text-xs font-semibold text-primary hover:underline  tracking-wider">Limpar</button>}
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar p-2">
              {historyNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center px-6"><div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center text-primary mb-4"><Bell className="w-8 h-8 opacity-20" /></div><p className="text-gray-500 font-medium">Nenhuma notificação encontrada.</p></div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {historyNotifications.map(n => (
                    <div key={n.id} onClick={() => { setIsHistoryOpen(false); navigate('/admin/orders'); }} className="p-4 flex gap-4 hover:bg-indigo-50/20 cursor-pointer transition-all rounded-2xl group border border-transparent hover:border-indigo-50">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 shadow-sm ${n.status === 'Pendente' ? 'bg-blue-50 text-blue-500' : 'bg-green-50 text-green-500'}`}>{n.status === 'Pendente' ? <ShoppingBag className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-gray-900 font-semibold leading-tight truncate">{n.status === 'Pendente' ? 'Novo pedido' : 'Pedido de'} {n.customer_name}</p>
                          <span className="text-[10px] font-semibold text-gray-400  tracking-widest whitespace-nowrap ml-2">{new Date(n.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center justify-between"><p className="text-gray-500 text-sm truncate">Pedido #{n.id} • {n.status}</p><p className="text-gray-400 text-xs font-medium">{new Date(n.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0"><p className="text-center text-[10px] text-gray-400 font-medium  tracking-[0.2em]">Ateliê do Doce • Painel</p></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Toaster position="top-right" toastOptions={{ duration: 2500 }}>
        {(t) => (
          <div
            onClick={() => toast.dismiss(t.id)}
            style={{
              opacity: t.visible ? 1 : 0,
              transform: t.visible ? 'translateY(0)' : 'translateY(-20px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              display: 'flex',
              alignItems: 'center',
              background: t.type === 'success' ? '#4F46E5' : (t.type === 'error' ? '#E11D48' : '#333333'),
              color: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: '16px',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'Montserrat, sans-serif',
              minWidth: '280px',
              zIndex: 9999
            }}
          >
            <div style={{ marginRight: '12px', display: 'flex' }}>
              {t.type === 'success' ? (
                <div style={{ background: '#FFFFFF', borderRadius: '99px', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Check className="w-4 h-4 text-[#4F46E5] stroke-[3.5]" />
                </div>
              ) : (t.type === 'error' ? <X className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white" />)}
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, flex: 1, letterSpacing: '-0.015em' }}>
              {String(t.message)}
            </div>
            <div style={{ marginLeft: '12px', opacity: 0.6, display: 'flex' }}>
              <X className="w-4 h-4 text-white" />
            </div>
          </div>
        )}
      </Toaster>
      <Routes>
        <Route path="/" element={<ClientLayout><ClientHome /></ClientLayout>} />
        <Route path="/cart" element={<ClientLayout><ClientCart /></ClientLayout>} />
        <Route path="/checkout" element={<ClientLayout><ClientCheckout /></ClientLayout>} />
        <Route path="/confirmation" element={<ClientLayout><ClientConfirmation /></ClientLayout>} />
        <Route path="/tracking/:orderId" element={<ClientLayout><ClientTracking /></ClientLayout>} />

        <Route path="/login" element={<ClientLogin />} />
        <Route path="/profile" element={<ClientLayout><UserProfile /></ClientLayout>} />
        <Route path="/profile/settings" element={<ClientLayout><UserSettings /></ClientLayout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/dashboard" element={<AdminProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/finance" element={<AdminProtectedRoute><AdminLayout><AdminFinance /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/transactions" element={<AdminProtectedRoute><AdminLayout><AdminTransactions /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/orders" element={<AdminProtectedRoute><AdminLayout><AdminOrders /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/catalog" element={<AdminProtectedRoute><AdminLayout><AdminCatalog /></AdminLayout></AdminProtectedRoute>} />
        <Route path="/admin/settings" element={<AdminProtectedRoute><AdminLayout><AdminSettings /></AdminLayout></AdminProtectedRoute>} />
      </Routes>
    </HashRouter>
  );
}
