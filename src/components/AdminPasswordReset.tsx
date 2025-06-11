
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AdminPasswordReset = () => {
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('jvcas@mac.com');
  const [isResetting, setIsResetting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
          description: `Se ha enviado un email de reset a ${email}`,
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
          Admin - Reset de Contraseña
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <p className="text-xs text-gray-500 mt-2">
            Esto limpiará toda la data de sesión y recargará la página
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPasswordReset;
