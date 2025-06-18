
import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: React.ReactNode;
}

interface PermissionCategorySectionProps {
  category: string;
  categoryName: string;
  permissions: Permission[];
  roleId: string;
  rolePermissions: string[];
  onPermissionToggle: (roleId: string, permissionId: string, enabled: boolean) => void;
  isLastCategory: boolean;
}

const PermissionCategorySection: React.FC<PermissionCategorySectionProps> = ({
  category,
  categoryName,
  permissions,
  roleId,
  rolePermissions,
  onPermissionToggle,
  isLastCategory
}) => {
  return (
    <div>
      <h4 className="font-medium text-sm mb-3 text-gray-700 flex items-center gap-2">
        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
        {categoryName}
      </h4>
      <div className="space-y-3 pl-4">
        {permissions.map((permission) => (
          <div key={permission.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3 flex-1">
              {permission.icon}
              <div>
                <Label htmlFor={`${roleId}-${permission.id}`} className="font-medium">
                  {permission.name}
                </Label>
                <p className="text-xs text-gray-600 mt-1">{permission.description}</p>
              </div>
            </div>
            <Switch
              id={`${roleId}-${permission.id}`}
              checked={rolePermissions.includes(permission.id)}
              onCheckedChange={(checked: boolean) => 
                onPermissionToggle(roleId, permission.id, checked)
              }
            />
          </div>
        ))}
      </div>
      {!isLastCategory && <Separator className="mt-4" />}
    </div>
  );
};

export default PermissionCategorySection;
