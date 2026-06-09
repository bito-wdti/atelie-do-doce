import React, { useState, useEffect, useRef } from 'react';
import { Download, Plus, Search, Calendar, SlidersHorizontal, ChevronLeft, ChevronRight, X, MapPin, Package, User, Clock, DollarSign, CheckCircle, Truck, CreditCard, Banknote, ChevronDown } from 'lucide-react';
import { ordersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { downloadCsv } from '../utils/exportCsv';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{ start: Date | null, end: Date | null }>({ start: null, end: null });
  const [dateView, setDateView] = useState<'days' | 'months' | 'years'>('days');
  const filterRef = useRef<HTMLDivElement>(null);

  const rangeLabels = {
    daily: 'Hoje',
    weekly: 'Últimos 7 dias',
    monthly: 'Este Mês',
    yearly: 'Este Ano',
    custom: 'Personalizado'
  };
  const [timeRange, setTimeRange] = useState<keyof typeof rangeLabels>('weekly');

  useEffect(() => {
    fetchOrders();
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [filterStatus, timeRange, dateRange]);

  const monthsArr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fullMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  async function fetchOrders() {
    setLoading(true);

    const end = new Date();
    const start = new Date();
    const params: any = {};

    if (filterStatus !== 'Todos') params.status = filterStatus;
    if (searchTerm) params.search = searchTerm;

    if (dateRange.start) {
      const rangeStart = new Date(dateRange.start);
      rangeStart.setHours(0, 0, 0, 0);
      const rangeEnd = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);
      rangeEnd.setHours(23, 59, 59, 999);
      params.startDate = rangeStart.toISOString();
      params.endDate = rangeEnd.toISOString();
    } else {
      if (timeRange === 'daily') start.setHours(0, 0, 0, 0);
      else if (timeRange === 'weekly') start.setDate(start.getDate() - 7);
      else if (timeRange === 'monthly') start.setDate(start.getDate() - 30);
      else if (timeRange === 'yearly') start.setFullYear(start.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      params.startDate = start.toISOString();
      params.endDate = end.toISOString();
    }

    try {
      const data = await ordersApi.list(params);
      setOrders(data || []);
    } catch {
      toast.error('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'Todos' || order.status === filterStatus;
    const matchesSearch = order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) || order.id.toString().includes(searchTerm);
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-700';
      case 'Em Preparo': return 'bg-blue-100 text-blue-700';
      case 'Saiu para Entrega': return 'bg-purple-100 text-purple-700';
      case 'Entregue': return 'bg-green-100 text-green-700';
      case 'Cancelado': return 'bg-gray-100 text-gray-500';
      default: return 'bg-gray-100 text-gray-500';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500';
      case 'Em Preparo': return 'bg-blue-500';
      case 'Saiu para Entrega': return 'bg-purple-500';
      case 'Entregue': return 'bg-green-500';
      case 'Cancelado': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const updateOrderStatus = async (id: number, newStatus: string) => {
    try {
      await ordersApi.updateStatus(id, newStatus);
      toast.success(`Pedido #${id} atualizado para ${newStatus}`);
      if (selectedOrder && selectedOrder.id === id) { setSelectedOrder({ ...selectedOrder, status: newStatus }); }
      fetchOrders();
    } catch {
      toast.error('Erro ao atualizar status');
    }
  };

  const exportToExcel = async () => {
    try {
      if (filteredOrders.length === 0) {
        toast.error('Nenhum pedido para exportar');
        return;
      }

      const fileName = 'Relatorio_Pedidos_' + new Date().toISOString().split('T')[0] + '.csv';
      downloadCsv(fileName, filteredOrders.map((order) => ({
        'ID': '#' + order.id,
        'Cliente': order.customer_name || '',
        'Telefone': order.customer_phone || '-',
        'Data': new Date(order.created_at).toLocaleDateString('pt-BR'),
        'Horario': new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        'Total': Number(order.total_amount || 0).toFixed(2),
        'Status': order.status || '',
        'Endereco': order.delivery_address || 'Retirada na Loja',
        'Itens do Pedido': order.order_items?.map((item: any) => String(item.quantity) + 'x ' + (item.product?.name || item.product_name || 'Produto')).join(', ') || '-'
      })));
      toast.success('Relatorio exportado com sucesso!');
    } catch (error) {
      console.error('Erro na exportacao:', error);
      toast.error('Erro ao gerar arquivo CSV');
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden flex-col md:flex-row relative animate-fade-in bg-[#F9FAFB]">
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full bg-[#F9FAFB]">
        <div className="px-4 md:px-8 py-6 border-b border-gray-100 bg-[#F9FAFB]">
          <div className="flex items-center justify-between gap-4">

            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative" ref={filterRef}>
                <button
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  className="flex items-center gap-2 px-3 md:px-6 h-12 bg-white border border-gray-100 border-gray-100 rounded-xl hover:border-primary transition-all text-sm md:text-base text-gray-700"
                >
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-medium whitespace-nowrap">
                    {dateRange.start ? (
                      dateRange.end ? `${dateRange.start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${dateRange.end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`
                        : dateRange.start.toLocaleDateString('pt-BR')
                    ) : (rangeLabels as any)[timeRange]}
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilterDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showFilterDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] animate-slide-up">
                    <div className="p-2 space-y-1 text-left">
                      {Object.entries(rangeLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => {
                            if (key === 'custom') {
                              setShowDatePicker(true);
                            } else {
                              setDateRange({ start: null, end: null });
                              setTimeRange(key as any);
                            }
                            setShowFilterDropdown(false);
                          }}
                          className={`w-full text-left px-5 py-3 rounded-none text-base leading-relaxed transition-all ${((!dateRange.start && timeRange === key) || (dateRange.start && key === 'custom')) ? 'bg-primary text-white' : 'text-gray-400 hover:bg-gray-50'}`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {showDatePicker && (
                  <div className="absolute top-full right-0 mt-2 z-[110] bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-slide-up w-[320px]">
                    <div className="p-6">
                      {dateView === 'days' ? (
                        <>
                          <div className="flex items-center justify-between mb-6">
                            <button onClick={handlePrevMonth} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setDateView('months')} className="text-base font-semibold text-gray-800 flex items-center gap-1">
                              {fullMonths[viewDate.getMonth()]} {viewDate.getFullYear()} <ChevronDown className="w-3 h-3 text-primary" />
                            </button>
                            <button onClick={handleNextMonth} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                          </div>
                          <div className="grid grid-cols-7 text-center mb-3">
                            {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(day => <span key={day} className="text-[9px] font-semibold text-gray-300">{day}</span>)}
                          </div>
                          <div className="grid grid-cols-7 gap-1 text-center">
                            {Array.from({ length: getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => <div key={`empty-${i}`} />)}
                            {Array.from({ length: getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth()) }).map((_, i) => {
                              const day = i + 1;
                              const currentD = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
                              const isStart = dateRange.start?.toDateString() === currentD.toDateString();
                              const isEnd = dateRange.end?.toDateString() === currentD.toDateString();
                              const inRange = dateRange.start && dateRange.end && currentD > dateRange.start && currentD < dateRange.end;

                              return (
                                <button
                                  key={day}
                                  onClick={() => {
                                    if (!dateRange.start || (dateRange.start && dateRange.end)) {
                                      setDateRange({ start: currentD, end: null });
                                    } else {
                                      if (currentD < dateRange.start) {
                                        setDateRange({ start: currentD, end: null });
                                      } else {
                                        setDateRange({ start: dateRange.start, end: currentD });
                                        setShowDatePicker(false);
                                      }
                                    }
                                  }}
                                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-semibold transition-all ${isStart || isEnd ? 'bg-primary text-white shadow-md' : inRange ? 'bg-indigo-50/50 text-primary' : 'text-gray-700 hover:bg-gray-50'}`}
                                >
                                  {day}
                                </button>
                              );
                            })}
                          </div>
                        </>
                      ) : dateView === 'months' ? (
                        <div className="animate-fade-in">
                          <div className="flex items-center justify-between mb-6">
                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1))} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                            <button onClick={() => setDateView('years')} className="text-xl font-semibold text-gray-800 hover:text-primary transition-colors">{viewDate.getFullYear()}</button>
                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1))} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {monthsArr.map((month, idx) => {
                              const mStart = new Date(viewDate.getFullYear(), idx, 1);
                              const mEnd = new Date(viewDate.getFullYear(), idx + 1, 0);
                              const isStart = dateRange.start && dateRange.start.getMonth() === idx && dateRange.start.getFullYear() === viewDate.getFullYear();
                              const isEnd = dateRange.end && dateRange.end.getMonth() === idx && dateRange.end.getFullYear() === viewDate.getFullYear();
                              const inRange = dateRange.start && dateRange.end && mStart > dateRange.start && mEnd < dateRange.end;
                              return (
                                <button
                                  key={month}
                                  onClick={() => {
                                    if (!dateRange.start || (dateRange.start && dateRange.end)) {
                                      setDateRange({ start: mStart, end: null });
                                    } else {
                                      if (mStart < dateRange.start) {
                                        setDateRange({ start: mStart, end: null });
                                      } else {
                                        setDateRange({ start: dateRange.start, end: mEnd });
                                        setShowDatePicker(false);
                                      }
                                    }
                                  }}
                                  className={`py-3 rounded-xl text-xs font-semibold transition-all ${isStart || isEnd ? 'bg-primary text-white' : inRange ? 'bg-indigo-50/50 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                  {month}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        <div className="animate-fade-in">
                          <div className="flex items-center justify-between mb-6 text-left">
                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1))} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronLeft className="w-5 h-5" /></button>
                            <span className="text-xl font-semibold text-gray-800">Ano</span>
                            <button onClick={() => setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1))} className="p-2 text-gray-400 hover:bg-gray-50 rounded-full"><ChevronRight className="w-5 h-5" /></button>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            {Array.from({ length: 12 }).map((_, i) => {
                              const startY = viewDate.getFullYear() - (viewDate.getFullYear() % 12);
                              const year = startY + i;
                              const yStart = new Date(year, 0, 1);
                              const yEnd = new Date(year, 11, 31);
                              const isStart = dateRange.start && dateRange.start.getFullYear() === year;
                              const isEnd = dateRange.end && dateRange.end.getFullYear() === year;
                              const inRange = dateRange.start && dateRange.end && yStart > dateRange.start && yEnd < dateRange.end;
                              return (
                                <button
                                  key={year}
                                  onClick={() => {
                                    if (!dateRange.start || (dateRange.start && dateRange.end)) {
                                      setDateRange({ start: yStart, end: null });
                                    } else {
                                      if (yStart < dateRange.start) {
                                        setDateRange({ start: yStart, end: null });
                                      } else {
                                        setDateRange({ start: dateRange.start, end: yEnd });
                                        setShowDatePicker(false);
                                      }
                                    }
                                  }}
                                  className={`py-3 rounded-xl text-xs font-semibold transition-all ${isStart || isEnd ? 'bg-primary text-white' : inRange ? 'bg-indigo-50/50 text-primary' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                                >
                                  {year}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={exportToExcel}
                className="flex items-center justify-center gap-2 px-6 h-12 rounded-xl border border-gray-100 border-gray-100 bg-white text-gray-900 text-sm md:text-base leading-relaxed hover:bg-gray-50 hover:border-primary transition-all shrink-0 cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Relatório</span>
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex bg-white p-1 rounded-xl border border-gray-100 gap-2 overflow-x-auto no-scrollbar pb-0">
              {['Todos', 'Pendente', 'Em Preparo', 'Saiu para Entrega', 'Entregue', 'Cancelado'].map((tab) => (
                <button key={tab} onClick={() => setFilterStatus(tab)} className={`flex items-center justify-center py-2.5 text-sm font-medium leading-relaxed transition-all whitespace-nowrap px-4 rounded-xl ${filterStatus === tab ? 'bg-primary text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}>
                  <div className="flex items-center gap-2"><span>{tab}</span>{tab === 'Pendente' && (<span className={`${filterStatus === tab ? 'bg-white text-primary' : 'bg-primary text-white'} px-1.5 py-0.5 rounded-full text-xs font-semibold`}>{orders.filter(o => o.status === 'Pendente').length}</span>)}</div>
                </button>
              ))}
            </div>
            <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" /><input className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-base leading-relaxed focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="Buscar por nome ou ID..." type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 md:p-8 no-scrollbar">
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredOrders.length === 0 ? (<p className="text-center py-10 text-gray-900 text-base leading-relaxed">Nenhum pedido</p>) : (
              filteredOrders.map(order => (
                <div key={order.id} onClick={() => setSelectedOrder(order)} className="bg-white p-5 rounded-xl border border-gray-100 active:scale-95 transition-transform">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-14 h-14 rounded-full bg-indigo-50/50 text-primary flex items-center justify-center text-lg font-semibold shrink-0 ">
                        {order.customer_name?.substring(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-gray-400 text-[10px] font-semibold  tracking-widest block mt-1">PEDIDO #{order.id}</span>
                        <h3 className="text-gray-900 text-base font-semibold leading-relaxed truncate font-display">{order.customer_name}</h3>
                        <p className="text-gray-400 text-sm leading-relaxed truncate">{order.customer_phone}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${getStatusColor(order.status)} shrink-0 `}>
                      {order.status === 'Entregue' && <CheckCircle className="w-3.5 h-3.5" />}
                      {order.status}
                    </span>
                  </div>
                  <div className="flex items-end justify-between pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-500 text-xs font-semibold  tracking-tight pb-0.5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-gray-400  tracking-widest block mb-0.5">Total</span>
                      <div className="text-gray-900 text-lg font-semibold leading-none">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="hidden md:block bg-white border border-gray-100 rounded-xl overflow-hidden">
            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-center border-collapse">
                <thead className="bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="pl-4 pr-4 py-5 text-sm font-semibold text-gray-500 tracking-wide text-left">ID</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-500 tracking-wide text-center">Cliente</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-500 tracking-wide text-center">Horário</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-500 tracking-wide text-center">Total</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-500 tracking-wide text-center">Status</th>
                    <th className="px-6 py-5 text-sm font-semibold text-gray-500 tracking-wide text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredOrders.length === 0 ? (
                    <tr><td colSpan={6} className="px-8 py-12 text-center text-gray-900 text-base leading-relaxed">Nenhum pedido encontrado.</td></tr>
                  ) : (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className={`hover:bg-gray-50 transition-colors cursor-pointer group ${selectedOrder?.id === order.id ? 'bg-indigo-50/50/30' : ''}`} onClick={() => setSelectedOrder(order)}>
                        <td className="pl-4 pr-4 py-5 text-sm font-mono text-gray-400 text-left">#{order.id}</td>
                        <td className="pl-16 pr-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-indigo-50/50 text-primary flex items-center justify-center text-sm shrink-0  font-semibold">
                              {order.customer_name?.substring(0, 2)}
                            </div>
                            <div className="flex flex-col text-left min-w-0">
                              <span className="text-base text-gray-900 font-medium leading-relaxed truncate">{order.customer_name}</span>
                              <span className="text-sm text-gray-400 font-semibold truncate">{order.customer_phone || '-'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-base text-gray-500 text-center">
                          {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="px-6 py-5 text-base text-gray-900 font-medium text-center">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold  tracking-wider ${getStatusColor(order.status)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)} animate-pulse`}></span>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <button className="text-primary hover:text-primary-dark hover:bg-indigo-50/50 px-3 py-1.5 rounded-xl transition-all text-sm font-semibold  tracking-wide">
                            Gerenciar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 md:hidden" onClick={() => setSelectedOrder(null)}></div>
          <aside className={`fixed md:static inset-y-0 right-0 z-60 w-full md:w-[450px] bg-[#F9FAFB] border-l border-gray-100 shadow-2xl flex flex-col h-full transform transition-transform duration-500 ease-out translate-x-0 md:rounded-l-3xl`}>
            <div className="p-8 border-b border-gray-100 bg-[#F9FAFB] flex items-center justify-between md:rounded-tl-3xl"><div><h3 className="text-gray-900 text-xl leading-relaxed font-display">Pedido #{selectedOrder.id}</h3><p className="text-gray-500 text-base leading-relaxed mt-1">{new Date(selectedOrder.created_at).toLocaleString('pt-BR')}</p></div><button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors"><X className="w-6 h-6" /></button></div>
            <div className="flex-1 overflow-auto no-scrollbar pt-4 px-8 pb-8 space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <h4 className="text-gray-500 text-base leading-relaxed px-1">Status Atual</h4>
                  <h4 className="text-gray-500 text-base leading-relaxed px-1">Pagamento</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 items-stretch">
                  <div className="p-3 md:p-4 rounded-xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm min-h-[60px] md:min-h-[80px]">
                    <div className="flex justify-between items-center">
                      <span className={`text-gray-700 text-lg md:text-xl font-medium leading-relaxed ${selectedOrder.status === 'Entregue' ? 'text-green-600' : ''}`}>{selectedOrder.status}</span>
                      {selectedOrder.status === 'Entregue' ? <CheckCircle className="text-green-500 w-5 h-5" /> : <Clock className="text-orange-500 w-4 h-4" />}
                    </div>
                  </div>

                  <div className="p-3 md:p-4 rounded-xl border border-gray-100 bg-white flex flex-col justify-center shadow-sm min-h-[60px] md:min-h-[80px]">
                    <div className="flex justify-between items-center">
                      <div className="text-gray-700 text-lg md:text-xl font-medium leading-relaxed">
                        {selectedOrder.payment_method?.split('(')[0]?.trim() || 'Não inf.'}
                      </div>
                      {selectedOrder.payment_method?.toLowerCase().includes('dinheiro') ? (
                        <Banknote className="text-green-600 w-5 h-5" />
                      ) : (
                        <CreditCard className="text-green-600 w-5 h-5" />
                      )}
                    </div>

                    {selectedOrder.payment_method?.includes('(') && (
                      <>
                        <div className="border-t border-gray-50 -mx-4 my-2" />
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-0">
                          <span className="text-xs text-gray-400 font-semibold  tracking-wider whitespace-nowrap">Troco p/</span>
                          <span className="text-gray-700 font-semibold text-base">
                            {selectedOrder.payment_method.match(/\(Troco para (.*?)\)/)?.[1] ||
                              selectedOrder.payment_method.split('(')[1]?.replace(')', '')}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-gray-500 text-base leading-relaxed px-1">Dados do Cliente</h4>
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Customer Info */}
                  <div className="p-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-indigo-50/50 text-primary flex items-center justify-center text-lg font-semibold">
                      {selectedOrder.customer_name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-gray-900 text-base leading-relaxed font-semibold truncate">{selectedOrder.customer_name}</span>
                      <span className="text-gray-400 text-base leading-relaxed mt-1 truncate">{selectedOrder.customer_phone || 'Sem telefone'}</span>
                    </div>
                  </div>

                  {/* Divider line */}
                  <div className="border-t border-gray-50 mx-5" />

                  {/* Address Part */}
                  <div className="p-5 flex items-start gap-3 bg-white">
                    <MapPin className="text-gray-400 w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-gray-500 text-base leading-relaxed">
                      {selectedOrder.delivery_address || 'Retirada na Loja'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-50">
                <h4 className="text-gray-500 text-base leading-relaxed">Itens do Pedido</h4>
                <div className="space-y-3">
                  {selectedOrder.order_items?.map((item: any, idx: number) => (
                    <div key={idx} className="flex flex-col gap-1 bg-white p-4 rounded-xl border border-gray-50 shadow-sm transition-all hover:border-primary/20">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-8 h-8 rounded-xl bg-white border border-gray-100 flex items-center justify-center text-sm text-primary shrink-0">{item.quantity}x</span>
                          <p className="text-gray-900 text-base leading-relaxed truncate">{item.product?.name || item.product_name || 'Produto'}</p>
                        </div>
                        <span className="text-gray-900 text-base md:text-lg font-semibold leading-relaxed">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}</span>
                      </div>
                      {item.observation && (
                        <p className="text-primary text-sm font-medium pl-11">obs: {item.observation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-500 text-base leading-relaxed">Total do Pedido</span>
                <span className="text-2xl text-gray-700 leading-relaxed font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.total_amount)}</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button onClick={() => window.print()} className="w-full h-12 rounded-xl bg-gray-900 text-white text-base leading-relaxed shadow-lg active:scale-95 transition-all">Imprimir Comanda</button>
                {selectedOrder.status === 'Pendente' && (<button onClick={() => updateOrderStatus(selectedOrder.id, 'Em Preparo')} className="w-full h-12 rounded-xl bg-primary text-white text-base leading-relaxed shadow-primary/30 shadow-md active:scale-95 transition-all">Aceitar Pedido</button>)}
                {selectedOrder.status === 'Em Preparo' && (<button onClick={() => updateOrderStatus(selectedOrder.id, 'Saiu para Entrega')} className="w-full h-12 rounded-xl bg-indigo-600 text-white text-base leading-relaxed shadow-indigo-100 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"><Truck className="w-4 h-4" /> Despachar Pedido</button>)}
                {selectedOrder.status === 'Saiu para Entrega' && (<button onClick={() => updateOrderStatus(selectedOrder.id, 'Entregue')} className="w-full h-12 rounded-xl bg-emerald-600 text-white text-base leading-relaxed shadow-emerald-100 shadow-md active:scale-95 transition-all flex items-center justify-center gap-2"><CheckCircle className="w-4 h-4" /> Finalizar Entrega</button>)}
              </div>
            </div></aside>

          {/* PRINT TEMPLATE (Hidden on screen) */}
          <div id="print-receipt" className="hidden">
            <div className="text-center border-b-2 border-dashed border-gray-300 pb-4 mb-4">
              <h1 className="text-2xl font-semibold text-primary font-display">Ateliê do Doce</h1>
              <p className="text-sm text-gray-500">Comprovante de Pedido</p>
            </div>

            <div className="flex justify-between mb-6">
              <div>
                <p className="font-semibold text-lg">PEDIDO #{selectedOrder.id}</p>
                <p className="text-sm">{new Date(selectedOrder.created_at).toLocaleDateString('pt-BR')} às {new Date(selectedOrder.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${selectedOrder.status === 'Entregue' ? 'text-green-600' : 'text-primary'}`}>{selectedOrder.status.toUpperCase()}</p>
              </div>
            </div>

            <div className="border-b border-gray-100 pb-4 mb-4">
              <p className="text-xs  text-gray-400 font-semibold mb-2">Cliente</p>
              <p className="font-semibold">{selectedOrder.customer_name}</p>
              <p className="text-sm">{selectedOrder.customer_phone || 'Sem telefone'}</p>
              <p className="text-sm mt-1"><strong>Endereço:</strong> {selectedOrder.delivery_address || 'Retirada na Loja'}</p>
              <p className="text-sm mt-1"><strong>Pagamento:</strong> {selectedOrder.payment_method || 'Não informado'}</p>
            </div>

            <div className="mb-6">
              <p className="text-xs  text-gray-400 font-semibold mb-2">Itens</p>
              <div className="space-y-2">
                {selectedOrder.order_items?.map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col mb-2 border-b border-dashed border-gray-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex justify-between text-sm">
                      <span>{item.quantity}x {item.product?.name || item.product_name || 'Produto'}</span>
                      <span className="font-medium">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.unit_price * item.quantity)}</span>
                    </div>
                    {item.observation && (
                      <span className="text-xs font-semibold text-gray-500 mt-1">OBS: {item.observation}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t-2 border-dashed border-gray-300 pt-4 flex justify-between items-center">
              <span className="text-lg font-semibold">TOTAL</span>
              <span className="text-2xl font-semibold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedOrder.total_amount)}</span>
            </div>

            <div className="mt-10 text-center text-xs text-gray-400">
              <p>Obrigado pela preferência!</p>
              <p>www.deliverypro.com.br</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
