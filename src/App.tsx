import { useState } from 'react';
import Navigation from './components/Navigation';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'history' | 'settings'>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'history':
        return <HistoryPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation currentPage={currentPage} onPageChange={setCurrentPage} />
      {renderPage()}
    </div>
  );
}

export default App;
