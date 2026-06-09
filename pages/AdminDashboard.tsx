import React, { useEffect, useState } from 'react';
import { TrendingUp, Clock, AlertTriangle, Edit3, CheckCircle, ShoppingCart, DollarSign, ChevronLeft, ChevronRight, MoreVertical, ChevronDown, Search } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import { Link } from 'react-router-dom';
import { ordersApi } from '../services/api';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ todaySales: 0, pendingOrders: 0, preparingOrders: 0, averageTicket: 0, salesDiff: { value: 0, isPositive: true }, deliveryTime: '42 min' });
  const [chartData, setChartData] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [activityPage, setActivityPage] = useState(0);
  const [hasMoreActivities, setHasMoreActivities] = useState(true);
  const [showNumbers, setShowNumbers] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [chartPeriod, setChartPeriod] = useState('Mensal');
  const [topProductsFilter, setTopProductsFilter] = useState('Mês');
  const ACTIVITY_PAGE_SIZE = 8;

  useEffect(() => {
    fetchStats(); fetchTopProducts();
  }, [topProductsFilter]);

  useEffect(() => {
    fetchRecentActivities(activityPage);
  }, [activityPage]);

  useEffect(() => {
    fetchChartData();
  }, [chartPeriod]);

  async function fetchStats() {
    try {
      const today = new Date(); today.setHours(0,0,0,0);
      const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterdayStart = new Date(today); yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      const yesterdayEnd = new Date(today);

      const todayData = (await ordersApi.list({ startDate: today.toISOString(), endDate: tomorrow.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
      const yesterdayData = (await ordersApi.list({ startDate: yesterdayStart.toISOString(), endDate: yesterdayEnd.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
      const activeOrders = await ordersApi.list({ limit: 1000 });

      const todaySales = todayData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      const yesterdaySales = yesterdayData.reduce((acc, curr) => acc + (Number(curr.total_amount) || 0), 0);
      const averageTicket = todayData.length > 0 ? todaySales / todayData.length : 0;
      let salesDiffObj = { value: 0, isPositive: true };
      if (yesterdaySales > 0) {
        const diff = ((todaySales - yesterdaySales) / yesterdaySales) * 100;
        salesDiffObj = { value: Math.abs(diff), isPositive: diff >= 0 };
      } else if (todaySales > 0) {
        salesDiffObj = { value: 100, isPositive: true };
      }

      setStats({
        todaySales,
        pendingOrders: activeOrders.filter(o => o.status === 'Pendente').length,
        preparingOrders: activeOrders.filter(o => o.status === 'Em Preparo').length,
        averageTicket,
        salesDiff: salesDiffObj,
        deliveryTime: '45 min'
      });
    } catch (error) { console.error(error); }
  }

  async function fetchChartData() {
    const today = new Date();
    today.setHours(0,0,0,0);
    let result = [];
    
    if (chartPeriod === 'Hoje') {
        const data = (await ordersApi.list({ startDate: today.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
        const grouped = data.reduce((acc: any, order: any) => {
            const h = new Date(order.created_at).getHours();
            const label = `${h.toString().padStart(2, '0')}h`;
            acc[label] = (acc[label] || 0) + Number(order.total_amount); return acc;
        }, {});
        const currentHour = new Date().getHours();
        for (let i = Math.max(0, currentHour - 6); i <= currentHour; i++) {
            const name = `${i.toString().padStart(2, '0')}h`;
            const total = grouped?.[name] || 0;
            result.push({ name, Receita: total, Despesa: total * 0.45, Outros: total * 0.1 });
        }
    } else if (chartPeriod === 'Semanal') {
        const last7Days = new Date(); last7Days.setDate(last7Days.getDate() - 6); last7Days.setHours(0,0,0,0);
        const data = (await ordersApi.list({ startDate: last7Days.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
        const days = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'];
        const grouped = data.reduce((acc: any, order: any) => {
            const date = new Date(order.created_at); const dayName = days[date.getDay()];
            acc[dayName] = (acc[dayName] || 0) + Number(order.total_amount); return acc;
        }, {});
        for (let i = 6; i >= 0; i--) {
            const d = new Date(); d.setDate(d.getDate() - i); const name = days[d.getDay()];
            const total = grouped?.[name] || 0;
            result.push({ name, Receita: total, Despesa: total * 0.45, Outros: total * 0.1 });
        }
    } else {
        const last30Days = new Date(); last30Days.setDate(last30Days.getDate() - 29); last30Days.setHours(0,0,0,0);
        const data = (await ordersApi.list({ startDate: last30Days.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
        const grouped = data.reduce((acc: any, order: any) => {
            const date = new Date(order.created_at); const dateStr = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
            acc[dateStr] = (acc[dateStr] || 0) + Number(order.total_amount); return acc;
        }, {});
        for (let i = 4; i >= 0; i--) {
            let weekTotal = 0;
            const endD = new Date(); endD.setDate(endD.getDate() - (i * 6));
            const startD = new Date(endD); startD.setDate(endD.getDate() - 5);
            for(let j=0; j<=5; j++) {
                const subD = new Date(startD); subD.setDate(startD.getDate() + j);
                weekTotal += grouped?.[subD.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] || 0;
            }
            const name = `${startD.getDate()}/${startD.getMonth()+1} - ${endD.getDate()}/${endD.getMonth()+1}`;
            result.push({ name, Receita: weekTotal, Despesa: weekTotal * 0.45, Outros: weekTotal * 0.1 });
        }
    }
    setChartData(result);
  }

  async function fetchRecentActivities(p = 0) {
    const data = await ordersApi.list({ limit: (p + 1) * ACTIVITY_PAGE_SIZE });
    const pageData = (data || []).slice(p * ACTIVITY_PAGE_SIZE, (p + 1) * ACTIVITY_PAGE_SIZE);
    setRecentActivities(pageData);
    setHasMoreActivities((data?.length || 0) > (p + 1) * ACTIVITY_PAGE_SIZE);
  }

  async function fetchTopProducts() {
    let dateLimit = new Date();
    if (topProductsFilter === 'Hoje') {
        dateLimit.setHours(0,0,0,0);
    } else if (topProductsFilter === 'Semana') {
        dateLimit.setDate(dateLimit.getDate() - 7);
    } else {
        dateLimit.setDate(dateLimit.getDate() - 30);
    }

    const orders = (await ordersApi.list({ startDate: dateLimit.toISOString(), limit: 1000 })).filter(o => o.status !== 'Cancelado');
    const allData = orders.flatMap((order: any) => order.order_items || []);
    const grouped = allData.reduce((acc: any, item: any) => {
        const name = item.product_name; if (!acc[name]) acc[name] = { name, count: 0, img: item.product?.img, category: item.product?.category };
        acc[name].count += item.quantity; return acc;
    }, {});
    const result = Object.values(grouped || {}).sort((a: any, b: any) => b.count - a.count).slice(0, 5);
    setTopProducts(result);
  }
  return (
    <div className="max-w-[1400px] mx-auto space-y-4 animate-fade-in font-sans pt-12 px-4 md:px-0 overflow-x-hidden">
      <header>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Card 1: Vendas Hoje */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-50 flex flex-col justify-between transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-400/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Vendas Hoje</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-display">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.todaySales).replace(/\s/g, '')}
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-bold shadow-sm ${stats.salesDiff?.isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {stats.salesDiff?.isPositive ? '+' : '-'} {stats.salesDiff?.value.toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Pendentes */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-50 flex flex-col justify-between transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div className={`w-10 h-10 rounded-full ${stats.pendingOrders > 0 ? 'bg-blue-500 shadow-blue-500/30 shadow-lg animate-pulse' : 'bg-blue-400 shadow-blue-400/20 shadow-md'} flex items-center justify-center text-white`}>
                <ShoppingCart className="w-5 h-5" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Pedidos Pendentes</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-display">
                  {stats.pendingOrders}
                </h3>
                {stats.pendingOrders > 0 && (
                  <div className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold shadow-sm">
                    Ação!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Em Preparo */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-50 flex flex-col justify-between transition-all relative overflow-hidden group">
            <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-red-400 flex items-center justify-center text-white shadow-md shadow-red-400/20">
                <Clock className="w-5 h-5" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Em Preparo</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-display">
                  {stats.preparingOrders}
                </h3>
              </div>
            </div>
          </div>

          {/* Card 4: Ticket Médio */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-gray-50 flex flex-col justify-between transition-all relative overflow-hidden group">
             <div className="flex justify-between items-start mb-3">
              <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white shadow-md shadow-green-500/20">
                <TrendingUp className="w-5 h-5" />
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Ticket Médio</p>
              <div className="flex justify-between items-end">
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight font-display">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.averageTicket).replace(/\s/g, '')}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h2 className="text-gray-900 text-lg font-bold font-display shrink-0 text-left">Desempenho Geral</h2>
              
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm font-semibold text-gray-600 border border-gray-100 rounded-xl p-1 md:bg-white md:shadow-sm md:border md:border-gray-50 bg-gray-50/50">
                {/* Toggles */}
                <div className="flex items-center gap-4 pl-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xs text-gray-500 font-bold tracking-wide">Números</span>
                    <button 
                      onClick={() => setShowNumbers(!showNumbers)}
                      className={`w-9 h-5 rounded-full transition-all duration-300 relative flex items-center mb-0.5 ${showNumbers ? 'bg-orange-500 shadow-sm shadow-orange-500/20' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${showNumbers ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <span className="text-xs text-gray-500 font-bold tracking-wide">Análises</span>
                    <button 
                      onClick={() => setShowAnalytics(!showAnalytics)}
                      className={`w-9 h-5 rounded-full transition-all duration-300 relative flex items-center mb-0.5 ${showAnalytics ? 'bg-orange-500 shadow-sm shadow-orange-500/20' : 'bg-gray-200'}`}
                    >
                      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-300 shadow-sm ${showAnalytics ? 'translate-x-4' : 'translate-x-0'}`} />
                    </button>
                  </label>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px h-6 bg-gray-200"></div>

                {/* Period Selector */}
                <div className="flex gap-1 md:bg-gray-50/50 p-0.5 rounded-lg border-none md:border md:border-gray-100">
                   {['Mensal', 'Semanal', 'Hoje'].map((period) => (
                      <button 
                        key={period}
                        onClick={() => setChartPeriod(period)}
                        className={`px-3 py-1.5 rounded-md transition-all text-xs font-bold tracking-wider ${chartPeriod === period ? 'bg-orange-50 text-orange-500 shadow-[0_1px_2px_rgba(0,0,0,0.02)]' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        {period}
                      </button>
                   ))}
                </div>
              </div>
            </div>
            <div className="h-[280px] md:h-[340px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 40, right: 10, left: 10, bottom: 20 }} barSize={8} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis 
                            dataKey="name" 
                            axisLine={false} 
                            tickLine={false} 
                            tick={{fill: '#9CA3AF', fontSize: 12, fontWeight: 600}} 
                            interval={0}
                            dy={10}
                        />
                        <YAxis hide domain={[0, (dataMax: number) => dataMax * 1.3]} />
                        <Tooltip 
                            formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
                            contentStyle={{borderRadius: '16px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', fontWeight: 'bold'}} 
                            cursor={{fill: '#F9FAFB'}}
                        />
                        <Legend verticalAlign="bottom" height={36} iconType="square" wrapperStyle={{ fontSize: '14px', fontWeight: 600, color: '#4B5563', paddingTop: '20px' }} />
                        <Bar dataKey="Receita" fill="#F97316" radius={[2, 2, 0, 0]}>
                            {showNumbers && <LabelList dataKey="Receita" position="top" offset={12} dx={5} fill="#F97316" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? `R$${val.toFixed(0)}` : ''} />}
                        </Bar>
                        {showAnalytics && (
                           <>
                             <Bar dataKey="Despesa" fill="#4B5563" radius={[2, 2, 0, 0]}>
                               {showNumbers && <LabelList dataKey="Despesa" position="top" offset={12} dx={5} fill="#4B5563" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? `R$${val.toFixed(0)}` : ''} />}
                             </Bar>
                             <Bar dataKey="Outros" fill="#D1D5DB" radius={[2, 2, 0, 0]}>
                               {showNumbers && <LabelList dataList="Outros" position="top" offset={12} dx={5} fill="#D1D5DB" fontSize={10} fontWeight="bold" formatter={(val: number) => val > 0 ? `R$${val.toFixed(0)}` : ''} />}
                             </Bar>
                           </>
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-100 flex flex-col h-[380px] md:h-[440px] overflow-hidden">
          <div className="flex justify-between items-center mb-6 shrink-0">
            <h2 className="text-gray-900 text-lg font-bold font-display">Pedidos da Semana</h2>
            <button className="text-gray-400 hover:text-gray-600"><MoreVertical className="w-5 h-5"/></button>
          </div>
          <div className="space-y-6 overflow-y-auto no-scrollbar flex-1 pb-4 pr-2">
            {recentActivities.length === 0 ? (<p className="text-gray-500 text-sm">Sem atividade recente.</p>) : (
                recentActivities.map((order) => (
                    <div key={order.id} className="flex gap-4 items-center group cursor-pointer">
                        <div className="w-10 h-10 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center shrink-0 border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors"><ShoppingCart className="w-4 h-4" /></div>
                        <div className="flex-1 min-w-0">
                            <p className="text-gray-900 text-sm font-semibold truncate">
                                Pedido #{order.id} <span className="text-gray-400 font-normal ml-1">- {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                            </p>
                            <div className="flex items-center justify-between mt-0.5">
                                <p className="text-gray-500 text-xs truncate">{order.customer_name}</p>
                                <p className="text-gray-900 text-base font-bold">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total_amount)}</p>
                            </div>
                        </div>
                    </div>
                ))
            )}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-gray-50 shrink-0">
            <span className="text-xs text-gray-500 font-medium">Pg {activityPage + 1}</span>
            <div className="flex gap-2">
              <button onClick={() => setActivityPage(prev => Math.max(0, prev - 1))} disabled={activityPage === 0} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={() => setActivityPage(prev => prev + 1)} disabled={!hasMoreActivities} className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-100 bg-white text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 transition-all cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-10">
         <div className="p-4 md:p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
             <h2 className="text-gray-900 text-lg font-bold font-display">Mais Vendidos</h2>
             <div className="flex items-center gap-3">
                 <div className="relative w-full md:w-auto">
                     <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input type="text" placeholder="Pesquisar..." className="w-full pl-9 pr-4 py-2 bg-transparent border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                 </div>
                 <select 
                    value={topProductsFilter} 
                    onChange={(e) => setTopProductsFilter(e.target.value)} 
                    className="border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-600 font-semibold hover:bg-gray-50 transition-colors shadow-sm focus:outline-none cursor-pointer appearance-none bg-white"
                 >
                     <option value="Hoje">Hoje</option>
                     <option value="Semana">Semana</option>
                     <option value="Mês">Mês</option>
                 </select>
             </div>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                    <tr className="bg-white text-gray-400 text-sm tracking-wider font-semibold border-b border-gray-50">
                         <th className="p-4 pl-6">
                             <div className="flex items-center gap-1 cursor-pointer hover:text-gray-600">Produto <ChevronDown className="w-3 h-3"/></div>
                         </th>
                         <th className="p-4 text-center">
                             <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600">Categoria <ChevronDown className="w-3 h-3"/></div>
                         </th>
                         <th className="p-4 text-center">
                             <div className="flex items-center justify-center gap-1 cursor-pointer hover:text-gray-600">Quantidade <ChevronDown className="w-3 h-3"/></div>
                         </th>
                         <th className="p-4 text-right pr-6">
                             <div className="flex items-center justify-end gap-1 cursor-pointer hover:text-gray-600">Valor <ChevronDown className="w-3 h-3"/></div>
                         </th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 text-sm">
                 {topProducts.length === 0 ? (
                     <tr><td colSpan={5} className="p-6 text-center text-gray-500">Nenhum produto encontrado.</td></tr>
                 ) : (
                     topProducts.map((p: any, idx) => (
                         <tr key={idx} className="hover:bg-gray-50/50 transition-colors group cursor-pointer">
                             <td className="p-4 pl-6 whitespace-nowrap">
                                 <div className="flex items-center gap-3">
                                     <div className="w-10 h-10 rounded-lg bg-gray-100 bg-cover bg-center border border-gray-100" style={{backgroundImage: `url('${p.img || '/logo.png'}')`}}></div>
                                     <span className="font-semibold text-gray-800">{p.name}</span>
                                 </div>
                             </td>
                             <td className="p-4 text-center text-gray-500 font-medium">
                                 {p.category || 'Geral'}
                             </td>
                             <td className="p-4 text-center font-semibold text-gray-700">
                                 {p.count}
                             </td>
                             <td className="p-4 text-right pr-6 font-bold text-gray-900">
                                 {/* Assuming each product has an estimated amount logic, here I'll just mock it or calculate count * 20 */}
                                 {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(p.count * 35.90)}
                             </td>
                         </tr>
                     ))
                 )}
                 </tbody>
             </table>
         </div>
      </div>
    </div>
  );
}
