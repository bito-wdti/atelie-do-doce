import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Search, Filter, Download, 
  Calendar, ShoppingBag, CreditCard, DollarSign,
  ChevronLeft, ChevronRight, X, ChevronDown, CheckCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ordersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { downloadCsv } from '../utils/exportCsv';

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [orders, setOrders] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
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
  }, [statusFilter, timeRange, dateRange]);

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
    const params: any = { limit: 1000 };
    
    if (dateRange.start) {
        const rangeStart = new Date(dateRange.start);
        rangeStart.setHours(0,0,0,0);
        const rangeEnd = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);
        rangeEnd.setHours(23,59,59,999);
        params.startDate = rangeStart.toISOString();
        params.endDate = rangeEnd.toISOString();
    } else {
        if (timeRange === 'daily') start.setHours(0,0,0,0);
        else if (timeRange === 'weekly') start.setDate(start.getDate() - 7);
        else if (timeRange === 'monthly') start.setDate(start.getDate() - 30);
        else if (timeRange === 'yearly') start.setFullYear(start.getFullYear() - 1);
        start.setHours(0,0,0,0);
        params.startDate = start.toISOString();
        params.endDate = end.toISOString();
    }

    try {
      const data = await ordersApi.list(params);
      setOrders(data || []);
    } catch {
      toast.error('Erro ao carregar transaÃ§Ãµes');
    } finally {
      setLoading(false);
    }
  }

  const exportToExcel = async () => {
    try {
      if (filteredOrders.length === 0) {
        toast.error('Nenhum dado para exportar');
        return;
      }

      const fileName = 'Relatorio_Movimentacoes_' + new Date().toISOString().split('T')[0] + '.csv';
      downloadCsv(fileName, filteredOrders.map((order) => ({
        'ID': '#' + order.id,
        'Data/Hora': new Date(order.created_at).toLocaleString('pt-BR'),
        'Cliente': order.customer_name || '',
        'Metodo': order.payment_method || 'N/A',
        'Status': order.status || '',
        'Total': Number(order.total_amount || 0).toFixed(2)
      })));
      toast.success('Relatorio exportado!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toString().includes(searchTerm);
    const matchesStatus = statusFilter === 'Todos' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-20 pt-12">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button 
            onClick={() => navigate('/admin/finance')}
            className="p-2 md:p-3 bg-gray-50 text-gray-400 hover:text-primary rounded-xl transition-all shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

        </div>

        <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-3 md:px-6 h-12 bg-white border border-gray-100 border-gray-100 rounded-xl hover:border-primary transition-all text-sm md:text-base text-gray-700"
                >
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium whitespace-nowrap">
                        {dateRange.start ? (
                            dateRange.end ? `${dateRange.start.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} - ${dateRange.end.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`
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
                                            setDateRange({start: null, end: null});
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
                                                            setDateRange({start: currentD, end: null});
                                                        } else {
                                                            if (currentD < dateRange.start) {
                                                                setDateRange({start: currentD, end: null});
                                                            } else {
                                                                setDateRange({start: dateRange.start, end: currentD});
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
                                                            setDateRange({start: mStart, end: null});
                                                        } else {
                                                            if (mStart < dateRange.start) {
                                                                setDateRange({start: mStart, end: null});
                                                            } else {
                                                                setDateRange({start: dateRange.start, end: mEnd});
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
                                                            setDateRange({start: yStart, end: null});
                                                        } else {
                                                            if (yStart < dateRange.start) {
                                                                setDateRange({start: yStart, end: null});
                                                            } else {
                                                                setDateRange({start: dateRange.start, end: yEnd});
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
                className="flex items-center justify-center gap-2 px-6 h-12 bg-white border border-gray-100 border-gray-100 text-gray-900 rounded-xl hover:bg-gray-50 hover:border-primary active:scale-95 transition-all cursor-pointer text-sm md:text-base">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Relatório</span>
            </button>
        </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex border-b border-gray-100 gap-8 overflow-x-auto no-scrollbar pb-0">
        {['Todos', 'Finalizado', 'Entregue', 'Pendente', 'Cancelado'].map(status => (
            <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`flex flex-col items-center justify-center border-b-[3px] pb-3 pt-2 text-sm font-medium leading-relaxed transition-all whitespace-nowrap px-1 ${statusFilter === status ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-gray-600'}`}
            >
                {status}
            </button>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
            <table className="min-w-full table-fixed">
                <thead>
                    <tr className="bg-gray-50/50 border-b border-gray-100">
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Pedido</th>
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Cliente</th>
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Data & Hora</th>
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Pagamento</th>
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Status</th>
                        <th className="text-center py-6 px-8 text-sm font-semibold text-gray-500  tracking-widest">Valor Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-gray-900 text-base leading-relaxed font-medium">Carregando movimentações...</td>
                        </tr>
                    ) : paginatedOrders.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-20 text-center text-gray-900 text-base leading-relaxed font-medium">Nenhuma movimentação encontrada</td>
                        </tr>
                    ) : (
                        paginatedOrders.map(order => (
                            <tr key={order.id} className="group hover:bg-indigo-50/50/30 transition-colors">
                                <td className="py-6 px-8 text-center">
                                    <span className="text-gray-400 text-sm font-mono leading-relaxed bg-gray-50 px-3 py-1.5 rounded-xl group-hover:bg-white transition-colors tracking-tight">#{order.id}</span>
                                </td>
                                <td className="py-6 px-8 text-center">
                                    <p className="text-gray-900 text-base font-medium leading-relaxed">{order.customer_name}</p>
                                    <p className="text-gray-500 text-sm font-semibold tracking-tight">{order.customer_phone || '-'}</p>
                                </td>
                                <td className="py-6 px-8 text-center font-normal">
                                    <p className="text-gray-900 text-base leading-relaxed">
                                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                                    </p>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </td>
                                <td className="py-6 px-8">
                                    <div className="flex items-center justify-center gap-2">
                                        {order.payment_method?.includes('PIX') ? (
                                            <span className="px-3 py-1 bg-indigo-50/50 text-primary text-xs font-semibold leading-relaxed rounded-full border border-indigo-100  tracking-wide">PIX</span>
                                        ) : order.payment_method?.includes('Cartão') ? (
                                            <span className="px-3 py-1 bg-blue-50 text-blue-500 text-xs font-semibold leading-relaxed rounded-full border border-blue-100  tracking-wide">Cartão</span>
                                        ) : (
                                            <span className="px-3 py-1 bg-green-50 text-green-500 text-xs font-semibold leading-relaxed rounded-full border border-green-100  tracking-wide">Dinheiro</span>
                                        )}
                                    </div>
                                </td>
                                <td className="py-6 px-8 text-center">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-semibold  tracking-widest ${
                                        order.status === 'Finalizado' || order.status === 'Entregue' ? 'bg-green-100 text-green-600' :
                                        order.status === 'Pendente' ? 'bg-orange-100 text-orange-600' :
                                        order.status === 'Cancelado' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                        {order.status}
                                    </span>
                                </td>
                                <td className="py-6 px-8 text-center font-medium">
                                    <p className="text-gray-900 text-base">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                                    </p>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4 px-1">
        {loading ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">Carregando movimentações...</p>
            </div>
        ) : paginatedOrders.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
                <p className="text-gray-500 font-medium">Nenhuma movimentação encontrada</p>
            </div>
        ) : (
            paginatedOrders.map(order => (
                <div key={order.id} className="bg-white border border-gray-100 p-5 rounded-xl shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-sm leading-relaxed">#{order.id}</span>
                            <p className="text-gray-900 text-base leading-tight font-medium">{order.customer_name}</p>
                            <p className="text-gray-500 text-sm font-semibold">{order.customer_phone || '-'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold  tracking-widest ${
                            order.status === 'Finalizado' || order.status === 'Entregue' ? 'bg-green-100 text-green-600' :
                            order.status === 'Pendente' ? 'bg-orange-100 text-orange-600' :
                            order.status === 'Cancelado' ? 'bg-red-100 text-red-600' :
                            'bg-gray-100 text-gray-600'
                        }`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="flex justify-between items-center bg-gray-50/30 p-3 rounded-xl">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-gray-400 font-semibold  tracking-wider">Pagamento</span>
                            {order.payment_method?.includes('PIX') ? (
                                <span className="text-primary text-xs font-semibold">PIX</span>
                            ) : order.payment_method?.includes('Cartão') ? (
                                <span className="text-blue-500 text-xs font-semibold">Cartão</span>
                            ) : (
                                <span className="text-green-500 text-xs font-semibold">Dinheiro</span>
                            )}
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] text-gray-400 font-semibold  tracking-wider block">Data</span>
                            <span className="text-gray-500 text-xs">
                                {new Date(order.created_at).toLocaleDateString('pt-BR')} às {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                        <span className="text-sm text-gray-400 font-semibold  tracking-widest">Total</span>
                        <span className="text-lg font-medium text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                        </span>
                    </div>
                </div>
            ))
        )}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-6 rounded-xl border border-gray-100 shadow-sm mt-8">
            <div className="text-gray-500 text-sm font-medium">
                Página <span className="text-gray-900 font-semibold">{currentPage}</span> de <span className="text-gray-900 font-semibold">{totalPages}</span>
                <span className="hidden md:inline"> — Mostrando {paginatedOrders.length} de {filteredOrders.length} movimentações</span>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-100 border-gray-100 rounded-xl text-gray-600 font-semibold text-sm transition-all hover:border-primary hover:text-primary disabled:opacity-30 disabled:hover:border-gray-100 disabled:hover:text-gray-600"
                >
                    <ChevronLeft className="w-4 h-4" /> <span className="text-sm font-medium">Anterior</span>
                </button>
                <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm transition-all hover:bg-primary disabled:opacity-30 disabled:hover:bg-gray-900"
                >
                    <span className="text-sm font-medium">Próximo</span> <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      )}
    </div>
  );
}
