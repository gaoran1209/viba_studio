import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Layers, User, Shirt, RefreshCw, Wand2, Key, FileText, Settings } from 'lucide-react';
import { NavItem, View } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface SidebarProps {
  currentView: View;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView }) => {
  const { t } = useLanguage();
  const location = useLocation();

  // Map View to route path
  const getPath = (view: View): string => {
    switch (view) {
      case View.DERIVATION:
        return '/derivation';
      case View.AVATAR:
        return '/avatar';
      case View.TRY_ON:
        return '/tryon';
      case View.SWAP:
        return '/swap';
      case View.SYSTEM_PROMPTS:
        return '/prompts';
      default:
        return '/';
    }
  };

  const navItems: NavItem[] = [
    { id: View.DERIVATION, label: t.nav.derivation, icon: Layers },
    { id: View.AVATAR, label: t.nav.avatar, icon: User },
    { id: View.TRY_ON, label: t.nav.try_on, icon: Shirt },
    { id: View.SWAP, label: t.nav.swap, icon: RefreshCw },
    { id: View.SYSTEM_PROMPTS, label: t.nav.prompts, icon: FileText },
  ];

  const handleManageApi = async () => {
    // Navigate to settings page instead of AI Studio dialog
    window.location.href = '/settings';
  };

  return (
    <aside className="w-64 bg-white h-screen border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
          <Wand2 size={20} />
        </div>
        <h1 className="text-xl font-bold text-gray-800 tracking-tight">ViBA Studio</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              to={getPath(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon size={20} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-1">
        {/* Settings Link */}
        <Link
          to="/settings"
          className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-full transition-colors ${
            location.pathname === '/settings'
              ? 'bg-blue-50 text-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Settings size={20} />
          Settings
        </Link>

        {/* API Key Status */}
        <button
          onClick={handleManageApi}
          className="w-full flex items-center gap-3 px-2 py-2 text-left rounded-xl hover:bg-gray-50 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-white border border-transparent group-hover:border-gray-200 flex items-center justify-center text-gray-500 transition-all">
            <Key size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{t.nav.manage_api}</p>
            <p className="text-xs text-gray-500 truncate">{t.nav.license}</p>
          </div>
        </button>

        <div className="mt-4 px-2 flex justify-between items-center text-[10px] text-gray-400 font-medium">
          <span>v.2.0</span>
          <span>by Ryan</span>
        </div>
      </div>
    </aside>
  );
};
