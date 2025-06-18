
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Heart, Baby } from 'lucide-react';
import { breedingAnalyticsService, BreedingAnalytics } from '@/services/breedingAnalyticsService';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe'];

const BreedingAnalyticsCard: React.FC = () => {
  const [analytics, setAnalytics] = useState<BreedingAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const data = await breedingAnalyticsService.getBreedingAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5" />
            <span>Análisis de Rendimiento</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Análisis de Rendimiento</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-8">No hay datos disponibles para análisis</p>
        </CardContent>
      </Card>
    );
  }

  const performanceData = [
    { name: 'Tasa de Éxito', value: analytics.successRate, color: '#8884d8' },
    { name: 'Tasa de Embarazo', value: analytics.pregnancyRate, color: '#82ca9d' },
    { name: 'Tasa de Nacimiento', value: analytics.birthCompletionRate, color: '#ffc658' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span>Análisis de Rendimiento</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Total Apareamientos</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{analytics.totalBreedings}</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Heart className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">Tasa de Embarazo</span>
            </div>
            <p className="text-2xl font-bold text-green-900">{analytics.pregnancyRate.toFixed(1)}%</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Baby className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Tasa de Nacimiento</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{analytics.birthCompletionRate.toFixed(1)}%</p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-800">Gestación Promedio</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">{analytics.averageGestationDays.toFixed(0)} días</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-4">Rendimiento por Mes</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.seasonalBreedingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" name="Apareamientos" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Tasas de Rendimiento</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={performanceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Diversidad Genética</h3>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full" 
                  style={{ width: `${analytics.geneticDiversityScore}%` }}
                ></div>
              </div>
            </div>
            <span className="text-lg font-semibold text-green-700">
              {analytics.geneticDiversityScore.toFixed(1)}%
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Puntuación de diversidad genética basada en combinaciones únicas de padres
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default BreedingAnalyticsCard;
