import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, TrendingUp, Calendar, ChevronDown, 
  ArrowUpRight, ArrowDownRight, CreditCard, 
  BarChart3, PieChart as PieChartIcon, 
  Filter, Download, ChevronLeft, ChevronRight, X,
  ShoppingBag, CircleDollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { ordersApi } from '../services/api';
import { toast } from 'react-hot-toast';
import { downloadCsv } from '../utils/exportCsv';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function AdminFinance() {
  const [timeRange, setTimeRange] = useState<TimeRange>('weekly');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const [dateRange, setDateRange] = useState<{start: Date | null, end: Date | null}>({start: null, end: null});
  const [dateView, setDateView] = useState<'days' | 'months' | 'years'>('days');
  const [loading, setLoading] = useState(true);
  const filterRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageTicket: 0,
    dailyRevenue: 0,
    revenueGrowth: 0,
    prevAverageTicket: 0
  });

  const [chartData, setChartData] = useState<any[]>([]);
  const [paymentData, setPaymentData] = useState<any[]>([]);
  const [ordersList, setOrdersList] = useState<any[]>([]);

  const COLORS = ['primary', '#975233', '#3B82F6', '#10B981'];

  useEffect(() => {
    fetchFinancialData();
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [timeRange, dateRange]);

  async function fetchFinancialData() {
    setLoading(true);
    try {
        const end = new Date();
        const start = new Date();
        const prevStart = new Date();
        
        if (dateRange.start) {
            const rangeStart = new Date(dateRange.start);
            rangeStart.setHours(0,0,0,0);
            const rangeEnd = dateRange.end ? new Date(dateRange.end) : new Date(dateRange.start);
            rangeEnd.setHours(23,59,59,999);

            start.setTime(rangeStart.getTime());
            end.setTime(rangeEnd.getTime());
            
            const diffTime = Math.abs(end.getTime() - start.getTime());
            prevStart.setTime(start.getTime() - diffTime - 1000);
        } else {
            if (timeRange === 'daily') {
                start.setHours(0,0,0,0);
                prevStart.setDate(prevStart.getDate() - 1);
                prevStart.setHours(0,0,0,0);
            } else if (timeRange === 'weekly') {
                start.setDate(start.getDate() - 7);
                prevStart.setDate(prevStart.getDate() - 14);
            } else if (timeRange === 'monthly') {
                start.setDate(start.getDate() - 30);
                prevStart.setDate(prevStart.getDate() - 60);
            } else if (timeRange === 'yearly') {
                start.setFullYear(start.getFullYear() - 1);
                prevStart.setFullYear(prevStart.getFullYear() - 2);
            }
        }

        const orders = (await ordersApi.list({
            startDate: start.toISOString(),
            endDate: end.toISOString(),
            limit: 1000
        })).filter(order => order.status !== 'Cancelado');

        const prevOrders = (await ordersApi.list({
            startDate: prevStart.toISOString(),
            endDate: start.toISOString(),
            limit: 1000
        })).filter(order => order.status !== 'Cancelado');

        if (orders) {
            // Stats
            const revenue = orders.reduce((acc, o) => acc + Number(o.total_amount), 0);
            const prevRevenue = prevOrders?.reduce((acc, o) => acc + Number(o.total_amount), 0) || 0;
            const prevCount = prevOrders?.length || 0;
            const prevTicket = prevCount > 0 ? prevRevenue / prevCount : 0;

            const count = orders.length;

            const growth = prevRevenue === 0 ? 0 : ((revenue - prevRevenue) / prevRevenue) * 100;

            const today = new Date().toDateString();
            const dailyRevenue = orders
                .filter(o => new Date(o.created_at).toDateString() === today)
                .reduce((acc, o) => acc + Number(o.total_amount), 0);

            setStats({
                totalRevenue: revenue,
                totalOrders: count,
                averageTicket: count > 0 ? revenue / count : 0,
                dailyRevenue: dailyRevenue,
                revenueGrowth: Number(growth.toFixed(1)),
                prevAverageTicket: prevTicket
            });

            const filledChartData = [];
            if (timeRange === 'daily') {
                const groupedHours = orders.reduce((acc: any, o) => {
                    const hour = new Date(o.created_at).getHours();
                    acc[hour] = (acc[hour] || 0) + Number(o.total_amount);
                    return acc;
                }, {});

                for (let i = 0; i < 24; i++) {
                    filledChartData.push({
                        name: `${i.toString().padStart(2, '0')}h`,
                        value: groupedHours[i] || 0
                    });
                }
            } else {
                const groupedLine = orders.reduce((acc: any, o) => {
                    const date = new Date(o.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    acc[date] = (acc[date] || 0) + Number(o.total_amount);
                    return acc;
                }, {});

                const rangeDays = dateRange.start ? Math.max(1, Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))) + 1 : 0;
                const days = dateRange.start ? rangeDays : (timeRange === 'daily' ? 1 : (timeRange === 'weekly' ? 8 : (timeRange === 'monthly' ? 31 : 366)));
                for (let i = 0; i < days; i++) {
                    const d = new Date(start);
                    d.setDate(d.getDate() + i);
                    if (d > end) break;
                    const key = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                    filledChartData.push({
                        name: key,
                        value: groupedLine[key] || 0
                    });
                }
            }
            setChartData(filledChartData);

            // Group by Payment Method for Pie Chart
            const groupedPie = orders.reduce((acc: any, o) => {
                const method = o.payment_method?.includes('PIX') ? 'PIX' : (o.payment_method?.includes('Cartão') ? 'Cartão' : 'Dinheiro');
                acc[method] = (acc[method] || 0) + 1;
                return acc;
            }, {});
            setPaymentData(Object.entries(groupedPie).map(([name, value]) => ({ name, value })));
            setOrdersList(orders || []);
        }
    } catch (e) {
        console.error(e);
    }
    setLoading(false);
  }

  const exportToExcel = async () => {
    try {
      if (ordersList.length === 0) {
        toast.error('Nenhum dado para exportar no periodo selecionado');
        return;
      }

      const fileName = 'Relatorio_Financeiro_' + new Date().toISOString().split('T')[0] + '.csv';
      downloadCsv(fileName, ordersList.map((order) => ({
        'Data/Hora': new Date(order.created_at).toLocaleString('pt-BR'),
        'ID Pedido': '#' + (order.id || 'N/A'),
        'Metodo Pagamento': order.payment_method || 'N/A',
        'Valor': Number(order.total_amount || 0).toFixed(2)
      })));
      toast.success('Relatorio exportado!');
    } catch (error) {
      toast.error('Erro ao exportar');
    }
  };

  const rangeLabels = {
    daily: 'Hoje',
    weekly: 'Últimos 7 dias',
    monthly: 'Últimos 30 dias',
    yearly: 'Este Ano',
    custom: 'Personalizado'
  };

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();
  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  const monthsArr = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
  const fullMonths = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-8 animate-fade-in pb-20 p-4 md:p-10 pt-8 md:pt-12 overflow-x-hidden">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 md:gap-6 bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">


        <div className="flex items-center gap-2 md:gap-3">
            <div className="relative" ref={filterRef}>
                <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-2 px-3 md:px-6 py-2 md:py-3 bg-white border border-gray-100 border-gray-100 rounded-xl hover:border-primary transition-all text-sm md:text-base text-gray-700"
                >
                    <Calendar className="w-4 h-4 text-primary" />
                    <span className="font-medium whitespace-nowrap">
                        {dateRange.start ? (
                            dateRange.end ? `${dateRange.start.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})} - ${dateRange.end.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'})}`
                            : dateRange.start.toLocaleDateString('pt-BR')
                        ) : rangeLabels[timeRange]}
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
                                            setTimeRange(key as TimeRange);
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
                                        <span className="text-xl font-semibold text-gray-800">Selecione o Ano</span>
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
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-8 py-2.5 md:py-3 bg-white border border-gray-100 border-gray-100 text-gray-900 rounded-xl hover:bg-gray-50 hover:border-primary active:scale-95 transition-all cursor-pointer text-sm md:text-base">
                <Download className="w-4 h-4" />
                <span>Relatório</span>
            </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-4 py-3 md:p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-green-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-500 text-xs md:text-xs font-semibold  tracking-wider">Faturamento Total</p>
                    <div className="flex items-center gap-1 text-green-600 text-[9px] md:text-[10px] font-semibold bg-green-50 px-1.5 md:px-2 py-0.5 rounded-full border border-green-100 shrink-0">
                        <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3" />
                         +{stats.revenueGrowth}%
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight font-display">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalRevenue).replace(/\s/g, '')}
                    </h3>
                    <div className="p-1 md:p-3 bg-green-50 text-green-600 rounded-xl shadow-sm shrink-0 ml-4"><DollarSign className="w-5 h-5 md:w-6 md:h-6" /></div>
                </div>
                <div className="mt-4 h-1 w-full bg-gray-50 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-[70%]" />
                </div>
            </div>
        </div>

            <div className="bg-white p-4 py-3 md:p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-gray-500 text-xs md:text-xs font-semibold  tracking-wider">Pedidos Pagos</p>
                    <span className="text-blue-500 text-[9px] md:text-[10px] font-semibold  tracking-widest bg-blue-50 px-1.5 md:px-2 py-0.5 rounded-sm shrink-0">Real</span>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-baseline gap-1 md:gap-2">
                        <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight font-display">{stats.totalOrders}</h3>
                        <span className="text-gray-500 text-xs md:text-xs font-semibold  tracking-wider">unid.</span>
                    </div>
                    <div className="p-1 md:p-3 bg-blue-50 text-blue-600 rounded-xl shadow-sm shrink-0 ml-4"><ShoppingBag className="w-5 h-5 md:w-6 md:h-6" /></div>
                </div>
            </div>
            </div>

            <div className="bg-white p-4 py-3 md:p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <p className="text-gray-500 text-xs md:text-xs font-semibold  tracking-wider mb-3">Ticket Médio</p>
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight font-display">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.averageTicket).replace(/\s/g, '')}
                    </h3>
                    <div className="p-1 md:p-3 bg-orange-50 text-orange-600 rounded-xl shadow-sm shrink-0 ml-4"><CircleDollarSign className="w-5 h-5 md:w-6 md:h-6" /></div>
                </div>
                <p className={`${stats.averageTicket >= stats.prevAverageTicket ? 'text-green-500' : 'text-red-500'} text-xs font-semibold mt-2 flex items-center gap-1 `}>
                    {stats.averageTicket >= stats.prevAverageTicket ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />} 
                    Anterior: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.prevAverageTicket).replace(/\s/g, '')}
                </p>
            </div>
        </div>

            <div className="bg-white p-4 py-3 md:p-8 rounded-xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/50/50 rounded-bl-full -mr-10 -mt-10 group-hover:scale-110 transition-transform"></div>
            <div className="relative z-10">
                <p className="text-gray-500 text-xs md:text-xs font-semibold  tracking-wider mb-3">Faturamento Diário</p>
                <div className="flex items-center justify-between">
                    <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 tracking-tight font-display">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.dailyRevenue).replace(/\s/g, '')}
                    </h3>
                    <div className="p-1 md:p-3 bg-indigo-50/50 text-primary rounded-xl shadow-sm shrink-0 ml-4"><TrendingUp className="w-5 h-5 md:w-6 md:h-6" /></div>
                </div>
                <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-gray-50 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-full animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Line Chart: Revenue */}
        <div className="lg:col-span-2 bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h2 className="text-gray-900 text-lg font-semibold font-display">Fluxo de Receita</h2>
                    <p className="text-gray-500 text-base leading-relaxed">Faturamento bruto por período</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <span className="text-gray-500 text-base leading-relaxed">Total BRL</span>
                </div>
            </div>
            
            <div className="h-[200px] md:h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="primary" stopOpacity={0.15}/>
                                <stop offset="95%" stopColor="primary" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#000', fontSize: 14, fontWeight: 500}} 
                            dy={10}
                            interval={timeRange === 'daily' ? 3 : 'preserveStartEnd'} 
                        />
                        <YAxis 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#666', fontSize: 14, fontWeight: 500}}
                            tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { 
                                style: 'currency', 
                                currency: 'BRL',
                                maximumFractionDigits: 0 
                            }).format(value).replace(/\s/g, '')}
                        />
                        <Tooltip 
                            contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)'}}
                            separator=": "
                            formatter={(value: number) => [new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value), 'Valor']}
                        />
                        <Area type="monotone" dataKey="value" stroke="primary" strokeWidth={4} fillOpacity={1} fill="url(#revenueGradient)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Pie Chart: Payments */}
        <div className="bg-white p-4 md:p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-gray-900 text-lg font-semibold mb-1 font-display">Métodos</h2>
            <p className="text-gray-500 text-base leading-relaxed mb-4">Preferência de Pagamento</p>
            
            <div className="flex-1 min-h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={paymentData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                        >
                            {paymentData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-6">
                {paymentData.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-xl">
                        <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                        <span className="text-gray-500 text-sm font-medium">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>



      {/* Recent Transactions List */}
      <div className="bg-white p-4 md:p-8 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-gray-900 text-lg font-semibold font-display">Últimas Movimentações</h2>
            <Link to="/admin/transactions" className="text-primary text-base leading-relaxed hover:underline">Ver Tudo</Link>
        </div>
        
        <div className="hidden md:block overflow-x-auto no-scrollbar -mx-2">
            <div className="inline-block min-w-full align-middle px-2">
                <table className="min-w-full">
                    <thead>
                        <tr className="border-b border-gray-200">
                            <th className="text-center py-4 px-4 text-xs font-semibold text-gray-500  tracking-widest">Valor</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {ordersList.slice(0, 5).map((order) => (
                            <tr key={order.id} className="group hover:bg-gray-50 transition-colors">
                                <td className="py-4 px-4">
                                    <div className="pl-12 min-w-0">
                                        <p className="text-gray-900 text-base font-medium leading-relaxed truncate">{order.customer_name || 'Cliente'}</p>
                                        <p className="text-gray-400 text-sm font-semibold tracking-tight  truncate">Pedido #{order.id}</p>
                                    </div>
                                </td>
                                <td className="py-4 px-4 text-gray-500 text-base leading-relaxed text-center font-normal">
                                    {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}, {new Date(order.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </td>
                                <td className="py-4 px-4 text-center">
                                    <span className={`px-3 py-1 text-xs font-semibold leading-relaxed rounded-full border  tracking-wide ${
                                        order.payment_method === 'PIX' ? 'bg-indigo-50/50 text-primary border-indigo-100' :
                                        order.payment_method === 'Cartão' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                                        'bg-green-50 text-green-500 border-green-100'
                                    }`}>
                                        {order.payment_method || 'PIX'}
                                    </span>
                                </td>
                                <td className="py-4 px-4 text-center text-gray-900 text-base font-medium">
                                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}
                                </td>
                            </tr>
                        ))}
                        {ordersList.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-10 text-center text-gray-400">Nenhum pedido encontrado neste período</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Mobile Cards View */}
        <div className="md:hidden space-y-4 px-2">
            {ordersList.slice(0, 5).map((tx) => (
                <div key={tx.id} className="bg-white border border-gray-100 p-4 md:p-5 rounded-xl shadow-sm flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                        <div className="flex flex-col gap-0.5">
                            <span className="text-gray-400 text-sm leading-relaxed block">Pedido #{tx.id}</span>
                            <p className="text-gray-900 text-base leading-tight font-medium">{tx.customer_name || 'Cliente'}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-semibold  tracking-widest border ${
                            tx.payment_method === 'PIX' ? 'bg-indigo-50/50 text-primary border-indigo-100' :
                            tx.payment_method === 'Cartão' ? 'bg-blue-50 text-blue-500 border-blue-100' :
                            'bg-green-50 text-green-500 border-green-100'
                        }`}>
                            {tx.payment_method || 'PIX'}
                        </span>
                    </div>
                    
                    <div className="flex justify-between items-end pt-4 border-t border-gray-200">
                        <div className="flex items-center gap-1.5 text-gray-500">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-xs font-normal">{new Date(tx.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}</span>
                        </div>
                        <span className="text-lg font-medium text-gray-900">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(tx.total_amount)}
                        </span>
                    </div>
                </div>
            ))}
            {ordersList.length === 0 && (
                <div className="py-10 text-center text-gray-400">Nenhum pedido encontrado</div>
            )}
        </div>
      </div>
    </div>
  );
}
