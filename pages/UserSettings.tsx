import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Camera, Save, User, MapPin, Lock, X, Eye, EyeOff, Check, Phone } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Cropper from 'react-easy-crop';

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3001/api';

function formatTelefone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

function isTelefoneValid(telefone: string) {
  return /^\(\d{2}\) \d{5}-\d{4}$/.test(telefone);
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function isCepValid(cep: string) {
  return /^\d{5}-\d{3}$/.test(cep);
}

function getPasswordErrors(pw: string) {
  return {
    length: pw.length >= 8,
    upper: /[A-Z]/.test(pw),
    number: /[0-9]/.test(pw),
    symbol: /[!@#$%^&*(),.?":{}|<>]/.test(pw),
  };
}

function inputBorder(touched: boolean, valid: boolean) {
  if (!touched) return 'border-gray-200';
  return valid ? 'border-green-500' : 'border-red-400';
}

function inputBg(touched: boolean, valid: boolean) {
  if (!touched) return 'bg-gray-50 focus:bg-white';
  return valid ? 'bg-green-50 focus:bg-white' : 'bg-red-50 focus:bg-white';
}

type TabType = 'profile' | 'address' | 'security';

interface AddressFields {
  cep: string;
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
}

export default function UserSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crop states
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // Profile fields
  const [avatarUrl, setAvatarUrl] = useState('');
  const [name, setName] = useState('');
  const [telefone, setTelefone] = useState('');
  const [nameTouched, setNameTouched] = useState(false);
  const [telefoneTouched, setTelefoneTouched] = useState(false);

  // Address fields
  const [address, setAddress] = useState<AddressFields>({
    cep: '', address: '', number: '', complement: '', neighborhood: '',
  });
  const [cepLoading, setCepLoading] = useState(false);
  const [cepTouched, setCepTouched] = useState(false);

  // Security fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [newPwTouched, setNewPwTouched] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (!token) { navigate('/login'); return; }

    fetch(`${API_URL}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(user => {
        setName(user.name || '');
        setTelefone(formatTelefone(user.telefone || ''));
        setAvatarUrl(user.avatar_url || '');
        if (user.delivery_address) {
          try {
            const parsed = JSON.parse(user.delivery_address);
            setAddress({
              cep: formatCep(parsed.cep || ''),
              address: parsed.address || '',
              number: parsed.number || '',
              complement: parsed.complement || '',
              neighborhood: parsed.neighborhood || '',
            });
          } catch { /* malformed, ignore */ }
        }
      })
      .catch(() => {
        localStorage.removeItem('userToken');
        navigate('/login');
      })
      .finally(() => setFetching(false));
  }, []);

  const getToken = () => localStorage.getItem('userToken') || '';

  const patchMe = async (body: Record<string, any>) => {
    const res = await fetch(`${API_URL}/users/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erro ao salvar');
    return data;
  };

  // --- Profile tab save ---
  const handleSaveProfile = async () => {
    setNameTouched(true);
    setTelefoneTouched(true);
    if (!name.trim()) { toast.error('Nome não pode ser vazio'); return; }
    if (!isTelefoneValid(telefone)) { toast.error('Telefone inválido'); return; }
    setSaving(true);
    try {
      await patchMe({ name, telefone });
      localStorage.setItem('userName', name);
      toast.success('Perfil atualizado!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Address tab save ---
  const handleSaveAddress = async () => {
    setCepTouched(true);
    if (!isCepValid(address.cep)) {
      toast.error('CEP inválido'); return;
    }
    if (!address.address.trim() || !address.number.trim() || !address.neighborhood.trim()) {
      toast.error('Preencha rua, número e bairro'); return;
    }
    setSaving(true);
    try {
      await patchMe({ delivery_address: JSON.stringify(address) });
      toast.success('Endereço padrão salvo!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- Security tab save ---
  const handleSavePassword = async () => {
    setNewPwTouched(true);
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos de senha'); return;
    }
    const pwChecks = getPasswordErrors(newPassword);
    if (!Object.values(pwChecks).every(Boolean)) {
      toast.error('A nova senha não atende aos requisitos'); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Nova senha e confirmação não coincidem'); return;
    }
    setSaving(true);
    try {
      await patchMe({ currentPassword, newPassword });
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      toast.success('Senha alterada com sucesso!');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  // --- CEP lookup ---
  const handleCepLookup = async () => {
    const digits = address.cep.replace(/\D/g, '');
    if (digits.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await res.json();
      if (data.erro) { toast.error('CEP não encontrado'); return; }
      setAddress(prev => ({
        ...prev,
        address: data.logradouro || '',
        neighborhood: data.bairro || '',
      }));
    } catch {
      toast.error('Erro ao buscar CEP');
    } finally {
      setCepLoading(false);
    }
  };

  // --- Image crop ---
  const onCropComplete = useCallback((_: any, pixels: any) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImageToCrop(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const getCroppedImg = async (src: string, pixels: any): Promise<string> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    const canvas = document.createElement('canvas');
    canvas.width = pixels.width;
    canvas.height = pixels.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(image, pixels.x, pixels.y, pixels.width, pixels.height, 0, 0, pixels.width, pixels.height);
    return canvas.toDataURL('image/jpeg', 0.88);
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    const toastId = toast.loading('Salvando foto...');
    try {
      const base64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const updated = await patchMe({ avatar_url: base64 });
      setAvatarUrl(updated.avatar_url || base64);
      setImageToCrop(null);
      toast.success('Foto de perfil atualizada!', { id: toastId });
    } catch (e: any) {
      toast.error(e.message || 'Erro ao salvar foto', { id: toastId });
    }
  };

  const initials = (n: string) =>
    n.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

  if (fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 md:px-8 pb-24 animate-fade-in">

      {/* Crop modal */}
      {imageToCrop && (
        <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-2xl overflow-hidden w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-bold text-gray-800">Ajustar foto</h3>
              <button onClick={() => setImageToCrop(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full h-72 bg-gray-900">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="px-5 py-4 space-y-3">
              <input
                type="range" min={1} max={3} step={0.05} value={zoom}
                onChange={e => setZoom(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <button
                onClick={handleCropConfirm}
                className="w-full py-3 rounded-xl bg-primary text-white font-bold hover:brightness-110 transition-all"
              >
                Salvar foto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link to="/profile" className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
          <ArrowLeft className="w-4 h-4 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Meus Dados</h1>
          <p className="text-xs text-gray-400 font-medium">Gerencie suas informações pessoais</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex justify-start mb-8 overflow-x-auto no-scrollbar">
        <div className="inline-flex bg-gray-100/80 p-1.5 rounded-xl border border-gray-100/50 shadow-inner shrink-0">
          {([
            { id: 'profile', label: 'Perfil', icon: User },
            { id: 'address', label: 'Endereço', icon: MapPin },
            { id: 'security', label: 'Segurança', icon: Lock },
          ] as { id: TabType; label: string; icon: any }[]).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id
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

      {/* TAB: PERFIL */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-slide-up">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-32 h-32 rounded-full bg-indigo-50 overflow-hidden border-4 border-white shadow-xl flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-primary">{initials(name || 'U')}</span>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-1 right-1 w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center shadow-lg hover:brightness-110 transition-all"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
              </div>

              {/* Name + phone */}
              <div className="flex-1 w-full space-y-5">
                {/* Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome completo</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setNameTouched(true); }}
                      placeholder="Seu nome"
                      className={`w-full border ${inputBorder(nameTouched, !!name.trim())} ${inputBg(nameTouched, !!name.trim())} focus:border-primary rounded-xl py-3 pl-9 pr-9 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                    />
                    {nameTouched && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {name.trim()
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <X className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
                  </div>
                  {nameTouched && !name.trim() && (
                    <p className="text-xs text-red-400 px-1">Nome não pode ser vazio</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone / WhatsApp</label>
                  <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary transition-colors">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={telefone}
                      onChange={e => { setTelefone(formatTelefone(e.target.value)); setTelefoneTouched(true); }}
                      placeholder="(00) 00000-0000"
                      className={`w-full border ${inputBorder(telefoneTouched, isTelefoneValid(telefone))} ${inputBg(telefoneTouched, isTelefoneValid(telefone))} focus:border-primary rounded-xl py-3 pl-9 pr-9 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                    />
                    {telefoneTouched && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isTelefoneValid(telefone)
                          ? <Check className="w-4 h-4 text-green-500" />
                          : <X className="w-4 h-4 text-red-400" />}
                      </div>
                    )}
                  </div>
                  {telefoneTouched && !isTelefoneValid(telefone) && (
                    <p className="text-xs text-red-400 px-1">
                      {telefone.replace(/\D/g, '').length < 11 ? 'Telefone incompleto' : 'Formato inválido: (00) 00000-0000'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Perfil'}
          </button>
        </div>
      )}

      {/* TAB: ENDEREÇO */}
      {activeTab === 'address' && (
        <div className="space-y-6 animate-slide-up">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-5">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Endereço padrão de entrega</p>
              <p className="text-xs text-gray-400">Este endereço será pré-preenchido automaticamente no checkout.</p>
            </div>

            {/* CEP */}
            <div className="space-y-1">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">CEP</label>
              <div className="flex gap-2">
                <div className="relative flex-1 group">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={address.cep}
                    onChange={e => {
                      setAddress(prev => ({ ...prev, cep: formatCep(e.target.value) }));
                      setCepTouched(true);
                    }}
                    onBlur={handleCepLookup}
                    placeholder="00000-000"
                    maxLength={9}
                    className={`w-full border ${inputBorder(cepTouched, isCepValid(address.cep))} ${inputBg(cepTouched, isCepValid(address.cep))} focus:border-primary rounded-xl py-3 px-4 pr-9 text-sm font-medium outline-none transition-all placeholder:text-gray-400 text-gray-800`}
                  />
                  {cepTouched && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isCepValid(address.cep)
                        ? <Check className="w-4 h-4 text-green-500" />
                        : <X className="w-4 h-4 text-red-400" />}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCepLookup}
                  disabled={cepLoading}
                  className="px-4 py-3 rounded-xl bg-indigo-50 text-primary font-semibold text-sm hover:bg-indigo-100 transition-colors disabled:opacity-50 shrink-0"
                >
                  {cepLoading ? '...' : 'Buscar'}
                </button>
              </div>
              {cepTouched && !isCepValid(address.cep) && (
                <p className="text-xs text-red-400 px-1">
                  {address.cep.replace(/\D/g, '').length < 8 ? 'CEP incompleto' : 'Formato inválido: 00000-000'}
                </p>
              )}
            </div>

            {/* Street */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rua / Logradouro</label>
              <input
                type="text"
                value={address.address}
                onChange={e => setAddress(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Nome da rua"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Number */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Número</label>
                <input
                  type="text"
                  value={address.number}
                  onChange={e => setAddress(prev => ({ ...prev, number: e.target.value }))}
                  placeholder="Ex: 42"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              {/* Neighborhood */}
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bairro</label>
                <input
                  type="text"
                  value={address.neighborhood}
                  onChange={e => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                  placeholder="Seu bairro"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
            </div>

            {/* Complement */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Complemento <span className="normal-case font-normal text-gray-400">(opcional)</span></label>
              <input
                type="text"
                value={address.complement}
                onChange={e => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                placeholder="Bloco, apto, referência..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
          </section>

          <button
            onClick={handleSaveAddress}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Salvar Endereço'}
          </button>
        </div>
      )}

      {/* TAB: SEGURANÇA */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-slide-up">
          <section className="bg-white rounded-xl border border-gray-100 shadow-sm p-8 md:p-10 space-y-5">
            <div>
              <p className="text-sm font-bold text-gray-700 mb-1">Alterar senha</p>
              <p className="text-xs text-gray-400">A nova senha deve atender aos requisitos abaixo.</p>
            </div>

            {/* Current password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha atual</label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowCurrent(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nova senha</label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => { setNewPassword(e.target.value); setNewPwTouched(true); }}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-11 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-gray-900 text-sm font-medium focus:outline-none focus:border-primary transition-all"
                />
                <button type="button" onClick={() => setShowNew(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Checklist de requisitos */}
              {newPwTouched && (() => {
                const checks = getPasswordErrors(newPassword);
                const items = [
                  { label: 'Mínimo 8 caracteres', ok: checks.length },
                  { label: 'Uma letra maiúscula', ok: checks.upper },
                  { label: 'Um número', ok: checks.number },
                  { label: 'Um símbolo (!@#$%...)', ok: checks.symbol },
                ];
                return (
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 px-1">
                    {items.map(({ label, ok }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        {ok
                          ? <Check className="w-3.5 h-3.5 text-green-500 shrink-0" />
                          : <X className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                        <span className={`text-xs ${ok ? 'text-green-600' : 'text-red-400'}`}>{label}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmar nova senha</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 pr-11 rounded-xl border text-gray-900 text-sm font-medium focus:outline-none transition-all ${
                    confirmPassword && newPassword !== confirmPassword
                      ? 'border-red-400 bg-red-50 focus:bg-white'
                      : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary'
                  }`}
                />
                <button type="button" onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="text-xs text-red-500 font-medium mt-1.5">As senhas não coincidem</p>
              )}
            </div>
          </section>

          <button
            onClick={handleSavePassword}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-white font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Salvando...' : 'Alterar Senha'}
          </button>
        </div>
      )}
    </div>
  );
}
