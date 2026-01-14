import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { TradingSignal } from '../lib/types';
import SignalCard from '../components/SignalCard';
import { History, Search, Filter, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

export default function HistoryPage() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<TradingSignal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'BUY' | 'SELL'>('all');
  const [sessionFilter, setSessionFilter] = useState<'all' | 'Asian' | 'London' | 'New York'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAllSignals();

    const subscription = supabase
      .channel('trading_signals_history')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'trading_signals' }, () => {
        loadAllSignals();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [signals, searchTerm, filterType, sessionFilter]);

  const loadAllSignals = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('trading_signals')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setSignals(data);
    }
    setIsLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...signals];

    if (searchTerm) {
      filtered = filtered.filter(signal =>
        signal.pair.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(signal => signal.action === filterType);
    }

    if (sessionFilter !== 'all') {
      filtered = filtered.filter(signal => signal.session === sessionFilter);
    }

    setFilteredSignals(filtered);
  };

  const getStats = () => {
    const total = signals.length;
    const buy = signals.filter(s => s.action === 'BUY').length;
    const sell = signals.filter(s => s.action === 'SELL').length;
    const avgConfidence = signals.length > 0
      ? Math.round(signals.reduce((sum, s) => sum + s.confidence, 0) / signals.length)
      : 0;

    return { total, buy, sell, avgConfidence };
  };

  const stats = getStats();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-6">
          <History className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Signal History</h1>
            <p className="text-slate-600 mt-1">View and analyze all your trading signals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Total Signals</p>
                <p className="text-3xl font-bold text-slate-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <History className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Buy Signals</p>
                <p className="text-3xl font-bold text-emerald-600">{stats.buy}</p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Sell Signals</p>
                <p className="text-3xl font-bold text-red-600">{stats.sell}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600 mb-1">Avg Confidence</p>
                <p className="text-3xl font-bold text-blue-600">{stats.avgConfidence}%</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-5 h-5 text-slate-600" />
            <h3 className="text-lg font-bold text-slate-900">Filters</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Search Pair</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g., EUR/USD"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Signal Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as 'all' | 'BUY' | 'SELL')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Signals</option>
                <option value="BUY">Buy Only</option>
                <option value="SELL">Sell Only</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-600 mb-2">Session</label>
              <select
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value as 'all' | 'Asian' | 'London' | 'New York')}
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Sessions</option>
                <option value="Asian">Asian Session</option>
                <option value="London">London Session</option>
                <option value="New York">New York Session</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredSignals.length === 0 ? (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm">
          <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500 text-lg">No signals found</p>
          <p className="text-slate-400 text-sm mt-2">Try adjusting your filters or generate new signals</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-600">
              Showing <span className="font-bold text-slate-900">{filteredSignals.length}</span> of <span className="font-bold text-slate-900">{signals.length}</span> signals
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSignals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
