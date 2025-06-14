
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Chrome, Smartphone, Info } from 'lucide-react';

interface PWAChromeInstructionsProps {
  deferredPrompt: any;
  showInstructions: boolean;
  onInstall: () => void;
  onShowInstructions: () => void;
  onHideInstructions: () => void;
}

const PWAChromeInstructions = ({ 
  deferredPrompt, 
  showInstructions, 
  onInstall, 
  onShowInstructions, 
  onHideInstructions 
}: PWAChromeInstructionsProps) => {
  return (
    <div className="space-y-4">
      {deferredPrompt ? (
        // Automatic installation available
        <>
          <p className="text-sm text-gray-600">
            Instala la app para usarla sin conexión y con acceso directo
          </p>
          <Button 
            onClick={onInstall}
            className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-base font-semibold"
          >
            <Download className="w-5 h-5 mr-2" />
            Instalar App Ahora
          </Button>
        </>
      ) : (
        // Manual installation instructions
        <>
          {!showInstructions ? (
            <>
              <div className="flex items-center space-x-2">
                <Chrome className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-gray-700 font-medium">
                  Instala SkyRanch en tu dispositivo
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 mb-3">
                  <strong>Para instalar en Chrome:</strong>
                </p>
                <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside mb-3">
                  <li>Haz clic en los <strong>tres puntos (⋮)</strong> en la esquina superior derecha</li>
                  <li>Busca <strong>"Instalar SkyRanch"</strong> o <strong>"Instalar aplicación"</strong></li>
                  <li>Haz clic en <strong>"Instalar"</strong></li>
                </ol>
                <p className="text-xs text-blue-600">
                  Si no aparece la opción, prueba refrescando la página o espera unos minutos.
                </p>
              </div>
              <Button 
                onClick={onShowInstructions}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-base font-semibold"
              >
                <Smartphone className="w-5 h-5 mr-2" />
                Ver Instrucciones Detalladas
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-green-900">
                      Instrucciones paso a paso para Chrome:
                    </p>
                    <div className="space-y-2">
                      <div className="text-sm text-green-800">
                        <strong>Método 1:</strong> Menú de Chrome
                      </div>
                      <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside ml-2">
                        <li>Haz clic en los <strong>tres puntos (⋮)</strong> arriba a la derecha</li>
                        <li>Busca <strong>"Instalar SkyRanch"</strong></li>
                        <li>Haz clic en <strong>"Instalar"</strong></li>
                      </ol>
                      <div className="text-sm text-green-800 mt-3">
                        <strong>Método 2:</strong> Barra de direcciones
                      </div>
                      <ol className="text-sm text-green-700 space-y-1 list-decimal list-inside ml-2">
                        <li>Busca un icono de <strong>instalación (+)</strong> en la barra de direcciones</li>
                        <li>Haz clic en él y selecciona <strong>"Instalar"</strong></li>
                      </ol>
                    </div>
                    <div className="bg-green-100 border border-green-300 rounded p-2 mt-3">
                      <p className="text-xs text-green-700">
                        💡 <strong>Tip:</strong> Una vez instalada, podrás encontrar la app en tu escritorio o menú de aplicaciones
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                onClick={onHideInstructions}
                variant="outline"
                className="w-full"
              >
                Entendido
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PWAChromeInstructions;
