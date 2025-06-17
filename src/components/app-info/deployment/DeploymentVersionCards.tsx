
import React from 'react';
import { CheckCircle } from 'lucide-react';

const DeploymentVersionCards = () => {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 p-3 rounded-lg border border-green-200">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          <p className="text-sm font-semibold text-green-800">
            Detección Automática Conservadora
          </p>
        </div>
        <p className="text-xs text-green-700">
          El sistema ahora detecta deployments de forma más conservadora, verificando cambios 
          cada 60 segundos y solo actualizando cuando hay deployments reales publicados.
        </p>
      </div>

      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>¿Acabas de publicar?</strong> Si usaste "Publish Update" y no ves 
          el cambio de versión inmediatamente, espera unos minutos o haz clic en "Verificar Deployment".
        </p>
      </div>

      <div className="bg-amber-50 p-3 rounded-lg border border-amber-200">
        <p className="text-sm text-amber-800">
          <strong>Verificación Manual:</strong> Si la versión no se incrementa automáticamente, 
          puedes usar "Forzar Actualización" para forzar una verificación o "Incrementar Manual" 
          para aumentar la versión manualmente.
        </p>
      </div>
    </div>
  );
};

export default DeploymentVersionCards;
