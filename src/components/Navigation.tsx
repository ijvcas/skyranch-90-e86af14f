
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, Settings, Heart } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/animals', icon: Users, label: 'Animales' },
    { path: '/breeding', icon: Heart, label: 'Breeding' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/settings', icon: Settings, label: 'Ajustes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center space-y-1 min-w-0 ${
              isActive(item.path) 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600'
            }`}
          >
            <item.icon className="w-4 h-4" />
            <span className="text-xs">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default Navigation;
