/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Loader2, 
  RefreshCcw, 
  Calculator, 
  TrendingUp, 
  DollarSign, 
  Info, 
  ArrowRightLeft, 
  ShieldCheck, 
  Coins 
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

interface RateData {
  bcv: { price: number; last_update: string };
  binance: { buy: number; sell: number; avg: number; last_update: string };
}

interface HistoryPoint {
  fecha: string;
  bcv: number;
}

export default function App() {
  const [rates, setRates] = useState<RateData | null>(null);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setRefreshing(true);
    setError(null);
    try {
      // Fetch current rates
      const ratesRes = await fetch('/api/rates');
      if (!ratesRes.ok) throw new Error('Error al obtener tasas');
      const ratesJson = await ratesRes.json();
      setRates(ratesJson);

      // Fetch history
      const historyRes = await fetch('/api/history');
      if (historyRes.ok) {
        const historyJson = await historyRes.json();
        setHistory(historyJson);
      }
    } catch (err: any) {
      console.error('Failed to fetch data', err);
      setError('No se pudieron actualizar algunas tasas. Usando datos de respaldo.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading && !rates) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-950 text-yellow-500">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500 mb-4" />
        <p className="text-slate-400 text-sm font-medium animate-pulse">Cargando tasas en vivo...</p>
      </div>
    );
  }

  // Calculate spread (diferencia porcentual entre Binance y BCV)
  const bcvPrice = rates?.bcv.price ?? 45.8;
  const binancePrice = rates?.binance.avg ?? 46.5;
  const spreadPercent = ((binancePrice - bcvPrice) / bcvPrice) * 100;

  // Format date helper
  const formatDate = (isoString?: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + 
      ' ' + date.toLocaleDateString('es-VE', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden pb-12">
      {/* Dynamic Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-500/5 blur-[150px] pointer-events-none" />

      {/* Main Container */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Glassmorphic Header */}
        <header className="sticky top-0 z-50 my-4 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 backdrop-blur-md shadow-lg">
          <div className="flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-yellow-400 via-amber-200 to-yellow-500 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
                TasaVzla
              </h1>
              <p className="text-[10px] text-slate-400 font-medium tracking-wider uppercase">BCV & Binance P2P</p>
            </div>
          </div>
          <button 
            onClick={fetchData} 
            disabled={refreshing}
            className="flex items-center gap-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 px-3.5 py-2 text-xs font-semibold text-yellow-400 transition-all duration-200 active:scale-95 disabled:opacity-50"
          >
            <RefreshCcw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </header>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300">
            <Info className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <main className="space-y-6">
          
          {/* Rate Cards Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Card Tasa Oficial BCV */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-slate-700/50">
              <div className="absolute top-0 right-0 h-24 w-24 bg-blue-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Tasa Oficial BCV
                </span>
                <span className="text-[10px] text-slate-500">Banco Central</span>
              </div>
              <p className="text-sm text-slate-400 font-medium">1 USD equivale a</p>
              <p className="text-4xl font-black text-slate-100 my-2 tracking-tight">
                Bs. {rates?.bcv.price.toFixed(2)}
              </p>
              <div className="pt-4 border-t border-slate-800/50 flex justify-between items-center text-[11px] text-slate-500">
                <span>Actualizado por BCV</span>
                <span className="font-mono">{formatDate(rates?.bcv.last_update)}</span>
              </div>
            </div>

            {/* Card Binance P2P */}
            <div className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl transition-all duration-300 hover:border-slate-700/50">
              <div className="absolute top-0 right-0 h-24 w-24 bg-yellow-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4">
                <span className="flex items-center gap-2 text-xs font-semibold text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                  <Coins className="h-3.5 w-3.5" />
                  Binance P2P (USDT)
                </span>
                <span className="text-[10px] text-slate-500">Mercado Libre</span>
              </div>
              <p className="text-sm text-slate-400 font-medium">Tasa Promedio</p>
              <p className="text-4xl font-black text-yellow-400 my-2 tracking-tight">
                Bs. {rates?.binance.avg.toFixed(2)}
              </p>
              <div className="grid grid-cols-2 gap-2 mt-3 mb-4 bg-slate-950/40 rounded-xl p-2.5 border border-slate-800/40 text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Comprar</span>
                  <span className="text-slate-200 font-bold">Bs. {rates?.binance.sell.toFixed(2)}</span>
                </div>
                <div className="border-l border-slate-800/80 pl-3">
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Vender</span>
                  <span className="text-slate-200 font-bold">Bs. {rates?.binance.buy.toFixed(2)}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-800/50 flex justify-between items-center text-[11px] text-slate-500">
                <span>Último rastreo P2P</span>
                <span className="font-mono">{formatDate(rates?.binance.last_update)}</span>
              </div>
            </div>

          </section>

          {/* Spread Indicator Banner */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/30 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-yellow-500/10 p-2 border border-yellow-500/20">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Brecha Cambiaria (Diferencia)</p>
                <p className="text-sm text-slate-200 font-medium">La tasa Binance es mayor a la tasa oficial del BCV.</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-sm">
                +{spreadPercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Bidirectional Calculator */}
          <ConverterCard rates={rates ?? { bcv: { price: 45.8, last_update: "" }, binance: { buy: 46.2, sell: 46.8, avg: 46.5, last_update: "" } }} />

          {/* Historical Rate Graph */}
          {history.length > 0 && (
            <section className="rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                <h2 className="text-base font-semibold text-slate-100">Tendencia Tasa Oficial BCV</h2>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBcv" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.5} />
                    <XAxis 
                      dataKey="fecha" 
                      stroke="#64748b" 
                      fontSize={11}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11}
                      domain={['dataMin - 0.5', 'dataMax + 0.5']}
                      tickLine={false}
                      tickFormatter={(v) => `Bs. ${v}`}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#0f172a', 
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#f8fafc',
                        fontSize: '12px'
                      }}
                      formatter={(value: any) => [`Bs. ${Number(value).toFixed(2)}`, 'BCV']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="bcv" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorBcv)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}

        </main>
      </div>
    </div>
  );
}

function ConverterCard({ rates }: { rates: RateData }) {
  const [amount, setAmount] = useState<string>('100');
  const [mode, setMode] = useState<'ves_to_usd' | 'usd_to_ves' | 'ves_to_usdt' | 'usdt_to_ves'>('usd_to_ves');

  const getRate = () => {
    switch (mode) {
      case 'usd_to_ves':
      case 'ves_to_usd':
        return rates.bcv.price;
      case 'usdt_to_ves':
      case 'ves_to_usdt':
        return rates.binance.avg;
    }
  };

  const getSourceCurrency = () => {
    if (mode.startsWith('ves_')) return 'VES';
    return mode.startsWith('usd_') ? 'USD' : 'USDT';
  };

  const getTargetCurrency = () => {
    if (mode.endsWith('_ves')) return 'VES';
    return mode.endsWith('_usd') ? 'USD' : 'USDT';
  };

  const numericAmount = parseFloat(amount) || 0;
  const rate = getRate();
  
  const calculateResult = () => {
    if (mode === 'usd_to_ves' || mode === 'usdt_to_ves') {
      return (numericAmount * rate).toFixed(2);
    } else {
      return (numericAmount / rate).toFixed(2);
    }
  };

  const swapMode = () => {
    switch (mode) {
      case 'usd_to_ves': setMode('ves_to_usd'); break;
      case 'ves_to_usd': setMode('usd_to_ves'); break;
      case 'usdt_to_ves': setMode('ves_to_usdt'); break;
      case 'ves_to_usdt': setMode('usdt_to_ves'); break;
    }
  };

  return (
    <section className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-sm shadow-xl">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5 text-yellow-400" />
        <h2 className="text-base font-semibold text-slate-100">Calculadora de Conversión</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Mode Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tipo de Conversión</label>
          <div className="flex gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-850 p-3 rounded-2xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
            >
              <option value="usd_to_ves">Dólar BCV ➔ Bolívares (Bs)</option>
              <option value="ves_to_usd">Bolívares (Bs) ➔ Dólar BCV</option>
              <option value="usdt_to_ves">USDT Binance ➔ Bolívares (Bs)</option>
              <option value="ves_to_usdt">Bolívares (Bs) ➔ USDT Binance</option>
            </select>
            <button 
              onClick={swapMode}
              type="button"
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 p-3 rounded-2xl text-yellow-400 transition-colors flex items-center justify-center shrink-0"
              title="Invertir dirección"
            >
              <ArrowRightLeft className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Input Amount */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            Cantidad a Convertir ({getSourceCurrency()})
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-semibold">
              {getSourceCurrency() === 'VES' ? 'Bs.' : '$'}
            </span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-850 pl-10 pr-4 py-3 rounded-2xl text-sm font-semibold text-slate-100 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
              placeholder="0.00"
            />
          </div>
        </div>
      </div>

      {/* Output Panel */}
      <div className="rounded-2xl bg-slate-950/60 p-4 border border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Tasa aplicada</span>
          <span className="text-xs text-slate-300 font-mono">1 {getSourceCurrency() === 'VES' ? getTargetCurrency() : getSourceCurrency()} = Bs. {rate.toFixed(2)}</span>
        </div>
        <div className="sm:text-right w-full sm:w-auto">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Monto Estimado</span>
          <span className="text-2xl font-black text-yellow-400 tracking-tight">
            {getTargetCurrency() === 'VES' ? 'Bs. ' : '$'} {calculateResult()}
          </span>
        </div>
      </div>
    </section>
  );
}
