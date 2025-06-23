
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Zap, Plus, ArrowRight } from 'lucide-react';

interface EnhancedLotsEmptyStateProps {
  propiedadParcelsCount: number;
  onCreateLot: () => void;
  onNavigateToCadastral: () => void;
}

const EnhancedLotsEmptyState: React.FC<EnhancedLotsEmptyStateProps> = ({
  propiedadParcelsCount,
  onCreateLot,
  onNavigateToCadastral
}) => {
  const hasPropiedadParcels = propiedadParcelsCount > 0;

  return (
    <div className="text-center py-12 space-y-6">
      <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 className="text-xl font-semibold text-gray-700 mb-2">No hay lotes registrados</h3>
      
      {hasPropiedadParcels ? (
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-gray-500">
            Tienes {propiedadParcelsCount} parcelas marcadas como PROPIEDAD. 
            Usa la sincronización automática para generar lotes.
          </p>
          <Card className="border-green-200 bg-green-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-center gap-2 text-green-800">
                <Zap className="w-5 h-5" />
                Recomendado: Sincronización Automática
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-green-700 mb-3">
                Este proceso creará lotes automáticamente basados en tus parcelas PROPIEDAD
              </p>
              <div className="text-center">
                <span className="text-sm text-gray-600">Busca el botón "Sincronizar Catastral" arriba</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-gray-500">
            Para comenzar, puedes configurar parcelas catastrales o crear lotes manualmente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-blue-200 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors">
              <CardContent className="pt-4 text-center">
                <MapPin className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-medium text-blue-900 mb-2">Configurar Parcelas</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Ve al mapa catastral y marca parcelas como PROPIEDAD
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onNavigateToCadastral}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Ir al Mapa Catastral
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="pt-4 text-center">
                <Plus className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-medium text-purple-900 mb-2">Crear Lote Manual</h4>
                <p className="text-sm text-purple-700 mb-3">
                  Crea un lote personalizado sin usar datos catastrales
                </p>
                <Button 
                  onClick={onCreateLot} 
                  size="sm"
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear Lote Manual
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedLotsEmptyState;
