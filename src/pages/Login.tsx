
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
  const { signIn, user, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center animate-pulse">
                <Users className="w-10 h-10 text-white" />
              </div>
              <p className="text-lg text-gray-600">Iniciando SkyRanch...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="tu@correo.com"
                required
                className="mt-2 h-12 text-base"
                disabled={isLoading}
              />
            </div>
            
            <div>
              <Label htmlFor="password" className="text-base font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                placeholder="Tu contraseña"
                required
                className="mt-2 h-12 text-base"
                disabled={isLoading}
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
