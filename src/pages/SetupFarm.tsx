import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Building2 } from 'lucide-react';

const SetupFarm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    farmType: 'livestock',
    location: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "El nombre de la finca es requerido.",
        variant: "destructive"
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "Usuario no autenticado.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create the farm
      const { data: farm, error: farmError } = await supabase
        .from('farms')
        .insert({
          name: formData.name,
          description: formData.description,
          farm_type: formData.farmType,
          location: formData.location,
          created_by: user.id
        })
        .select()
        .single();

      if (farmError) {
        console.error('Farm creation error:', farmError);
        throw farmError;
      }

      // Add the user as the farm owner
      const { error: memberError } = await supabase
        .from('farm_members')
        .insert({
          farm_id: farm.id,
          user_id: user.id,
          role: 'owner'
        });

      if (memberError) {
        console.error('Farm membership error:', memberError);
        throw memberError;
      }

      toast({
        title: "¡Finca creada exitosamente!",
        description: `Bienvenido a ${formData.name}. Tu finca está lista para gestionar.`,
      });

      navigate('/dashboard');
      
    } catch (error: any) {
      console.error('Farm setup error:', error);
      toast({
        title: "Error al crear la finca",
        description: error.message || "Ocurrió un error inesperado.",
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center pb-6">
          <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
            Configurar tu Finca
          </CardTitle>
          <p className="text-gray-600 text-lg">
            Configura los datos básicos de tu finca
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name" className="text-base font-medium">Nombre de la Finca</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Mi Finca"
                required
                className="mt-2 h-12 text-base"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="farmType" className="text-base font-medium">Tipo de Finca</Label>
              <Select value={formData.farmType} onValueChange={(value) => handleInputChange('farmType', value)}>
                <SelectTrigger className="mt-2 h-12">
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="livestock">Ganadería</SelectItem>
                  <SelectItem value="agriculture">Agricultura</SelectItem>
                  <SelectItem value="mixed">Mixta</SelectItem>
                  <SelectItem value="other">Otra</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="location" className="text-base font-medium">Ubicación</Label>
              <Input
                id="location"
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="Ciudad, Estado"
                className="mt-2 h-12 text-base"
                disabled={isLoading}
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">Descripción (Opcional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe tu finca..."
                className="mt-2 text-base"
                disabled={isLoading}
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold mt-8"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creando finca...
                </div>
              ) : (
                "Crear Finca"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetupFarm;