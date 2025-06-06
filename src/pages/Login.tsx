
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const { error } = await signIn(formData.email, formData.password);
      
      if (error) {
        console.error('Login error:', error);
        toast({
          title: "Error de inicio de sesión",
          description: error.message === 'Invalid login credentials' 
            ? "Credenciales inválidas. Verifica tu email y contraseña."
            : error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Bienvenido",
          description: "Sesión iniciada correctamente.",
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "Ocurrió un error inesperado. Intenta de nuevo.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4 px-6">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            SkyRanch
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Inicia sesión para gestionar tus animales
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6" autoComplete="off">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                name="login-email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@correo.com"
                required
                className="mt-2 h-12 text-base"
                disabled={isLoading}
                autoComplete="username"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-base font-medium">Contraseña</Label>
              <Input
                id="password"
                name="login-password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Tu contraseña"
                required
                className="mt-2 h-12 text-base"
                disabled={isLoading}
                autoComplete="current-password"
                data-1p-ignore
                data-lpignore="true"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold mt-8"
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-base text-gray-600">
              ¿No tienes cuenta?{' '}
              <Button 
                variant="link" 
                className="p-0 text-green-600 text-base font-semibold"
                onClick={() => navigate('/register')}
                disabled={isLoading}
              >
                Registrarse
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
