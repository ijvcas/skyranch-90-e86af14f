
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import { getAllUsers } from '@/services/userService';
import { TrendingUp, Users, Activity, Heart } from 'lucide-react';

const AdvancedAnalytics = () => {
  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: getAllUsers,
  });

  // Calculate analytics data
  const totalAnimals = animals.length;
  const totalUsers = users.length;
  const activeUsers = users.filter(user => user.is_active).length;

  // Recent activity (animals added in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentAnimals = animals.filter(animal => {
    const createdDate = animal.created_at ? new Date(animal.created_at) : null;
    return createdDate && createdDate > thirtyDaysAgo;
  });

  // Species distribution for pie chart
  const speciesData = animals.reduce((acc, animal) => {
    const species = animal.species;
    acc[species] = (acc[species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(speciesData).map(([species, count]) => ({
    name: species.charAt(0).toUpperCase() + species.slice(1),
    value: count
  }));

  // Health status distribution
  const healthStatusData = animals.reduce((acc, animal) => {
    const status = animal.health_status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const healthBarData = Object.entries(healthStatusData).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1),
    count
  }));

  // Monthly trends (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthYear = date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
    
    const animalsInMonth = animals.filter(animal => {
      const animalDate = animal.created_at ? new Date(animal.created_at) : null;
      return animalDate && 
             animalDate.getMonth() === date.getMonth() && 
             animalDate.getFullYear() === date.getFullYear();
    }).length;

    monthlyData.push({
      month: monthYear,
      animals: animalsInMonth,
      healthRecords: 0 // Simplified for now
    });
  }

  const colors = ['#10B981', '#F59E0B', '#EF4444', '#3B82F6', '#8B5CF6', '#F97316'];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{totalAnimals}</p>
                <p className="text-sm text-gray-500">Total Animales</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">{recentAnimals.length}</p>
                <p className="text-sm text-gray-500">Nuevos (30 días)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Registros Salud</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-2xl font-bold">0</p>
                <p className="text-sm text-gray-500">Reproducción</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Especies</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Status */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Salud</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={healthBarData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencias Mensuales</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="animals" 
                stroke="#3B82F6" 
                name="Animales Registrados"
                strokeWidth={2}
              />
              <Line 
                type="monotone" 
                dataKey="healthRecords" 
                stroke="#10B981" 
                name="Registros de Salud"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* User Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad de Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{totalUsers}</p>
              <p className="text-sm text-gray-500">Total Usuarios</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{activeUsers}</p>
              <p className="text-sm text-gray-500">Usuarios Activos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{totalUsers - activeUsers}</p>
              <p className="text-sm text-gray-500">Usuarios Inactivos</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedAnalytics;
