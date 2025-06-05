
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Calendar, 
  Settings, 
  PlusCircle,
  FileText,
  Heart,
  Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import NotificationBell from './NotificationBell';

const MobileNavigation = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Panel' },
    { to: '/animals', icon: Users, label: 'Animales' },
    { to: '/breeding', icon: Heart, label: 'Reproducción' },
    { to: '/calendar', icon: Calendar, label: 'Calendario' },
    { to: '/reports', icon: FileText, label: 'Reportes' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-14">
        <div className="flex justify-between items-center h-full px-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0">
            <img 
              src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
              alt="SkyRanch" 
              className="h-6 w-6 flex-shrink-0"
            />
            <span className="ml-3 text-lg font-bold text-gray-900 whitespace-nowrap">SkyRanch</span>
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            <NotificationBell />
            <NavLink
              to="/animals/new"
              className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm font-medium"
            >
              <PlusCircle className="w-4 h-4" />
            </NavLink>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="grid grid-cols-5 h-16">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center px-1 text-xs font-medium transition-colors',
                  isActive
                    ? 'text-green-600 bg-green-50'
                    : 'text-gray-600'
                )
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Floating Action Button for Notifications on Mobile */}
      <NavLink
        to="/notifications"
        className="md:hidden fixed bottom-20 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg z-40"
      >
        <Bell className="w-6 h-6" />
      </NavLink>
    </>
  );
};

export default MobileNavigation;
