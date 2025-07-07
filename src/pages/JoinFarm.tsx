import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Users, ArrowLeft } from 'lucide-react';

const JoinFarm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteCode.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un código de invitación.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement invite code validation and farm joining logic
      toast({
        title: "Funcionalidad en desarrollo",
        description: "La funcionalidad de unirse a fincas estará disponible pronto.",
        variant: "destructive"
      });
    } catch (error) {
      console.error('Join farm error:', error);
      toast({
        title: "Error",
        description: "Código de invitación inválido.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/welcome')}
            className="absolute top-4 left-4 p-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Users className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Unirse a una Finca
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Ingresa el código de invitación
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="inviteCode" className="text-base font-medium">Código de Invitación</Label>
              <Input
                id="inviteCode"
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="ABC123XYZ"
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
              {isLoading ? "Verificando..." : "Unirse a la Finca"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-base text-gray-600">
              ¿No tienes código de invitación?{' '}
              <Button 
                variant="link" 
                className="p-0 text-green-600 text-base font-semibold"
                onClick={() => navigate('/register')}
                disabled={isLoading}
              >
                Crear Nueva Finca
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default JoinFarm;