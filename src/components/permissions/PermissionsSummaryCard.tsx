
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  permissions: string[];
}

interface PermissionsSummaryCardProps {
  roles: Role[];
}

const PermissionsSummaryCard: React.FC<PermissionsSummaryCardProps> = ({ roles }) => {
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Resumen de Permisos
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roles.map((role) => (
            <div key={role.id} className="text-center">
              <Badge className={`${role.color} mb-2`}>
                {role.name}
              </Badge>
              <p className="text-2xl font-bold text-gray-800">{role.permissions.length}</p>
              <p className="text-sm text-gray-600">permisos asignados</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PermissionsSummaryCard;
