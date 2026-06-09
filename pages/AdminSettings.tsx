import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Save, Clock, CreditCard, Bell, User, Trash2, Smartphone, Globe, X } from 'lucide-react';
import { settingsApi } from '../services/api';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';

type TabType = 'profile' | 'hours' | 'payments' | 'notifications';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Crop States
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Unified State for all settings
  const [settings, setSettings] = useState({
    store_name: 'Ateliê do Doce',
    phone: '(84) 98656-1077',
    address: 'Av. Rio Grande do Norte, 402 - Cidade da Esperança',
    logo_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1rhl7DWNp6yAPLEq1RDEaENovXvdNDPfQQfhksRCU6bNlWosvPIj1dSxFTlf2VXJP8xfu2dsY_qQptn4AaVMldJ1OjyNn03heKPuWsWGG4qeCgOWdJV0D-_SskzaHvlztDi48B48vkJj1t2znZPMJtJLH08TDM4PnpTlo5109ji4itHakcJjDgIoH-DjTyvwCxWZ0JSvAFcZZPRfgyStQDfDzJMP7VkMN1dBBsDtWEdhhpjqZv7vFv42XFhaAH6VzSz95OuG6izQS',
    opening_hours: {
      'Segunda-feira': { open: '08:00', close: '18:00', enabled: true },
      'Terça-feira': { open: '08:00', close: '18:00', enabled: true },
      'Quarta-feira': { open: '08:00', close: '18:00', enabled: true },
      'Quinta-feira': { open: '08:00', close: '18:00', enabled: true },
      'Sexta-feira': { open: '08:00', close: '18:00', enabled: true },
      'Sábado': { open: '08:00', close: '18:00', enabled: true },
      'Domingo': { open: '00:00', close: '00:00', enabled: false },
    },
    payment_methods: {
      pix: { enabled: true, key: '' },
      card: { enabled: true },
      money: { enabled: true }
    },
    notifications: {
      browser: true,
      telegram: false,
      whatsapp: false,
      telegram_chat_id: ''
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    setFetching(true);
    try {
      const data = await settingsApi.get();
      setSettings(prev => ({
        ...prev,
        store_name: data.store_name || prev.store_name,
        phone: data.phone || prev.phone,
        address: data.address || prev.address,
        logo_url: data.logo_url || prev.logo_url,
        opening_hours: data.opening_hours || prev.opening_hours,
        payment_methods: data.payment_methods || prev.payment_methods,
        notifications: data.notifications || prev.notifications,
      }));
    } catch {
      toast.error('Erro ao carregar configuraÃ§Ãµes');
    } finally {
      setFetching(false);
    }
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await settingsApi.update(settings);
      toast.success('Todas as alterações foram salvas!');
    } catch {
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value });
  };

  const updateOpeningHour = (day: string, field: 'open' | 'close' | 'enabled', value: any) => {
    setSettings(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: { ...(prev.opening_hours as any)[day], [field]: value }
      }
    }));
  };

  const updatePayment = (method: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      payment_methods: {
        ...prev.payment_methods,
        [method]: { ...(prev.payment_methods as any)[method], [field]: value }
      }
    }));
  };

  const updateNotify = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: { ...prev.notifications, [field]: value }
    }));
  };

  // IMAGE CROP & UPLOAD LOGIC
  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const createCroppedImage = async () => {
    try {
      if (!imageToCrop || !croppedAreaPixels) return;
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);

      await uploadLogo(croppedImageBase64);
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao recortar imagem');
    }
  };

  const uploadLogo = async (logoData: string) => {
    const toastId = toast.loading('Enviando logo...');

    try {
      const { logo_url } = await settingsApi.uploadLogo(logoData);
      setSettings(prev => ({ ...prev, logo_url }));
      toast.success('Logo atualizada!', { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error('Erro no upload da logo.', { id: toastId });
    }
  };

  // Helper function to crop image
  async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<string> {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.addEventListener('load', () => resolve(img));
      img.addEventListener('error', (error) => reject(error));
      img.setAttribute('crossOrigin', 'anonymous');
      img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return '';

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  }

  if (fetching) return <div className="p-20 text-center animate-pulse text-primary font-semibold text-lg">Carregando configurações...</div>;

  return (
    <div className="max-w-5xl mx-auto py-4 pt-12 px-4 md:px-8 animate-fade-in pb-32">


      {/* Modern Tabs Menu */}
      <div className="flex justify-start md:justify-center mb-8 -mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto no-scrollbar">
        <div className="inline-flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-100/50 backdrop-blur-sm shadow-inner shrink-0">
          {[
            { id: 'profile', label: 'Perfil', icon: User },
            { id: 'hours', label: 'Horários', icon: Clock },
            { id: 'payments', label: 'Pagamentos', icon: CreditCard },
            { id: 'notifications', label: 'Notificações', icon: Bell },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 md:py-3 rounded-xl transition-all duration-300 whitespace-nowrap ${activeTab === tab.id
                ? 'bg-white text-primary shadow-lg shadow-indigo-100/50 scale-105 z-10'
                : 'text-gray-400 hover:text-gray-600 font-medium hover:bg-white/50'
                }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="min-h-[400px]">
        {/* TAB: PROFILE - REDESIGNED */}
        {activeTab === 'profile' && (
          <div className="space-y-8 animate-slide-up max-w-4xl mx-auto">
            {/* Logo Section */}
            <section className="bg-white p-8 md:p-10 rounded-xl border border-gray-100 shadow-xl shadow-gray-100/50 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-linear-to-br from-indigo-50 to-transparent rounded-bl-full -mr-16 -mt-16 opacity-50 pointer-events-none" />

              <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                <div className="relative">
                  <div className="w-40 h-40 rounded-full bg-gray-50 flex items-center justify-center overflow-hidden border-4 border-white shadow-2xl shadow-gray-100 group-hover:scale-105 transition-transform duration-500 relative">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} className="w-full h-full object-cover" alt="Logo" />
                    ) : (
                      <Camera className="text-gray-300 w-12 h-12" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="logo-upload"
                      onChange={handleImageChange}
                    />
                  </div>
                  <button
                    onClick={() => document.getElementById('logo-upload')?.click()}
                    className="absolute -bottom-1 -right-1 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 hover:scale-110 hover:rotate-3 transition-all cursor-pointer border-4 border-white z-20"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 text-center md:text-left space-y-4">
                  <div>
                    <h2 className="text-gray-900 text-lg font-semibold mb-1 font-display">Identidade Visual</h2>
                    <p className="text-gray-500 text-base">Essa é a imagem que seus clientes verão em todos os lugares.</p>
                  </div>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={() => setSettings({ ...settings, logo_url: '' })}
                      className="px-6 py-2.5 bg-gray-50 text-gray-500 text-base leading-relaxed rounded-xl hover:bg-red-50 hover:text-red-500 transition-all flex items-center gap-2 group/del"
                    >
                      <Trash2 className="w-4 h-4 group-hover/del:scale-110 transition-transform" /> Remover Logo
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Inputs Section */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nome da Loja */}
              <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm focus-within:shadow-lg focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
                <div className="p-6">
                  <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-3 block">Nome da Loja</label>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      name="store_name"
                      value={settings.store_name}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-gray-800 text-base leading-relaxed p-0 focus:ring-0 placeholder:text-gray-300"
                      placeholder="Ex: Ateliê do Doce"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* WhatsApp */}
              <div className="bg-white p-1 rounded-xl border border-gray-100 shadow-sm focus-within:shadow-lg focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
                <div className="p-6">
                  <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-3 block">WhatsApp de Vendas</label>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <input
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-gray-800 text-base leading-relaxed p-0 focus:ring-0 placeholder:text-gray-300"
                      placeholder="(00) 00000-0000"
                      type="text"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço - Full Width */}
              <div className="md:col-span-2 bg-white p-1 rounded-xl border border-gray-100 shadow-sm focus-within:shadow-lg focus-within:border-indigo-100 focus-within:ring-4 focus-within:ring-indigo-50 transition-all duration-300">
                <div className="p-6">
                  <label className="text-gray-500 text-xs font-semibold  tracking-wider mb-3 block">Endereço da Sede</label>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0 mt-1">
                      <Globe className="w-5 h-5" />
                    </div>
                    <textarea
                      name="address"
                      value={settings.address}
                      onChange={handleInputChange}
                      className="w-full bg-transparent border-none text-gray-900 text-base leading-relaxed p-0 focus:ring-0 placeholder:text-gray-300 min-h-[80px] resize-none"
                      rows={3}
                      placeholder="Rua, Número, Bairro, Cidade - UF"
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* TAB: HOURS - REDESIGNED */}
        {activeTab === 'hours' && (
          <div className="animate-slide-up max-w-3xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 bg-purple-50 p-6 rounded-xl border border-purple-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-purple-500 shadow-sm"><Clock className="w-6 h-6" /></div>
                <div>
                  <h2 className="text-gray-900 text-lg font-semibold font-display">Grade de Funcionamento</h2>
                  <p className="text-gray-500 text-base leading-relaxed">Defina quando sua loja está aberta para pedidos.</p>
                </div>
              </div>
              <button
                onClick={() => {
                  const first = settings.opening_hours['Segunda-feira'];
                  const newHours = { ...settings.opening_hours };
                  Object.keys(newHours).forEach(day => {
                    newHours[day as keyof typeof settings.opening_hours] = { ...first };
                  });
                  setSettings({ ...settings, opening_hours: newHours });
                  toast.success('Horários replicados para a semana!');
                }}
                className="text-primary text-base leading-relaxed hover:bg-white hover:px-4 hover:py-2 hover:rounded-xl transition-all"
              >
                Copiar para Todos os Dias
              </button>
            </div>

            <div className="space-y-3">
              {Object.entries(settings.opening_hours).map(([day, data]: [string, any]) => (
                <div key={day} className={`group flex flex-col sm:flex-row items-center justify-between p-5 rounded-xl border transition-all duration-300 ${data.enabled ? 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-indigo-100' : 'bg-gray-50 border-transparent opacity-60 grayscale'}`}>
                  <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-base transition-colors ${data.enabled ? 'bg-indigo-50 text-primary' : 'bg-gray-200 text-gray-400'}`}>
                      {day.substring(0, 3)}
                    </div>
                    <span className="text-gray-900 text-base leading-relaxed">{day}</span>
                  </div>

                  <div className="flex items-center gap-4 bg-gray-50 p-1.5 rounded-xl">
                    <input
                      disabled={!data.enabled}
                      className="bg-white border-none rounded-none p-2 text-base text-center w-24 focus:ring-2 focus:ring-primary disabled:bg-transparent"
                      type="time"
                      value={data.open}
                      onChange={(e) => updateOpeningHour(day, 'open', e.target.value)}
                    />
                    <span className="text-gray-300">-</span>
                    <input
                      disabled={!data.enabled}
                      className="bg-white border-none rounded-none p-2 text-base text-center w-24 focus:ring-2 focus:ring-primary disabled:bg-transparent"
                      type="time"
                      value={data.close}
                      onChange={(e) => updateOpeningHour(day, 'close', e.target.value)}
                    />
                  </div>

                  <div className="ml-4">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={data.enabled} onChange={(e) => updateOpeningHour(day, 'enabled', e.target.checked)} />
                      <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB: PAYMENTS - REDESIGNED */}
        {activeTab === 'payments' && (
          <div className="space-y-8 animate-slide-up max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-gray-900 text-2xl mb-2 font-display">Métodos de Pagamento</h3>
              <p className="text-gray-500 text-base leading-relaxed">Escolha como seus clientes podem pagar.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PIX */}
              <div className={`relative p-5 rounded-xl border border-gray-100 transition-all duration-300 cursor-pointer group ${settings.payment_methods.pix.enabled ? 'bg-white border-primary shadow-xl shadow-indigo-100 transform -translate-y-1' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                <div className="absolute top-4 right-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.payment_methods.pix.enabled} onChange={(e) => updatePayment('pix', 'enabled', e.target.checked)} />
                    <div className="w-10 h-6 bg-gray-100 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 text-white flex items-center justify-center font-semibold text-lg mb-4 shadow-lg shadow-emerald-200">PIX</div>

                <h4 className="text-gray-900 text-base font-semibold mb-1">PIX Instantâneo</h4>
                <p className="text-gray-500 text-sm leading-relaxed mb-4">Pagamento automático e aprovação imediata.</p>

                <div className={`transition-all duration-300 overflow-hidden ${settings.payment_methods.pix.enabled ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <input
                    placeholder="Chave PIX (CPF/Email)"
                    className="w-full bg-gray-50 border-none rounded-xl p-2.5 text-sm leading-relaxed focus:ring-2 focus:ring-primary placeholder:text-gray-300"
                    value={settings.payment_methods.pix.key}
                    onChange={(e) => updatePayment('pix', 'key', e.target.value)}
                  />
                </div>
              </div>

              {/* CARD */}
              <div className={`relative p-5 rounded-xl border border-gray-100 transition-all duration-300 cursor-pointer group ${settings.payment_methods.card.enabled ? 'bg-white border-orange-400 shadow-xl shadow-orange-100 transform -translate-y-1' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                <div className="absolute top-4 right-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.payment_methods.card.enabled} onChange={(e) => updatePayment('card', 'enabled', e.target.checked)} />
                    <div className="w-10 h-6 bg-gray-100 rounded-full peer peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-orange-400 to-red-500 text-white flex items-center justify-center mb-4 shadow-lg shadow-orange-200"><CreditCard className="w-6 h-6" /></div>

                <h4 className="text-gray-900 text-base font-semibold mb-1">Cartão na Entrega</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Levamos a maquineta até o cliente no momento da entrega.</p>
              </div>

              {/* MONEY */}
              <div className={`relative p-5 rounded-xl border border-gray-100 transition-all duration-300 cursor-pointer group ${settings.payment_methods.money.enabled ? 'bg-white border-blue-500 shadow-xl shadow-blue-100 transform -translate-y-1' : 'bg-white border-gray-100 hover:border-gray-200'}`}>
                <div className="absolute top-4 right-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.payment_methods.money.enabled} onChange={(e) => updatePayment('money', 'enabled', e.target.checked)} />
                    <div className="w-10 h-6 bg-gray-100 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                  </label>
                </div>

                <div className="w-12 h-12 rounded-xl bg-linear-to-br from-blue-400 to-indigo-600 text-white flex items-center justify-center font-semibold text-xl mb-4 shadow-lg shadow-blue-200">$</div>

                <h4 className="text-gray-900 text-base font-semibold mb-1">Dinheiro</h4>
                <p className="text-gray-500 text-sm leading-relaxed">Pagamento em espécie no ato da entrega.</p>
              </div>
            </div>
          </div>
        )}

        {/* TAB: NOTIFICATIONS - REDESIGNED */}
        {activeTab === 'notifications' && (
          <div className="space-y-8 animate-slide-up max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h3 className="text-gray-900 text-2xl mb-2 font-display">Central de Alertas</h3>
              <p className="text-gray-500 text-base leading-relaxed">Não perca nenhum pedido.</p>
            </div>

            <div className="space-y-4">
              {/* Browser */}
              <div className={`p-6 rounded-xl border transition-all duration-300 flex items-center justify-between ${settings.notifications.browser ? 'bg-white border-indigo-100 shadow-lg shadow-indigo-50' : 'bg-white border-gray-100'}`}>
                <div className="flex gap-5 items-center">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${settings.notifications.browser ? 'bg-indigo-50 text-primary' : 'bg-gray-100 text-gray-400'}`}>
                    <Globe className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-gray-900 text-lg">Notificações no Navegador</h4>
                    <p className="text-gray-500 text-base leading-relaxed mt-1">Som e alertas visuais no computador.</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={settings.notifications.browser} onChange={(e) => updateNotify('browser', e.target.checked)} />
                  <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
                </label>
              </div>

              {/* Telegram */}
              <div className={`p-6 rounded-xl border transition-all duration-300 flex flex-col ${settings.notifications.telegram ? 'bg-white border-blue-100 shadow-lg shadow-blue-50' : 'bg-white border-gray-100'}`}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex gap-5 items-center">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center transition-colors ${settings.notifications.telegram ? 'bg-blue-50 text-blue-500' : 'bg-gray-100 text-gray-400'}`}>
                      <Smartphone className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-gray-900 text-lg">Alerta via Telegram</h4>
                      <p className="text-gray-500 text-base leading-relaxed mt-1">Receba os pedidos direto no seu celular.</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={settings.notifications.telegram} onChange={(e) => updateNotify('telegram', e.target.checked)} />
                    <div className="w-14 h-8 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:after:translate-x-6"></div>
                  </label>
                </div>

                <div className={`overflow-hidden transition-all duration-300 ${settings.notifications.telegram ? 'max-h-24 opacity-100 mt-6 pt-6 border-t border-gray-50' : 'max-h-0 opacity-0'}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-base text-gray-500 whitespace-nowrap">Chat ID:</span>
                    <input
                      placeholder="Ex: 123456789"
                      className="w-full bg-gray-50 border-gray-100 rounded-none p-3 text-base leading-relaxed focus:bg-white focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                      value={settings.notifications.telegram_chat_id}
                      onChange={(e) => updateNotify('telegram_chat_id', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* STICKY ACTION BAR - REDESIGNED */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg bg-white/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-gray-200/50 p-2.5 rounded-3xl z-50 flex justify-between items-center ring-1 ring-gray-100">
        <button
          onClick={() => fetchSettings()}
          className="text-gray-400 text-sm md:text-base font-medium hover:text-gray-600 transition-colors px-6"
        >
          Descartar
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 md:px-10 py-3 md:py-4 bg-primary text-white text-sm md:text-base font-semibold rounded-xl hover:bg-primary/90 shadow-lg shadow-indigo-200 hover:shadow-indigo-300 hover:-translate-y-0.5 transition-all flex items-center gap-3 active:scale-95 disabled:opacity-50 disabled:transform-none"
        >
          {loading ? (
            <><div className="w-4 h-4 border border-gray-100 border-white/30 border-t-white rounded-full animate-spin" /> Salvando...</>
          ) : (
            <><Save className="w-5 h-5" /> Salvar Tudo</>
          )}
        </button>
      </div>

      {/* CROP MODAL */}
      {imageToCrop && (
        <div className="fixed inset-0 z-200 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900 font-display">Ajustar Imagem</h3>
              <button
                onClick={() => setImageToCrop(null)}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative h-[400px] bg-gray-100">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="contain"
              />
            </div>
            <div className="p-6 bg-white flex justify-end gap-3 border-t border-gray-50">
              <button
                onClick={() => setImageToCrop(null)}
                className="px-6 py-2.5 text-gray-500 hover:bg-gray-50 rounded-xl font-medium transition-colors"
                type="button"
              >
                Cancelar
              </button>
              <button
                onClick={createCroppedImage}
                className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 shadow-lg shadow-indigo-200 font-medium transition-all transform active:scale-95"
                type="button"
              >
                Salvar Logo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
