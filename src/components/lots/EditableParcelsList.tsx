
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, MapPin } from 'lucide-react';
import type { CadastralParcel } from '@/services/cadastralService';
import { ParcelStatus, PARCEL_STATUS_LABELS, PARCEL_STATUS_COLORS } from '@/utils/cadastral/types';

interface EditableParcelProps {
  parcels: CadastralParcel[];
  onParcelUpdate: (parcelId: string, updates: Partial<CadastralParcel>) => void;
  onParcelClick: (parcel: CadastralParcel) => void;
}

const EditableParcelsList: React.FC<EditableParcelProps> = ({
  parcels,
  onParcelUpdate,
  onParcelClick
}) => {
  const [editingParcel, setEditingParcel] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    displayName: string;
    status: ParcelStatus;
    lotNumber: string;
  }>({ displayName: '', status: 'SHOPPING_LIST', lotNumber: '' });

  const handleStartEdit = (parcel: CadastralParcel) => {
    setEditingParcel(parcel.id);
    setEditValues({
      displayName: parcel.displayName || parcel.parcelId,
      status: (parcel.status as ParcelStatus) || 'SHOPPING_LIST',
      lotNumber: parcel.lotNumber || ''
    });
  };

  const handleSaveEdit = (parcelId: string) => {
    onParcelUpdate(parcelId, {
      displayName: editValues.displayName,
      status: editValues.status,
      lotNumber: editValues.lotNumber
    });
    setEditingParcel(null);
  };

  const handleCancelEdit = () => {
    setEditingParcel(null);
  };

  const getStatusBadge = (status?: string) => {
    const parcelStatus = (status as ParcelStatus) || 'SHOPPING_LIST';
    return (
      <Badge 
        style={{ 
          backgroundColor: PARCEL_STATUS_COLORS[parcelStatus],
          color: 'white'
        }}
        className="text-xs"
      >
        {PARCEL_STATUS_LABELS[parcelStatus]}
      </Badge>
    );
  };

  const getParcelNumber = (parcel: CadastralParcel): string => {
    // Use lotNumber if available, otherwise extract from parcelId
    if (parcel.lotNumber) {
      return parcel.lotNumber;
    }
    
    // Try to extract number from parcelId
    const match = parcel.parcelId.match(/\d+/);
    return match ? match[0] : parcel.parcelId;
  };

  if (parcels.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          No hay parcelas para mostrar
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>Parcelas Catastrales ({parcels.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {parcels.map((parcel) => {
            const parcelNumber = getParcelNumber(parcel);
            const isEditing = editingParcel === parcel.id;
            
            return (
              <Card 
                key={parcel.id}
                className="cursor-pointer hover:bg-gray-50 transition-colors border-l-4"
                style={{ 
                  borderLeftColor: PARCEL_STATUS_COLORS[(parcel.status as ParcelStatus) || 'SHOPPING_LIST'] 
                }}
                onClick={() => !isEditing && onParcelClick(parcel)}
              >
                <CardContent className="p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-bold">
                        {parcelNumber}
                      </div>
                      <MapPin className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex items-center space-x-1">
                      {isEditing ? (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSaveEdit(parcel.id);
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelEdit();
                            }}
                            className="h-7 w-7 p-0"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(parcel);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Edit2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Número</label>
                      {isEditing ? (
                        <Input
                          value={editValues.lotNumber}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            lotNumber: e.target.value
                          })}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-8 text-sm"
                          placeholder="Ej: 7, 15, 41..."
                        />
                      ) : (
                        <p className="font-medium text-sm">
                          {parcel.lotNumber || 'Sin número'}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Nombre</label>
                      {isEditing ? (
                        <Input
                          value={editValues.displayName}
                          onChange={(e) => setEditValues({
                            ...editValues,
                            displayName: e.target.value
                          })}
                          onClick={(e) => e.stopPropagation()}
                          className="mt-1 h-8 text-sm"
                          placeholder="Nombre de la parcela"
                        />
                      ) : (
                        <p className="font-medium text-sm">
                          {parcel.displayName || `Parcela ${parcelNumber}`}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Área</label>
                      <p className="font-medium text-green-600 text-sm">
                        {parcel.areaHectares ? `${parcel.areaHectares.toFixed(4)} ha` : 'Sin calcular'}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 uppercase tracking-wide">Estado</label>
                      <div className="mt-1">
                        {isEditing ? (
                          <Select
                            value={editValues.status}
                            onValueChange={(value: ParcelStatus) => setEditValues({
                              ...editValues,
                              status: value
                            })}
                          >
                            <SelectTrigger 
                              className="w-full h-8 text-sm"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {Object.entries(PARCEL_STATUS_LABELS).map(([status, label]) => (
                                <SelectItem key={status} value={status}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          getStatusBadge(parcel.status)
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default EditableParcelsList;
