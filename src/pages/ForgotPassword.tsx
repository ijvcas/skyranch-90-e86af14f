
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { KeyRound, ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email requerido",
        description: "Por favor ingresa tu email.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        toast({
          title: "Error",
          description: `Error al enviar reset: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setEmailSent(true);
        toast({
          title: "Email Enviado",
          description: `Se ha enviado un email de reset a ${email}.`,
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
      setIsSubmitting(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="text-center pb-6">
            <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Email Enviado
            </CardTitle>
            <p className="text-gray-600 text-lg">
              Revisa tu bandeja de entrada
            </p>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-600 mb-6">
              Hemos enviado un email a <strong>{email}</strong> con instrucciones para restablecer tu contraseña.
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={() => navigate('/login')}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Volver al Login
              </Button>
              
              <Button
                variant="outline"
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full"
              >
                Enviar otro email
              </Button>
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
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Restablecer Contraseña
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Ingresa tu email para recibir un link de reset
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-medium">Correo Electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="mt-2 h-12 text-base"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Enviando...
                </div>
              ) : (
                "Enviar Email de Reset"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al Login
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
