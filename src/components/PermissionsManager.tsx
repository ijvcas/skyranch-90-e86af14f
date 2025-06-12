
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { getAllUsers, getCurrentUser, type AppUser } from '@/services/userService';
import { Shield, User, Settings } from 'lucide-react';

interface ModulePermissions {
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
}

interface UserPermissions {
  animals: ModulePermissions;
  lots: ModulePermissions;
  reports: ModulePermissions;
  users: ModulePermissions;
}

const PermissionsManager = () => {
  const [permissions, setPermissions] = useState<Record<string, UserPermissions>>({});

  const { data: users = [] } = useQuery({
    queryKey: ['app-users'],
    queryFn: getAllUsers,
  });

  const { data: currentUser } = useQuery({
    queryKey: ['current-user'],
    queryFn: getCurrentUser,
  });

  // Default permissions structure
  const defaultPermissions: UserPermissions = {
    animals: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    lots: {
      view: true,
      create: false,
      edit: false,
      delete: false,
    },
    reports: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
    users: {
      view: false,
      create: false,
      edit: false,
      delete: false,
    },
  };

  // Initialize permissions based on user roles
  useEffect(() => {
    const initialPermissions: Record<string, UserPermissions> = {};
    
    users.forEach(user => {
      if (user.role === 'admin') {
        // Admins have all permissions
        initialPermissions[user.id] = {
          animals: { view: true, create: true, edit: true, delete: true },
          lots: { view: true, create: true, edit: true, delete: true },
          reports: { view: true, create: true, edit: true, delete: true },
          users: { view: true, create: true, edit: true, delete: true },
        };
      } else if (user.role === 'manager') {
        // Managers have most permissions except user management
        initialPermissions[user.id] = {
          animals: { view: true, create: true, edit: true, delete: true },
          lots: { view: true, create: true, edit: true, delete: false },
          reports: { view: true, create: true, edit: true, delete: false },
          users: { view: true, create: false, edit: false, delete: false },
        };
      } else {
        // Workers have limited permissions
        initialPermissions[user.id] = {
          animals: { view: true, create: true, edit: true, delete: false },
          lots: { view: true, create: false, edit: false, delete: false },
          reports: { view: true, create: false, edit: false, delete: false },
          users: { view: false, create: false, edit: false, delete: false },
        };
      }
    });
    
    setPermissions(initialPermissions);
  }, [users]);

  const updatePermission = (userId: string, module: keyof UserPermissions, action: keyof ModulePermissions, value: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [module]: {
          ...prev[userId]?.[module],
          [action]: value,
        },
      },
    }));
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'worker': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gestión de Permisos</h2>
          <p className="text-muted-foreground">
            Administra los permisos de usuario por módulo y acción
          </p>
        </div>
        <Shield className="w-8 h-8 text-blue-600" />
      </div>

      <div className="grid gap-6">
        {users.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span>{user.name}</span>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground font-normal">
                      {user.email}
                    </p>
                  </div>
                </div>
                {currentUser?.id === user.id && (
                  <Badge variant="outline">Usuario Actual</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(defaultPermissions).map(([module, actions]) => (
                  <div key={module} className="space-y-3">
                    <h4 className="font-medium text-sm uppercase tracking-wide text-muted-foreground">
                      {module}
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries(actions).map(([action, defaultValue]) => (
                        <div key={action} className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            {action.charAt(0).toUpperCase() + action.slice(1)}
                          </label>
                          <Switch
                            checked={permissions[user.id]?.[module as keyof UserPermissions]?.[action as keyof ModulePermissions] ?? defaultValue}
                            onCheckedChange={(value) => updatePermission(user.id, module as keyof UserPermissions, action as keyof ModulePermissions, value)}
                            disabled={user.role === 'admin'} // Admins always have all permissions
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PermissionsManager;
