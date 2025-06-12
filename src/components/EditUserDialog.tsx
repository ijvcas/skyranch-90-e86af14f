
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Pencil, Save, X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUser, validatePhoneNumber, formatPhoneNumber, type AppUser } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';

interface EditUserDialogProps {
  user: AppUser;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditUserDialog: React.FC<EditUserDialogProps> = ({
  user,
  isOpen,
  onOpenChange
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    role: user.role,
    is_active: user.is_active
  });

  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active
    });
    setPhoneError('');
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<AppUser>) => updateUser(user.id, data),
    onSuccess: () => {
      toast({
        title: "Usuario actualizado",
        description: "Los datos del usuario se han actualizado correctamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['app-users'] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el usuario.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Validate phone number in real-time
    if (field === 'phone') {
      if (value && !validatePhoneNumber(value)) {
        setPhoneError('Formato de teléfono inválido. Use formatos como +1234567890, (123) 456-7890, o 123-456-7890');
      } else {
        setPhoneError('');
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final phone validation
    if (formData.phone && !validatePhoneNumber(formData.phone)) {
      setPhoneError('Formato de teléfono inválido');
      return;
    }

    // Prevent editing admin users' roles
    const isAdminUser = user.email === 'juan.casanova@skyranch.com' || user.email === 'jvcas@mac.com';
    
    const updateData: Partial<AppUser> = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      role: isAdminUser ? user.role : formData.role, // Don't allow role change for admin users
      is_active: formData.is_active
    };

    updateMutation.mutate(updateData);
  };

  const isAdminUser = user.email === 'juan.casanova@skyranch.com' || user.email === 'jvcas@mac.com';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="w-5 h-5" />
            Editar Usuario
          </DialogTitle>
          <DialogDescription>
            Modifica la información del usuario. Los campos marcados con * son obligatorios.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre Completo *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ingrese el nombre completo"
              required
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
              disabled={updateMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+1 (555) 123-4567"
              disabled={updateMutation.isPending}
            />
            {phoneError && (
              <p className="text-sm text-red-600">{phoneError}</p>
            )}
            <p className="text-xs text-gray-500">
              Formatos válidos: +1234567890, (123) 456-7890, 123-456-7890
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select
              value={formData.role}
              onValueChange={(value: 'admin' | 'manager' | 'worker') => handleInputChange('role', value)}
              disabled={updateMutation.isPending || isAdminUser}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="manager">Gerente</SelectItem>
                <SelectItem value="worker">Trabajador</SelectItem>
              </SelectContent>
            </Select>
            {isAdminUser && (
              <p className="text-xs text-gray-500">
                No se puede cambiar el rol de usuarios administradores principales.
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
              disabled={updateMutation.isPending || isAdminUser}
            />
            <Label htmlFor="is_active">Usuario Activo</Label>
            {isAdminUser && (
              <p className="text-xs text-gray-500 ml-2">
                (Los administradores principales no se pueden desactivar)
              </p>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateMutation.isPending}
            >
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateMutation.isPending || !!phoneError}
            >
              {updateMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </div>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditUserDialog;
