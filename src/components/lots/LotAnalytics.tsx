
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { type Lot } from '@/stores/lotStore';

interface LotAnalyticsProps {
  lots: Lot[];
}

const LotAnalytics = ({ lots }: LotAnalyticsProps) => {
  // Prepare data for charts
  const occupancyData = lots.map(lot => ({
    name: lot.name,
    occupied: lot.currentAnimals || 0,
    capacity: lot.capacity || 0,
    occupancyRate: lot.capacity ? Math.round(((lot.currentAnimals || 0) / lot.capacity) * 100) : 0
  }));

  const statusData = [
    { name: 'Activos', value: lots.filter(l => l.status === 'active').length, color: '#22c55e' },
    { name: 'Descanso', value: lots.filter(l => l.status === 'resting').length, color: '#eab308' },
    { name: 'Mantenimiento', value: lots.filter(l => l.status === 'maintenance').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  const grassConditionData = [
    { name: 'Excelente', value: lots.filter(l => l.grassCondition === 'excellent').length, color: '#16a34a' },
    { name: 'Buena', value: lots.filter(l => l.grassCondition === 'good').length, color: '#22c55e' },
    { name: 'Regular', value: lots.filter(l => l.grassCondition === 'fair').length, color: '#eab308' },
    { name: 'Pobre', value: lots.filter(l => l.grassCondition === 'poor').length, color: '#ef4444' }
  ].filter(item => item.value > 0);

  // Calculate statistics
  const totalAnimals = lots.reduce((sum, lot) => sum + (lot.currentAnimals || 0), 0);
  const totalCapacity = lots.reduce((sum, lot) => sum + (lot.capacity || 0), 0);
  const averageOccupancy = lots.length > 0 ? Math.round((totalAnimals / totalCapacity) * 100) || 0 : 0;
  const totalArea = lots.reduce((sum, lot) => sum + (lot.sizeHectares || 0), 0);

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Animales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAnimals}</div>
            <p className="text-xs text-muted-foreground">en {lots.length} lotes</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Capacidad Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity}</div>
            <p className="text-xs text-muted-foreground">máximo de animales</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ocupación Promedio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageOccupancy}%</div>
            <p className="text-xs text-muted-foreground">de capacidad utilizada</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Área Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalArea.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">hectáreas</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Ocupación por Lote</CardTitle>
          </CardHeader>
          <CardContent>
            {occupancyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      value,
                      name === 'occupied' ? 'Ocupados' : 
                      name === 'capacity' ? 'Capacidad' : name
                    ]}
                    labelFormatter={(label) => `Lote: ${label}`}
                  />
                  <Bar dataKey="occupied" fill="#22c55e" name="occupied" />
                  <Bar dataKey="capacity" fill="#e5e7eb" name="capacity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grass Condition Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Condición del Pasto</CardTitle>
          </CardHeader>
          <CardContent>
            {grassConditionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={grassConditionData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomizedLabel}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {grassConditionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-300 text-gray-500">
                No hay datos para mostrar
              </div>
            )}
          </CardContent>
        </Card>

        {/* Efficiency Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Métricas de Eficiencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lotes Sobreocupados</span>
                <span className="font-medium">
                  {lots.filter(lot => 
                    lot.capacity && lot.currentAnimals && lot.currentAnimals > lot.capacity
                  ).length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lotes Vacíos</span>
                <span className="font-medium">
                  {lots.filter(lot => !lot.currentAnimals || lot.currentAnimals === 0).length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Densidad Promedio</span>
                <span className="font-medium">
                  {totalArea > 0 ? (totalAnimals / totalArea).toFixed(1) : '0'} animales/ha
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lotes en Descanso</span>
                <span className="font-medium">
                  {lots.filter(lot => lot.status === 'resting').length}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Lotes con Pasto Pobre</span>
                <span className="font-medium text-red-600">
                  {lots.filter(lot => lot.grassCondition === 'poor').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LotAnalytics;
