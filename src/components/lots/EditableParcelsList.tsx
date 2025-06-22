
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit2, Save, X } from 'lucide-react';
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
  }>({ displayName: '', status: 'SHOPPING_LIST' });

  const handleStartEdit = (parcel: CadastralParcel) => {
    setEditingParcel(parcel.id);
    setEditValues({
      displayName: parcel.displayName || parcel.parcelId,
      status: (parcel.status as ParcelStatus) || 'SHOPPING_LIST'
    });
  };

  const handleSaveEdit = (parcelId: string) => {
    onParcelUpdate(parcelId, {
      displayName: editValues.displayName,
      status: editValues.status
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
      >
        {PARCEL_STATUS_LABELS[parcelStatus]}
      </Badge>
    );
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
      <CardHeader>
        <CardTitle>Parcelas Catastrales ({parcels.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Área</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parcels.map((parcel) => (
              <TableRow 
                key={parcel.id}
                className="cursor-pointer hover:bg-gray-50"
                onClick={() => onParcelClick(parcel)}
              >
                <TableCell className="font-mono text-sm">
                  {parcel.lotNumber || parcel.parcelId.split('.').pop()}
                </TableCell>
                <TableCell>
                  {editingParcel === parcel.id ? (
                    <Input
                      value={editValues.displayName}
                      onChange={(e) => setEditValues({
                        ...editValues,
                        displayName: e.target.value
                      })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full"
                    />
                  ) : (
                    <span>{parcel.displayName || parcel.parcelId}</span>
                  )}
                </TableCell>
                <TableCell>
                  {parcel.areaHectares ? `${parcel.areaHectares.toFixed(2)} ha` : 'N/A'}
                </TableCell>
                <TableCell>
                  {editingParcel === parcel.id ? (
                    <Select
                      value={editValues.status}
                      onValueChange={(value: ParcelStatus) => setEditValues({
                        ...editValues,
                        status: value
                      })}
                    >
                      <SelectTrigger 
                        className="w-40"
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
                </TableCell>
                <TableCell>
                  {editingParcel === parcel.id ? (
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSaveEdit(parcel.id);
                        }}
                      >
                        <Save className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancelEdit();
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartEdit(parcel);
                      }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default EditableParcelsList;
