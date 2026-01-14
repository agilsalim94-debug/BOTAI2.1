import { LayoutDashboard, History, Settings, Zap } from 'lucide-react';

interface NavigationProps {
  currentPage: 'dashboard' | 'history' | 'settings';
  onPageChange: (page: 'dashboard' | 'history' | 'settings') => void;
}

export default function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history' as const, label: 'History', icon: History },
    { id: 'settings' as const, label: 'Settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Trading Signals</h1>
              <p className="text-xs text-slate-500">AI-Powered Signal Generator</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <span className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              System Active
            </span>
          </div>
        </div>

        <nav className="flex gap-1 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all rounded-t-lg ${
                  isActive
                    ? 'bg-slate-50 text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
