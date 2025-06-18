
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User } from 'lucide-react';
import PermissionCategorySection from './PermissionCategorySection';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

interface RoleCardProps {
  role: Role;
  categorizedPermissions: Record<string, Permission[]>;
  getCategoryName: (category: string) => string;
  onPermissionToggle: (roleId: string, permissionId: string, enabled: boolean) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
  role,
  categorizedPermissions,
  getCategoryName,
  onPermissionToggle
}) => {
  const categoryEntries = Object.entries(categorizedPermissions);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {role.name}
          </CardTitle>
          <Badge className={role.color}>
            {role.permissions.length} permisos activos
          </Badge>
        </div>
        <p className="text-sm text-gray-600">{role.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {categoryEntries.map(([category, categoryPermissions], index) => (
          <PermissionCategorySection
            key={category}
            category={category}
            categoryName={getCategoryName(category)}
            permissions={categoryPermissions}
            roleId={role.id}
            rolePermissions={role.permissions}
            onPermissionToggle={onPermissionToggle}
            isLastCategory={index === categoryEntries.length - 1}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default RoleCard;
