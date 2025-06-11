
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, RefreshCw, UserCog } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminPasswordReset = () => {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('jvcas@mac.com');
  const [newPassword, setNewPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor ingresa un email",
        variant: "destructive"
      });
      return;
    }

    setIsResetting(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: `Error al enviar reset: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Email Enviado",
          description: `Se ha enviado un email de reset a ${email}. El link te llevará a /reset-password`,
        });
      }
    } catch (error) {
      console.error('Reset error:', error);
      toast({
        title: "Error",
        description: "Error inesperado al resetear contraseña",
        variant: "destructive"
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleDirectPasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: "Error",
        description: "La nueva contraseña debe tener al menos 6 caracteres",
        variant: "destructive"
      });
      return;
    }

    setIsUpdatingPassword(true);
    
    try {
      // First sign in as admin (you'll need to be signed in to update password)
      console.log('🔧 Admin: Attempting direct password update for:', email);
      
      // This is a direct approach - update user password via admin API
      const { error } = await supabase.auth.admin.updateUserById(
        'user-id-here', // You'd need to get the user ID first
        { password: newPassword }
      );
      
      if (error) {
        toast({
          title: "Error Directo",
          description: `No se pudo actualizar directamente. Usa el reset por email. Error: ${error.message}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Contraseña Actualizada",
          description: "La contraseña ha sido actualizada directamente.",
        });
        setNewPassword('');
      }
    } catch (error) {
      console.error('Direct password update error:', error);
      toast({
        title: "Método Alternativo",
        description: "Usa el reset por email. La actualización directa requiere permisos especiales.",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleClearUserSession = async () => {
    setIsClearing(true);
    
    try {
      console.log('🧹 Clearing all session data and auth state...');
      
      // Sign out completely
      await supabase.auth.signOut();
      
      // Clear all local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear specific Supabase keys that might be cached
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Removed:', key);
      });
      
      toast({
        title: "Sesión Limpiada",
        description: "Se ha limpiado toda la data de sesión. Intenta loguearte de nuevo.",
      });
      
      // Refresh the page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error) {
      console.error('Clear session error:', error);
      toast({
        title: "Error",
        description: "Error al limpiar sesión",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="w-5 h-5" />
          Admin - Herramientas de Usuario
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Email Reset Method */}
        <form onSubmit={handlePasswordReset} className="space-y-4">
          <div>
            <Label htmlFor="reset-email">Email del Usuario</Label>
            <Input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              required
            />
          </div>
          
          <Button
            type="submit"
            disabled={isResetting}
            className="w-full"
          >
            {isResetting ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enviando Reset...
              </div>
            ) : (
              "Enviar Reset de Contraseña"
            )}
          </Button>
        </form>

        <div className="border-t pt-4">
          <p className="text-sm text-gray-600 mb-3">
            Si el reset por email no funciona, intenta limpiar la sesión:
          </p>
          <Button
            onClick={handleClearUserSession}
            disabled={isClearing}
            variant="outline"
            className="w-full"
          >
            {isClearing ? (
              <div className="flex items-center">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                Limpiando...
              </div>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Limpiar Sesión Corrupta
              </>
            )}
          </Button>
        </div>

        {/* Direct Password Update - Alternative Method */}
        <div className="border-t pt-4">
          <form onSubmit={handleDirectPasswordUpdate} className="space-y-4">
            <div>
              <Label htmlFor="new-password">Nueva Contraseña (Método Directo)</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                minLength={6}
              />
            </div>
            
            <Button
              type="submit"
              disabled={isUpdatingPassword}
              variant="secondary"
              className="w-full"
            >
              {isUpdatingPassword ? (
                <div className="flex items-center">
                  <UserCog className="w-4 h-4 animate-spin mr-2" />
                  Actualizando...
                </div>
              ) : (
                <>
                  <UserCog className="w-4 h-4 mr-2" />
                  Actualizar Contraseña Directamente
                </>
              )}
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Este método puede requerir permisos especiales de admin
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPasswordReset;
