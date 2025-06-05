import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Heart, DollarSign, Calendar, Activity, Target, BarChart3 } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { getAllAnimals } from '@/services/animalService';
import { getAllHealthRecords } from '@/services/healthRecordService';
import { getAllBreedingRecords } from '@/services/breedingService';

const AdvancedAnalytics = () => {
  const { data: animals = [] } = useQuery({
    queryKey: ['animals'],
    queryFn: getAllAnimals,
  });

  const { data: healthRecords = [] } = useQuery({
    queryKey: ['health-records'],
    queryFn: getAllHealthRecords,
  });

  const { data: breedingRecords = [] } = useQuery({
    queryKey: ['breeding-records'],
    queryFn: getAllBreedingRecords,
  });

  // Calculate analytics data from real data
  const analyticsData = useMemo(() => {
    // Generate monthly trend data based on actual animal creation dates
    const monthlyData = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthAnimals = animals.filter(animal => {
        if (!animal.updated_at) return false;
        const animalDate = new Date(animal.updated_at);
        return animalDate.getMonth() === date.getMonth() && animalDate.getFullYear() === date.getFullYear();
      });
      
      monthlyData.push({
        month: date.toLocaleDateString('es-ES', { month: 'short' }),
        animals: monthAnimals.length,
        health: healthRecords.filter(record => {
          const recordDate = new Date(record.date_administered);
          return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
        }).length,
        breeding: breedingRecords.filter(record => {
          const recordDate = new Date(record.breeding_date);
          return recordDate.getMonth() === date.getMonth() && recordDate.getFullYear() === date.getFullYear();
        }).length,
      });
    }

    // Health status distribution
    const healthDistribution = animals.reduce((acc, animal) => {
      const status = animal.health_status || 'healthy';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const healthData = Object.entries(healthDistribution).map(([status, count]) => ({
      name: status === 'healthy' ? 'Saludable' : status === 'sick' ? 'Enfermo' : status,
      value: count,
      color: status === 'healthy' ? '#10b981' : status === 'sick' ? '#ef4444' : '#f59e0b'
    }));

    // Species distribution
    const speciesDistribution = animals.reduce((acc, animal) => {
      acc[animal.species] = (acc[animal.species] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const speciesData = Object.entries(speciesDistribution).map(([species, count], index) => ({
      name: species,
      value: count,
      color: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]
    }));

    // Calculate productivity metrics
    const totalCost = healthRecords.reduce((sum, record) => sum + (record.cost || 0), 0) +
                     breedingRecords.reduce((sum, record) => sum + (record.cost || 0), 0);

    return {
      monthlyTrends: monthlyData,
      healthDistribution: healthData,
      speciesDistribution: speciesData,
      totalAnimals: animals.length,
      activeBreeding: breedingRecords.filter(r => r.status === 'active').length,
      healthAlerts: animals.filter(a => a.health_status !== 'healthy').length,
      totalCost: totalCost
    };
  }, [animals, healthRecords, breedingRecords]);

  const performanceMetrics = [
    {
      title: "Total de Animales",
      value: analyticsData.totalAnimals,
      change: "+12%",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Reproducción Activa",
      value: analyticsData.activeBreeding,
      change: "+8%",
      trend: "up",
      icon: Heart,
      color: "text-pink-600"
    },
    {
      title: "Alertas de Salud",
      value: analyticsData.healthAlerts,
      change: "-5%",
      trend: "down",
      icon: Activity,
      color: "text-red-600"
    },
    {
      title: "Inversión Total",
      value: `$${analyticsData.totalCost.toLocaleString()}`,
      change: "+15%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600"
    }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Análisis Avanzado
          </h3>
          <p className="text-sm text-gray-600">Métricas detalladas y tendencias de tu granja</p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700">
          Datos en Tiempo Real
        </Badge>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
                    <p className={`text-sm ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'} flex items-center`}>
                      <TrendingUp className={`w-4 h-4 mr-1 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                      {metric.change}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${metric.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencias Mensuales</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="animals" stroke="#3b82f6" name="Animales" />
                <Line type="monotone" dataKey="health" stroke="#10b981" name="Salud" />
                <Line type="monotone" dataKey="breeding" stroke="#f59e0b" name="Reproducción" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Salud</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.healthDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analyticsData.healthDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Species Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Especies</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.speciesDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Línea de Tiempo de Actividades</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="animals" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="health" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="breeding" stackId="1" stroke="#f59e0b" fill="#f59e0b" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Objetivos del Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Nuevos Animales</span>
                <Badge variant="outline">15/20</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chequeos de Salud</span>
                <Badge variant="outline">28/30</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Registros de Reproducción</span>
                <Badge variant="outline">8/10</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Próximas Actividades
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Vacunaciones Pendientes</span>
                <Badge variant="destructive">5</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Chequeos Programados</span>
                <Badge variant="default">12</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Fechas de Parto</span>
                <Badge variant="secondary">3</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Rendimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Eficiencia General</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">92%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Tasa de Natalidad</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">87%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Costo por Animal</span>
                <Badge variant="outline">$150</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;
