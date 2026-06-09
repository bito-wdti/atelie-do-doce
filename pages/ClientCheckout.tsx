import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, MapPin, Clock, CreditCard, Banknote,
  ChevronDown, ChevronUp, Check, AlertCircle,
  ShoppingBag, Truck, Store, Calendar, X,
  Search, ChevronLeft, ChevronRight, Phone, Pencil, Edit3, Map, User
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { settingsApi } from '../services/api';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

export default function ClientCheckout() {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(true);
  const [isStoreDetailsOpen, setIsStoreDetailsOpen] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);

  const [deliveryMethod, setDeliveryMethod] = useState<'entrega' | 'retirada'>('entrega');
  const [storeSettings, setStoreSettings] = useState<any>(null);
  const [storeAddress, setStoreAddress] = useState<string>('');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeAmount, setChangeAmount] = useState('');
  const [isEditingSchedule, setIsEditingSchedule] = useState(true);
  const [isEditingPayment, setIsEditingPayment] = useState(false);

  // Custom Picker States
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [dateView, setDateView] = useState<'days' | 'months'>('days');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewDate, setViewDate] = useState(new Date());
  const [isNow, setIsNow] = useState(true);
  const [selectedTime, setSelectedTime] = useState('12:00 - 13:00');

  // Refs for click outside
  const datePickerRef = useRef<HTMLDivElement>(null);
  const timePickerRef = useRef<HTMLDivElement>(null);

  const [userData, setUserData] = useState<any>(null);
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  // Checkout States
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    cep: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    instructions: ''
  });

  const timeSlots = [
    '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00',
    '15:00 - 16:00', '16:00 - 17:00', '17:00 - 18:00',
    '18:00 - 19:00', '19:00 - 20:00'
  ];

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchStoreSettings();
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (savedCart.length === 0) {
      navigate('/cart');
      return;
    }
    setCartItems(savedCart);

    const savedForm = JSON.parse(localStorage.getItem('checkoutData') || '{}');
    if (savedForm.cep) setFormData(prev => ({ ...prev, ...savedForm }));
    if (savedForm.deliveryMethod) setDeliveryMethod(savedForm.deliveryMethod);
    if (savedForm.isNow !== undefined) setIsNow(savedForm.isNow);

    // Fetch logged-in user data
    const token = localStorage.getItem('userToken');
    if (token) {
      fetch(`${API_URL}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.ok ? res.json() : null)
        .then(user => {
          if (user) {
            setUserData(user);
            let addr: any = null;
            try { addr = user.delivery_address ? JSON.parse(user.delivery_address) : null; } catch { addr = null; }

            // Sanitiza o campo address para remover número e bairro que podem
            // ter sido embutidos pelo formato antigo ("Rua X, 412 - Emaús").
            let cleanAddress = (addr?.address || '').trim();
            if (addr?.number && cleanAddress.includes(`, ${addr.number}`)) {
              cleanAddress = cleanAddress.substring(0, cleanAddress.indexOf(`, ${addr.number}`));
            }
            if (addr?.neighborhood && cleanAddress.endsWith(` - ${addr.neighborhood}`)) {
              cleanAddress = cleanAddress.slice(0, -(` - ${addr.neighborhood}`).length);
            }
            cleanAddress = cleanAddress.replace(/[,\s]+$/, '').trim();

            setFormData(prev => ({
              ...prev,
              fullName: user.name || prev.fullName,
              phone: user.telefone || prev.phone,
              cep: addr?.cep || '',
              address: cleanAddress,
              number: addr?.number || '',
              complement: addr?.complement || '',
              neighborhood: addr?.neighborhood || '',
            }));
          }
        })
        .catch(() => null);
    }


    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setShowTimePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  async function fetchStoreSettings() {
    try {
      const data = await settingsApi.get();
      if (data) {
        setStoreSettings(data.payment_methods);
        if (data.address) setStoreAddress(data.address);
      }
    } catch {
      setStoreSettings({ pix: { enabled: false }, card: { enabled: false }, money: { enabled: false } });
      toast.error('Nao foi possivel carregar as formas de pagamento.');
    }
  }

  const formatCEP = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 8);
    if (cleanValue.length > 5) {
      return `${cleanValue.slice(0, 5)}-${cleanValue.slice(5)}`;
    }
    return cleanValue;
  };

  const formatPhone = (value: string) => {
    const cleanValue = value.replace(/\D/g, '').slice(0, 11);
    if (cleanValue.length > 6) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2, 7)}-${cleanValue.slice(7)}`;
    } else if (cleanValue.length > 2) {
      return `(${cleanValue.slice(0, 2)}) ${cleanValue.slice(2)}`;
    } else if (cleanValue.length > 0) {
      return `(${cleanValue}`;
    }
    return cleanValue;
  };

  const formatCurrency = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    const amount = parseInt(cleanValue || '0') / 100;
    const finalAmount = Math.min(amount, 5000);

    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(finalAmount);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // Fecha os seletores ao começar a preencher outros campos para economizar tela
    setShowDatePicker(false);
    setShowTimePicker(false);
    setIsEditingSchedule(false);

    if (name === 'cep') {
      const formatted = formatCEP(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      const cleanCep = formatted.replace(/\D/g, '');
      if (cleanCep.length === 8) handleCepLookup(cleanCep);
    } else if (name === 'phone') {
      setFormData(prev => ({ ...prev, [name]: formatPhone(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCepLookup = async (cep: string) => {
    toast.loading('Buscando endereço...', { id: 'cep' });
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
        }));
        toast.success('Endereço encontrado!', { id: 'cep' });
      } else {
        toast.error('CEP não encontrado.', { id: 'cep' });
      }
    } catch (e) {
      toast.error('Erro ao buscar CEP.', { id: 'cep' });
    }
  };

  const calculateTotal = () => {
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const deliveryFee = deliveryMethod === 'entrega' ? 5.00 : 0;
    return subtotal + deliveryFee;
  };

  const handleFinishOrder = async () => {
    const name = userData?.name || formData.fullName;
    const phone = userData?.telefone || formData.phone;

    if (!name) { toast.error('Informe seu nome completo'); return; }
    if (!phone) { toast.error('Informe um telefone válido'); return; }

    if (deliveryMethod === 'entrega') {
      if (!formData.cep || !formData.address || !formData.number || !formData.neighborhood) {
        toast.error('Preencha todos os campos obrigatórios do endereço');
        return;
      }
    }
    if (!paymentMethod) { toast.error('Selecione uma forma de pagamento'); return; }

    if (saveAsDefault && deliveryMethod === 'entrega' && formData.cep.replace(/\D/g, '').length === 8) {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          await fetch(`${API_URL}/users/me`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              delivery_address: JSON.stringify({
                cep: formData.cep,
                address: formData.address,
                number: formData.number,
                complement: formData.complement,
                neighborhood: formData.neighborhood,
              }),
            }),
          });
          toast.success('Endereço salvo como padrão!');
        } catch {
          toast.error('Não foi possível salvar o endereço padrão.');
        }
      }
    }

    const orderTime = isNow ? 'Agora' : `${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}`;

    localStorage.setItem('checkoutData', JSON.stringify({
      ...formData,
      fullName: name,
      phone,
      paymentMethod,
      deliveryMethod,
      date: selectedDate.toLocaleDateString('pt-BR'),
      time: selectedTime,
      isNow,
      orderTime,
      needsChange,
      changeAmount: needsChange ? changeAmount : null
    }));
    navigate('/confirmation');
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fullMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const hasIdentity = !!(userData || (formData.fullName && formData.phone.length >= 14));
  const isStep1Complete = hasIdentity && (deliveryMethod === 'retirada'
    ? true
    : !!(formData.address && formData.cep && formData.number && formData.neighborhood));

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <main className="max-w-7xl mx-auto px-4 md:px-16 pt-6 pb-28 md:pb-32 md:py-12">
        <div className="flex items-center justify-between mb-8 md:mb-10 lg:max-w-2xl lg:mx-auto">
          <Link to="/cart" className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-gray-900 hover:bg-gray-900 hover:text-white transition-all border border-gray-100 group shadow-none">
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>

          <h1 className="text-xl md:text-2xl font-display font-semibold text-gray-900 tracking-tight">Checkout</h1>

          <div className="w-10" />
        </div>

<div className="pt-4"></div>

        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in relative">
          <section className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="p-1.5 flex gap-2">
              <button onClick={() => setDeliveryMethod('entrega')} className={`flex-1 py-2 px-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'entrega' ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>
                <Truck className="w-5 h-5" /> Entrega
              </button>
              <button onClick={() => setDeliveryMethod('retirada')} className={`flex-1 py-2 px-4 rounded-xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${deliveryMethod === 'retirada' ? 'bg-primary text-white shadow-lg shadow-indigo-100' : 'text-gray-400 bg-gray-50 hover:bg-gray-100'}`}>
                <Store className="w-5 h-5" /> Retirada
              </button>
            </div>
          </section>

          {/* Seção de Agendamento - Oculto para testes
          <section className={`bg-white rounded-xl border border-gray-100 ${isEditingSchedule ? 'p-5 md:p-6' : 'p-4'} relative ${(showDatePicker || showTimePicker) ? 'z-90' : 'z-10'} transition-all`}>
            <div className={`flex justify-between items-center ${isEditingSchedule ? 'mb-4' : 'mb-2'}`}>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2">
                Quando deseja receber?
              </h2>
            </div>

            {isEditingSchedule ? (
              <>
                <div className={`flex gap-2 ${isNow ? 'mb-0' : 'mb-6'}`}>
                  <button onClick={() => { setIsNow(true); setIsEditingSchedule(false); }} className={`flex-1 py-2 rounded-xl text-base font-medium border transition-all ${isNow ? 'bg-primary border-primary text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Pra agora</button>
                  <button onClick={() => setIsNow(false)} className={`flex-1 py-2 rounded-xl text-base font-medium border transition-all ${!isNow ? 'bg-primary border-primary text-white shadow-lg shadow-indigo-100' : 'bg-gray-50 border-gray-100 text-gray-400'}`}>Agendar</button>
                </div>

                {!isNow && (
                  <div className="space-y-4 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  <div className="relative" ref={datePickerRef}>
                    <label className="text-base font-display font-medium text-gray-400 mb-1 block">Data</label>
                    <button
                      onClick={() => { setShowDatePicker(!showDatePicker); setShowTimePicker(false); }}
                      className={`w-full flex items-center justify-between py-3 px-4 bg-white border-2 rounded-xl text-base font-medium text-gray-800 shadow-sm transition-all ${showDatePicker ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-primary/20'}`}
                    >
                      {selectedDate.toLocaleDateString('pt-BR')}
                      <Calendar className="w-5 h-5 text-primary" />
                    </button>

                    {showDatePicker && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-100 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up md:w-[320px]">
                        <div className="p-4">
                          {dateView === 'days' ? (
                            <>
                              <div className="flex items-center justify-between mb-4">
                                <button onClick={handlePrevMonth} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronLeft className="w-4 h-4" /></button>
                                <button onClick={() => setDateView('months')} className="text-sm font-bold text-gray-800 flex items-center gap-1">
                                  {fullMonths[viewDate.getMonth()]} {viewDate.getFullYear()} <ChevronDown className="w-3 h-3 text-primary" />
                                </button>
                                <button onClick={handleNextMonth} className="p-1.5 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronRight className="w-4 h-4" /></button>
                              </div>
                              <div className="grid grid-cols-7 text-center mb-2">
                                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => <span key={day} className="text-[9px] font-bold text-gray-300">{day}</span>)}
                              </div>
                              <div className="grid grid-cols-7 gap-1 text-center">
                                {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                                {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                                  const day = i + 1;
                                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear();
                                  return <button key={day} onClick={() => { setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day)); setShowDatePicker(false); if(selectedTime) setIsEditingSchedule(false); }} className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${isSelected ? 'bg-primary text-white shadow-md shadow-indigo-100' : 'text-gray-700 hover:bg-gray-50'}`}>{day}</button>;
                                })}
                              </div>
                            </>
                          ) : (
                            <div className="animate-fade-in">
                              <div className="text-sm font-black text-gray-800 mb-4 text-center">{viewDate.getFullYear()}</div>
                              <div className="grid grid-cols-3 gap-2">
                                {months.map((month, idx) => (
                                  <button key={month} onClick={() => { setViewDate(new Date(viewDate.getFullYear(), idx, 1)); setDateView('days'); }} className={`py-2 rounded-xl text-[10px] font-black transition-all ${viewDate.getMonth() === idx ? 'bg-primary text-white shadow-md shadow-indigo-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}>{month}</button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="relative" ref={timePickerRef}>
                    <label className="text-base font-display font-medium text-gray-400 mb-1 block">Horário</label>
                    <button
                      onClick={() => { setShowTimePicker(!showTimePicker); setShowDatePicker(false); }}
                      className={`w-full flex items-center justify-between py-3 px-4 bg-white border-2 rounded-xl text-base font-medium text-gray-800 shadow-sm transition-all ${showTimePicker ? 'border-primary ring-4 ring-primary/10' : 'border-gray-100 hover:border-primary/20'}`}
                    >
                      {selectedTime}
                    </button>

                    {showTimePicker && (
                      <div className="absolute top-full left-0 right-0 mt-2 z-100 bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden animate-slide-up max-h-[320px] overflow-y-auto no-scrollbar">
                        <div className="p-3 grid grid-cols-1 gap-1.5">
                          {timeSlots.map((time) => (
                            <button
                              key={time}
                              onClick={() => { setSelectedTime(time); setShowTimePicker(false); setIsEditingSchedule(false); }}
                              className={`w-full py-3 px-4 rounded-xl text-sm font-bold text-left transition-all ${selectedTime === time ? 'bg-primary/10 text-primary border-l-4 border-primary' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              {time}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div 
                onClick={() => setIsEditingSchedule(true)}
                className="flex items-center gap-4 animate-fade-in p-1 text-left cursor-pointer group"
              >
                <div className="w-11 h-11 rounded-xl bg-gray-50 flex items-center justify-center text-gray-900 shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 leading-tight">
                    {isNow ? 'Receber agora' : 'Entrega Agendada'}
                  </p>
                  {!isNow && (
                    <p className="text-sm text-gray-500 font-medium">
                      {selectedDate.toLocaleDateString('pt-BR')} às {selectedTime}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-all" />
              </div>
            )}
          </section>
          */}

          {/* Card de dados do usuário logado */}
          {userData && (
            <section className="bg-white rounded-xl border border-gray-100 p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Seus dados</p>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base leading-tight truncate">{userData.name}</p>
                  <p className="text-sm text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {userData.telefone || 'Sem telefone cadastrado'}
                  </p>
                </div>
              </div>
            </section>
          )}

          {deliveryMethod === 'retirada' ? (
            <section className="bg-white rounded-xl border border-gray-100 p-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">Local de retirada</h2>
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-base leading-tight">Retirada na loja</p>
                  <p className="text-sm text-gray-400 font-medium mt-0.5 truncate">
                    {storeAddress || 'Endereço não configurado'}
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 relative z-0">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Endereço de entrega</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2.5">
                  <div className="grid grid-cols-2 gap-2.5">
                    <input name="cep" value={formData.cep} onChange={handleInputChange} onFocus={() => { setShowDatePicker(false); setShowTimePicker(false); }} placeholder="CEP*" className="w-full bg-white border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 rounded-xl py-3 px-4 text-base font-display font-medium text-gray-700 placeholder:text-gray-400 transition-all shadow-sm" maxLength={9} />
                    <input name="number" value={formData.number} onChange={handleInputChange} onFocus={() => { setShowDatePicker(false); setShowTimePicker(false); }} placeholder="Número *" className="w-full bg-white border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 rounded-xl py-3 px-4 text-base font-display font-medium text-gray-700 placeholder:text-gray-400 transition-all shadow-sm" />
                  </div>
                  <input name="address" value={formData.address} onChange={handleInputChange} onFocus={() => { setShowDatePicker(false); setShowTimePicker(false); }} placeholder="Rua / Avenida *" className="w-full bg-white border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 rounded-xl py-3 px-4 text-base font-display font-medium text-gray-700 placeholder:text-gray-400 transition-all shadow-sm" />
                  <input name="complement" value={formData.complement} onChange={handleInputChange} onFocus={() => { setShowDatePicker(false); setShowTimePicker(false); }} placeholder="Complemento / Apartamento" className="w-full bg-white border border-gray-200/60 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 rounded-xl py-3 px-4 text-base font-display font-medium text-gray-700 placeholder:text-gray-400 transition-all shadow-sm" />
                </div>
                {userData && (
                  <label className="flex items-center gap-3 cursor-pointer group select-none">
                    <div
                      onClick={() => setSaveAsDefault(v => !v)}
                      className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${saveAsDefault ? 'bg-primary border-primary' : 'border-gray-300 bg-white group-hover:border-primary/40'}`}
                    >
                      {saveAsDefault && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-gray-600">Salvar como endereço padrão</span>
                  </label>
                )}
              </div>
            </section>
          )}

          <section className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 relative z-0 text-left transition-all">
            <div className="flex justify-between items-center text-left mb-2">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 text-left">Forma de pagamento</h2>
            </div>
            {!paymentMethod ? (
              <button
                onClick={() => setIsEditingPayment(true)}
                className="w-full flex items-center justify-between p-4 mt-4 rounded-xl border-2 border-gray-50 hover:bg-gray-50 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-base font-semibold text-gray-600">Selecionar forma de pagamento</span>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
              </button>
            ) : (
              <div
                onClick={() => setIsEditingPayment(true)}
                className="flex items-center gap-4 animate-fade-in py-2 cursor-pointer group text-left mt-2 rounded-xl border border-transparent hover:border-gray-50 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl bg-indigo-50/50 flex items-center justify-center text-primary shrink-0 transition-colors group-hover:bg-indigo-50">
                  {paymentMethod === 'card' && <CreditCard className="w-6 h-6" />}
                  {paymentMethod === 'pix' && <svg className="w-6 h-6 fill-current" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg"><path d="M306.4 356.5C311.8 351.1 321.1 351.1 326.5 356.5L403.5 433.5C417.7 447.7 436.6 455.5 456.6 455.5L471.7 455.5L374.6 552.6C344.3 582.1 295.1 582.1 264.8 552.6L167.3 455.2L176.6 455.2C196.6 455.2 215.5 447.4 229.7 433.2L306.4 356.5zM326.5 282.9C320.1 288.4 311.9 288.5 306.4 282.9L229.7 206.2C215.5 191.1 196.6 184.2 176.6 184.2L167.3 184.2L264.7 86.8C295.1 56.5 344.3 56.5 374.6 86.8L471.8 183.9L456.6 183.9C436.6 183.9 417.7 191.7 403.5 205.9L326.5 282.9zM176.6 206.7C190.4 206.7 203.1 212.3 213.7 222.1L290.4 298.8C297.6 305.1 307 309.6 316.5 309.6C325.9 309.6 335.3 305.1 342.5 298.8L419.5 221.8C429.3 212.1 442.8 206.5 456.6 206.5L494.3 206.5L552.6 264.8C582.9 295.1 582.9 344.3 552.6 374.6L494.3 432.9L456.6 432.9C442.8 432.9 429.3 427.3 419.5 417.5L342.5 340.5C328.6 326.6 304.3 326.6 290.4 340.6L213.7 417.2C203.1 427 190.4 432.6 176.6 432.6L144.8 432.6L86.8 374.6C56.5 344.3 56.5 295.1 86.8 264.8L144.8 206.7L176.6 206.7z" /></svg>}
                  {paymentMethod === 'money' && <Banknote className="w-7 h-7" />}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-gray-900 leading-tight text-base md:text-lg">
                    {paymentMethod === 'pix' ? 'PIX' : paymentMethod === 'card' ? 'Cartão' : 'Dinheiro'}
                  </p>
                  {paymentMethod === 'money' && (
                    <p className="text-sm text-gray-400 font-medium mt-1">
                      {needsChange && changeAmount ? `Troco para R$ ${changeAmount}` : needsChange ? 'Troco solicitado' : 'Sem troco'}
                    </p>
                  )}
                  {paymentMethod === 'card' && (
                    <p className="text-sm text-gray-400 font-medium mt-1">Débito ou Crédito na entrega</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary transition-all" />
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Payment Options Modal */}
      {isEditingPayment && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center p-0 md:p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setIsEditingPayment(false)}
          />
          <div className="relative w-full md:max-w-md bg-white rounded-t-[2.5rem] md:rounded-3xl p-6 shadow-2xl animate-slide-up pb-10 md:pb-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 shrink-0">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">Forma de Pagamento</h2>
              <button 
                    onClick={() => setIsEditingPayment(false)}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 hover:bg-gray-100 text-gray-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3 overflow-y-auto no-scrollbar flex-1 pb-4">
              {/* PIX */}
              <button
                onClick={() => storeSettings?.pix?.enabled !== false && setPaymentMethod('pix')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'pix' ? 'border-primary bg-indigo-50/10' : 'border-gray-50 hover:bg-gray-50'
                  } ${storeSettings?.pix?.enabled === false ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${paymentMethod === 'pix' ? 'text-primary' : 'text-gray-400'}`}>
                    <svg className="w-7 h-7 fill-current" viewBox="0 0 640 640" xmlns="http://www.w3.org/2000/svg"><path d="M306.4 356.5C311.8 351.1 321.1 351.1 326.5 356.5L403.5 433.5C417.7 447.7 436.6 455.5 456.6 455.5L471.7 455.5L374.6 552.6C344.3 582.1 295.1 582.1 264.8 552.6L167.3 455.2L176.6 455.2C196.6 455.2 215.5 447.4 229.7 433.2L306.4 356.5zM326.5 282.9C320.1 288.4 311.9 288.5 306.4 282.9L229.7 206.2C215.5 191.1 196.6 184.2 176.6 184.2L167.3 184.2L264.7 86.8C295.1 56.5 344.3 56.5 374.6 86.8L471.8 183.9L456.6 183.9C436.6 183.9 417.7 191.7 403.5 205.9L326.5 282.9zM176.6 206.7C190.4 206.7 203.1 212.3 213.7 222.1L290.4 298.8C297.6 305.1 307 309.6 316.5 309.6C325.9 309.6 335.3 305.1 342.5 298.8L419.5 221.8C429.3 212.1 442.8 206.5 456.6 206.5L494.3 206.5L552.6 264.8C582.9 295.1 582.9 344.3 552.6 374.6L494.3 432.9L456.6 432.9C442.8 432.9 429.3 427.3 419.5 417.5L342.5 340.5C328.6 326.6 304.3 326.6 290.4 340.6L213.7 417.2C203.1 427 190.4 432.6 176.6 432.6L144.8 432.6L86.8 374.6C56.5 344.3 56.5 295.1 86.8 264.8L144.8 206.7L176.6 206.7z" /></svg>
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-base font-semibold ${paymentMethod === 'pix' ? 'text-gray-900' : 'text-gray-700'}`}>PIX {storeSettings?.pix?.enabled === false && '(Indisponível)'}</span>
                    <span className="text-xs text-gray-400 font-medium">Aprovação imediata</span>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'pix' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                   {paymentMethod === 'pix' && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* CARD */}
              <button
                onClick={() => storeSettings?.card?.enabled !== false && setPaymentMethod('card')}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-primary bg-indigo-50/10' : 'border-gray-50 hover:bg-gray-50'
                  } ${storeSettings?.card?.enabled === false ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`${paymentMethod === 'card' ? 'text-primary' : 'text-gray-400'}`}>
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className={`text-base font-semibold ${paymentMethod === 'card' ? 'text-gray-900' : 'text-gray-700'}`}>Cartão na Entrega {storeSettings?.card?.enabled === false && '(Indisponível)'}</span>
                    
                    {/* Visual Card Brands (Bandeiras) */}
                    <div className={`flex items-center gap-1.5 mt-1.5 transition-opacity ${paymentMethod === 'card' ? 'opacity-100' : 'opacity-60'}`}>
                      <div className="w-8 h-5 rounded-[4px] bg-blue-600 flex items-center justify-center text-[7px] text-white font-bold italic tracking-tighter shadow-sm border border-black/5">VISA</div>
                      <div className="w-8 h-5 rounded-[4px] bg-gray-900 flex items-center justify-center text-[7px] text-white font-bold tracking-tighter shadow-sm border border-black/5 relative overflow-hidden">
                        <div className="absolute w-3 h-3 rounded-full bg-red-500 opacity-90 -left-0.5"></div>
                        <div className="absolute w-3 h-3 rounded-full bg-yellow-400 opacity-90 left-1.5"></div>
                      </div>
                      <div className="w-8 h-5 rounded-[4px] bg-black flex items-center justify-center text-[8px] text-white font-bold tracking-tight shadow-sm border border-black/5">elo</div>
                      <div className="w-8 h-5 rounded-[4px] bg-blue-500 flex items-center justify-center text-[7px] text-white font-bold tracking-wider shadow-sm border border-black/5">AMEX</div>
                    </div>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${paymentMethod === 'card' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                   {paymentMethod === 'card' && <Check className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>

              {/* MONEY */}
              <div className="space-y-2">
                <button
                  onClick={() => storeSettings?.money?.enabled !== false && setPaymentMethod('money')}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${paymentMethod === 'money' ? 'border-primary bg-indigo-50/10' : 'border-gray-50 hover:bg-gray-50'
                    } ${storeSettings?.money?.enabled === false ? 'opacity-40 grayscale cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <div className={`${paymentMethod === 'money' ? 'text-primary' : 'text-gray-400'}`}>
                      <Banknote className="w-7 h-7" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`text-base font-semibold ${paymentMethod === 'money' ? 'text-gray-900' : 'text-gray-700'}`}>Dinheiro {storeSettings?.money?.enabled === false && '(Indisponível)'}</span>
                      <span className="text-xs text-gray-400 font-medium">Pagamento no local</span>
                    </div>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${paymentMethod === 'money' ? 'border-primary bg-primary' : 'border-gray-200'}`}>
                     {paymentMethod === 'money' && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                </button>

                {/* Change Options - Inline inside the modal when Money is active */}
                {paymentMethod === 'money' && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-xl space-y-4 animate-fade-in border border-gray-100">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div onClick={() => setNeedsChange(!needsChange)} className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center ${needsChange ? 'bg-primary border-primary' : 'border-gray-300 bg-white group-hover:border-primary/30'}`}>
                        {needsChange && <Check className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-base font-medium text-gray-800">Precisa de troco?</span>
                    </label>

                    {needsChange && (
                      <div className="space-y-2 animate-slide-up pl-9">
                        <p className="text-sm font-medium text-gray-500">Troco para quanto?</p>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-base">R$</span>
                          <input
                            type="text"
                            inputMode="decimal"
                            placeholder="0,00"
                            value={changeAmount}
                            onChange={(e) => setChangeAmount(formatCurrency(e.target.value))}
                            className="w-full bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary rounded-xl py-3 px-4 pl-12 text-base font-semibold text-gray-800 transition-all shadow-sm"
                          />
                        </div>
                        <p className="text-xs text-primary font-medium mt-1">* O valor do pedido é {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 shrink-0 border-t border-gray-100 mt-2">
              <button 
                disabled={!paymentMethod}
                onClick={() => setIsEditingPayment(false)} 
                className={`w-full font-bold py-4 rounded-xl text-lg transition-all shadow-none ${paymentMethod ? 'bg-primary text-white active:scale-95' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 md:p-6 z-60">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex flex-col text-left">
            <span className="text-sm md:text-base text-gray-500 font-medium tracking-tight text-left">Total Final</span>
            <span className="text-xl md:text-2xl font-display font-semibold text-primary tracking-tight text-left">{calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
          </div>
          <button onClick={handleFinishOrder} disabled={!paymentMethod || !isStep1Complete} className={`flex-1 h-14 rounded-full font-medium text-lg transition-all ${paymentMethod && isStep1Complete ? 'bg-primary text-white hover:brightness-110 active:scale-95 shadow-none' : 'bg-gray-100/50 text-gray-400 cursor-not-allowed shadow-none'}`}>Próximo</button>
        </div>
      </footer>
    </div>
  );
}
