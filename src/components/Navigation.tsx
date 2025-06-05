
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

const Navigation = () => {
  const navItems = [
    { to: '/dashboard', icon: Home, label: 'Panel' },
    { to: '/animals', icon: Users, label: 'Animales' },
    { to: '/breeding', icon: Heart, label: 'Reproducción' },
    { to: '/calendar', icon: Calendar, label: 'Calendario' },
    { to: '/reports', icon: FileText, label: 'Reportes' },
    { to: '/notifications', icon: Bell, label: 'Notificaciones' },
    { to: '/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <nav className="hidden md:flex fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center h-full">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 min-w-0 mr-8">
            <img 
              src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
              alt="SkyRanch" 
              className="h-8 w-8 flex-shrink-0"
            />
            <span className="ml-4 text-xl font-bold text-gray-900 whitespace-nowrap">SkyRanch</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 flex-shrink-0">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap',
                    isActive
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  )
                }
              >
                <item.icon className="w-5 h-5 mr-2 flex-shrink-0" />
                {item.label}
              </NavLink>
            ))}
            
            {/* Add Animal Button */}
            <NavLink
              to="/animals/new"
              className="flex items-center px-4 py-2 ml-4 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              Agregar Animal
            </NavLink>

            {/* Notification Bell */}
            <div className="ml-4 flex-shrink-0">
              <NotificationBell />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
