
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, Users, Calendar, FileText, Heart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const MobileNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useIsMobile();

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Inicio' },
    { path: '/animals', icon: Users, label: 'Animales' },
    { path: '/breeding', icon: Heart, label: 'Breeding' },
    { path: '/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/reports', icon: FileText, label: 'Reportes' },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (!isMobile) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Button
            key={item.path}
            variant={isActive(item.path) ? "default" : "ghost"}
            size="sm"
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center space-y-1 min-w-0 px-3 py-2 min-h-[60px] ${
              isActive(item.path) 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs leading-tight">{item.label}</span>
          </Button>
        ))}
      </div>
    </nav>
  );
};

export default MobileNavigation;
