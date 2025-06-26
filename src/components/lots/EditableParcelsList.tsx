
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X, MapPin, Settings, DollarSign, FileText, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { CadastralParcel } from '@/services/cadastralService';
import { ParcelStatus, PARCEL_STATUS_LABELS, PARCEL_STATUS_COLORS } from '@/utils/cadastral/types';
import ParcelAcquisitionForm from './ParcelAcquisitionForm';
import { useTimezone } from '@/hooks/useTimezone';

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
  const { formatCurrency } = useTimezone();
  const [editingParcel, setEditingParcel] = useState<string | null>(null);
  const [detailEditingParcel, setDetailEditingParcel] = useState<CadastralParcel | null>(null);
  const [editValues, setEditValues] = useState<{
    status: ParcelStatus;
    lotNumber: string;
  }>({ status: 'SHOPPING_LIST', lotNumber: '' });

  const handleStartEdit = (parcel: CadastralParcel) => {
    setEditingParcel(parcel.id);
    setEditValues({
      status: (parcel.status as ParcelStatus) || 'SHOPPING_LIST',
      lotNumber: parcel.lotNumber || ''
    });
  };

  const handleSaveEdit = (parcelId: string) => {
    onParcelUpdate(parcelId, {
      status: editValues.status,
      lotNumber: editValues.lotNumber
    });
    setEditingParcel(null);
  };

  const handleCancelEdit = () => {
    setEditingParcel(null);
  };

  const handleDetailEdit = (parcel: CadastralParcel) => {
    setDetailEditingParcel(parcel);
  };

  const handleDetailSave = (parcelId: string, updates: Partial<CadastralParcel>) => {
    onParcelUpdate(parcelId, updates);
    setDetailEditingParcel(null);
  };

  const handleDetailCancel = () => {
    setDetailEditingParcel(null);
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
    if (parcel.lotNumber) {
      return parcel.lotNumber;
    }
    
    const match = parcel.parcelId.match(/\d+/);
    return match ? match[0] : parcel.parcelId;
  };

  const formatNumber = (num: number, decimals: number = 2) => {
    return new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const hasFinancialInfo = (parcel: CadastralParcel) => {
    return parcel.totalCost || parcel.sellerName || parcel.acquisitionDate;
  };

  const isIncompletePropiedad = (parcel: CadastralParcel) => {
    return parcel.status === 'PROPIEDAD' && !hasFinancialInfo(parcel);
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
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle>Parcelas Catastrales ({parcels.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parcels.map((parcel) => {
              const parcelNumber = getParcelNumber(parcel);
              const isEditing = editingParcel === parcel.id;
              const showIncompleteWarning = isIncompletePropiedad(parcel);
              
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
                        {showIncompleteWarning && (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      <div className="flex items-center space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDetailEdit(parcel);
                          }}
                          className="h-6 w-6 p-0 text-blue-500 hover:text-blue-700"
                        >
                          <Settings className="w-3 h-3" />
                        </Button>
                        {isEditing ? (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSaveEdit(parcel.id);
                              }}
                              className="h-6 w-6 p-0"
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
                              className="h-6 w-6 p-0"
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
                            className="h-6 w-6 p-0"
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-xs">
                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block">Número</label>
                        {isEditing ? (
                          <Input
                            value={editValues.lotNumber}
                            onChange={(e) => setEditValues({
                              ...editValues,
                              lotNumber: e.target.value
                            })}
                            onClick={(e) => e.stopPropagation()}
                            className="mt-1 h-6 text-xs"
                            placeholder="7, 15, 41..."
                          />
                        ) : (
                          <p className="font-medium text-xs mt-1">
                            {parcel.lotNumber || 'Sin número'}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="text-xs text-gray-500 uppercase tracking-wide block">Área</label>
                        <p className="font-medium text-green-600 text-xs mt-1">
                          {parcel.areaHectares ? `${parcel.areaHectares.toFixed(4)} ha` : 'Sin calcular'}
                        </p>
                      </div>

                      <div className="col-span-2">
                        <label className="text-xs text-gray-500 uppercase tracking-wide block">Estado</label>
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
                                className="w-full h-6 text-xs"
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

                    {/* Financial Information Preview */}
                    {hasFinancialInfo(parcel) && (
                      <div className="mt-2 pt-2 border-t border-gray-100">
                        <div className="flex items-center gap-1 mb-1">
                          <DollarSign className="w-3 h-3 text-green-600" />
                          <span className="text-xs font-medium text-gray-700">Info. Financiera</span>
                        </div>
                        <div className="text-xs text-gray-600 space-y-1">
                          {parcel.totalCost && (
                            <p>Costo: {formatCurrency(parcel.totalCost)}</p>
                          )}
                          {parcel.sellerName && (
                            <p>Vendedor: {parcel.sellerName}</p>
                          )}
                          {parcel.acquisitionDate && (
                            <p>Fecha: {new Date(parcel.acquisitionDate).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Incomplete Information Warning */}
                    {showIncompleteWarning && (
                      <div className="mt-2 pt-2 border-t border-amber-100">
                        <div className="flex items-center gap-1">
                          <AlertCircle className="w-3 h-3 text-amber-500" />
                          <span className="text-xs text-amber-700">Completar información financiera</span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detail Edit Dialog */}
      <Dialog open={!!detailEditingParcel} onOpenChange={() => setDetailEditingParcel(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Edición Completa de Parcela
              </div>
            </DialogTitle>
          </DialogHeader>
          {detailEditingParcel && (
            <ParcelAcquisitionForm
              parcel={detailEditingParcel}
              onSave={handleDetailSave}
              onCancel={handleDetailCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EditableParcelsList;
