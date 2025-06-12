
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const AuthenticationStatusCard = () => {
  const { user, session } = useAuth();
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'error' | 'unauthenticated'>('checking');
  const [sessionInfo, setSessionInfo] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const checkAuthStatus = async () => {
    try {
      setAuthStatus('checking');
      
      // Check current session
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        setAuthStatus('error');
        return;
      }
      
      if (session && session.user) {
        setAuthStatus('authenticated');
        setSessionInfo({
          userId: session.user.id,
          email: session.user.email,
          lastSignIn: session.user.last_sign_in_at,
          tokenExpiry: session.expires_at
        });
      } else {
        setAuthStatus('unauthenticated');
        setSessionInfo(null);
      }
    } catch (error) {
      console.error('Unexpected auth error:', error);
      setAuthStatus('error');
    }
  };

  const handleRefreshAuth = async () => {
    setIsRefreshing(true);
    await checkAuthStatus();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  useEffect(() => {
    checkAuthStatus();
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'No user');
        checkAuthStatus();
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const getStatusIcon = () => {
    switch (authStatus) {
      case 'authenticated':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'unauthenticated':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (authStatus) {
      case 'authenticated':
        return 'bg-green-100 text-green-800';
      case 'unauthenticated':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = () => {
    switch (authStatus) {
      case 'authenticated':
        return 'Autenticado';
      case 'unauthenticated':
        return 'No autenticado';
      case 'error':
        return 'Error de autenticación';
      default:
        return 'Verificando...';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Estado de Autenticación
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshAuth}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Estado:</span>
          <div className="flex items-center space-x-2">
            {getStatusIcon()}
            <Badge className={getStatusColor()}>
              {getStatusText()}
            </Badge>
          </div>
        </div>
        
        {sessionInfo && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Usuario:</span>
              <span className="text-sm font-mono text-gray-800">
                {sessionInfo.email}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">ID de Usuario:</span>
              <span className="text-xs font-mono text-gray-600">
                {sessionInfo.userId.substring(0, 8)}...
              </span>
            </div>
            
            {sessionInfo.lastSignIn && (
              <div className="space-y-1">
                <span className="text-sm text-gray-600">Último acceso:</span>
                <p className="text-xs text-gray-500">
                  {new Date(sessionInfo.lastSignIn).toLocaleString('es-ES')}
                </p>
              </div>
            )}
            
            {sessionInfo.tokenExpiry && (
              <div className="space-y-1">
                <span className="text-sm text-gray-600">Token expira:</span>
                <p className="text-xs text-gray-500">
                  {new Date(sessionInfo.tokenExpiry * 1000).toLocaleString('es-ES')}
                </p>
              </div>
            )}
          </>
        )}
        
        {authStatus === 'error' && (
          <div className="text-xs text-red-600 bg-red-50 p-2 rounded">
            Error al verificar el estado de autenticación. Verifica la configuración de Supabase.
          </div>
        )}
        
        {authStatus === 'unauthenticated' && (
          <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
            Usuario no autenticado. Inicia sesión para acceder a todas las funciones.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthenticationStatusCard;
