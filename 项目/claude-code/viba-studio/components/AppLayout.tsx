import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { HistorySidebar } from './HistorySidebar';
import { View } from '../types';
import { Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const AppLayout: React.FC = () => {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const { t } = useLanguage();

  // Determine current view from route
  const getCurrentView = (): View => {
    const path = window.location.pathname;
    switch (path) {
      case '/derivation':
        return View.DERIVATION;
      case '/avatar':
        return View.AVATAR;
      case '/tryon':
        return View.TRY_ON;
      case '/swap':
        return View.SWAP;
      case '/prompts':
        return View.SYSTEM_PROMPTS;
      case '/settings':
        return View.SYSTEM_PROMPTS; // Use prompts view for settings
      default:
        return View.DERIVATION;
    }
  };

  const currentView = getCurrentView();

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden">
      <Sidebar currentView={currentView} />

      <div className="flex-1 ml-64 flex flex-col h-full">
        <Header currentView={currentView} />

        {/* History Sidebar Bar - Right Side */}
        <aside className={`fixed right-0 top-16 h-[calc(100vh-64px)] bg-white shadow-lg border-l border-gray-200 z-30 transition-transform duration-300 ${
          isHistoryOpen ? 'w-96' : 'w-16'
        }`}>
          {/* Toggle Button / Collapsed State */}
          <button
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
            className="absolute left-0 top-4 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
            style={{ width: isHistoryOpen ? '32px' : '40px', height: isHistoryOpen ? '32px' : '40px' }}
          >
            {isHistoryOpen ? <Clock size={16} /> : <Clock size={20} />}
          </button>

          {/* Expanded Content */}
          {isHistoryOpen && (
            <div className="h-full pl-12 pr-6 pt-4 flex flex-col">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t.common.history}</h2>
              <HistorySidebar isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
            </div>
          )}

          {/* Collapsed Icon Label */}
          {!isHistoryOpen && (
            <div className="absolute left-1/2 -translate-x-1/2 top-1/2 flex items-center justify-center -translate-y-1/2">
              <Clock size={16} className="text-gray-600" />
            </div>
          )}
        </aside>

        <main className={`flex-1 p-8 h-full overflow-auto transition-all duration-300 ${
          isHistoryOpen ? 'mr-96' : 'mr-16'
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
