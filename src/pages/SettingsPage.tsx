import { useState, useEffect } from 'react';
import { Settings, Bell, Database, Zap, Save, Trash2, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SettingsPage() {
  const [telegramEnabled, setTelegramEnabled] = useState(true);
  const [autoModeEnabled, setAutoModeEnabled] = useState(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState(88);
  const [signalFrequency, setSignalFrequency] = useState(5);
  const [showSaveNotification, setShowSaveNotification] = useState(false);
  const [totalSignals, setTotalSignals] = useState(0);
  const [databaseSize, setDatabaseSize] = useState('0 KB');

  useEffect(() => {
    loadStats();
    loadSettings();
  }, []);

  const loadStats = async () => {
    const { data, error } = await supabase
      .from('trading_signals')
      .select('*');

    if (!error && data) {
      setTotalSignals(data.length);
      const sizeInKB = Math.round((JSON.stringify(data).length / 1024) * 100) / 100;
      setDatabaseSize(`${sizeInKB} KB`);
    }
  };

  const loadSettings = () => {
    const savedSettings = localStorage.getItem('tradingSettings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      setTelegramEnabled(settings.telegramEnabled ?? true);
      setAutoModeEnabled(settings.autoModeEnabled ?? false);
      setConfidenceThreshold(settings.confidenceThreshold ?? 88);
      setSignalFrequency(settings.signalFrequency ?? 5);
    }
  };

  const handleSaveSettings = () => {
    const settings = {
      telegramEnabled,
      autoModeEnabled,
      confidenceThreshold,
      signalFrequency,
    };

    localStorage.setItem('tradingSettings', JSON.stringify(settings));
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleClearDatabase = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to clear all trading signals? This action cannot be undone.'
    );

    if (confirmed) {
      await supabase
        .from('trading_signals')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      setTotalSignals(0);
      setDatabaseSize('0 KB');
      alert('Database cleared successfully');
    }
  };

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        </div>
        <p className="text-slate-600">Configure your trading signal preferences</p>
      </div>

      {showSaveNotification && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-green-800 font-semibold">Settings saved successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Telegram Notifications</h3>
                  <p className="text-sm text-slate-600">Send trading signals to your Telegram account</p>
                </div>
                <button
                  onClick={() => setTelegramEnabled(!telegramEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    telegramEnabled ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      telegramEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-emerald-600" />
                <h2 className="text-xl font-bold text-slate-900">Signal Generation</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Auto Mode</h3>
                  <p className="text-sm text-slate-600">Automatically generate signals at intervals</p>
                </div>
                <button
                  onClick={() => setAutoModeEnabled(!autoModeEnabled)}
                  className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                    autoModeEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                      autoModeEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-3">
                  Confidence Threshold: {confidenceThreshold}%
                </label>
                <input
                  type="range"
                  min="70"
                  max="99"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>70%</span>
                  <span>85%</span>
                  <span>99%</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Only generate signals with confidence above this threshold
                </p>
              </div>

              <div>
                <label className="block font-bold text-slate-900 mb-3">
                  Signal Frequency: Every {signalFrequency} minutes
                </label>
                <input
                  type="range"
                  min="1"
                  max="15"
                  value={signalFrequency}
                  onChange={(e) => setSignalFrequency(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>1 min</span>
                  <span>8 min</span>
                  <span>15 min</span>
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  How often to generate new signals in auto mode
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-red-600" />
                <h2 className="text-xl font-bold text-slate-900">Data Management</h2>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Total Signals</p>
                  <p className="text-2xl font-bold text-slate-900">{totalSignals}</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4">
                  <p className="text-sm font-semibold text-slate-600 mb-1">Database Size</p>
                  <p className="text-2xl font-bold text-slate-900">{databaseSize}</p>
                </div>
              </div>

              <button
                onClick={handleClearDatabase}
                className="w-full bg-red-50 hover:bg-red-100 border border-red-200 py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 text-red-600"
              >
                <Trash2 className="w-5 h-5" />
                Clear All Data
              </button>
              <p className="text-sm text-slate-600">
                This will permanently delete all trading signals from the database
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm sticky top-28">
            <h3 className="font-bold text-slate-900 mb-4">Quick Actions</h3>

            <button
              onClick={handleSaveSettings}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 rounded-lg font-bold transition-all flex items-center justify-center gap-2 shadow-lg mb-4"
            >
              <Save className="w-5 h-5" />
              Save Settings
            </button>

            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h4 className="font-bold text-slate-900 mb-2">System Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Telegram</span>
                  <span className={`font-semibold ${telegramEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                    {telegramEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Auto Mode</span>
                  <span className={`font-semibold ${autoModeEnabled ? 'text-green-600' : 'text-slate-400'}`}>
                    {autoModeEnabled ? 'Active' : 'Disabled'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Database</span>
                  <span className="font-semibold text-green-600">Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
