
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FileText, TrendingUp, Activity, DollarSign, Heart, BarChart3, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { generateAnimalSummaryReport, generateHealthReport, AnimalSummaryData, HealthReportData } from '@/services/reportsService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ReportsDashboard: React.FC = () => {
  const [activeReport, setActiveReport] = useState<'animal' | 'health'>('animal');

  const { data: animalSummary, isLoading: isLoadingAnimal } = useQuery({
    queryKey: ['animal-summary-report'],
    queryFn: generateAnimalSummaryReport
  });

  const { data: healthReport, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['health-report'],
    queryFn: generateHealthReport
  });

  const formatSpeciesData = (bySpecies: Record<string, number>) => {
    return Object.entries(bySpecies).map(([species, count]) => ({
      name: species,
      value: count
    }));
  };

  const formatHealthStatusData = (byHealthStatus: Record<string, number>) => {
    return Object.entries(byHealthStatus).map(([status, count]) => ({
      name: status,
      count
    }));
  };

  const formatHealthTypeData = (byType: Record<string, number>) => {
    return Object.entries(byType).map(([type, count]) => ({
      name: type,
      count
    }));
  };

  const formatMonthlyCosts = (byMonth: Record<string, number>) => {
    return Object.entries(byMonth).map(([month, cost]) => ({
      month,
      cost: cost.toFixed(2)
    }));
  };

  if (isLoadingAnimal || isLoadingHealth) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Reportes y Análisis</h2>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Tabs value={activeReport} onValueChange={(value) => setActiveReport(value as any)}>
        <TabsList>
          <TabsTrigger value="animal">Resumen de Animales</TabsTrigger>
          <TabsTrigger value="health">Reporte de Salud</TabsTrigger>
        </TabsList>

        <TabsContent value="animal" className="space-y-6">
          {animalSummary && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Animales</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{animalSummary.totalAnimals}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Edad Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{animalSummary.averageAge} años</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nacimientos Recientes</CardTitle>
                    <Heart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{animalSummary.recentBirths}</div>
                    <p className="text-xs text-muted-foreground">Últimos 30 días</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Especies</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Object.keys(animalSummary.bySpecies).length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Distribución por Especies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={formatSpeciesData(animalSummary.bySpecies)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {formatSpeciesData(animalSummary.bySpecies).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estado de Salud</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatHealthStatusData(animalSummary.byHealthStatus)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {healthReport && (
            <>
              {/* Health Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthReport.totalRecords}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vacunas Próximas</CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{healthReport.upcomingVaccinations}</div>
                    <p className="text-xs text-muted-foreground">Próximos 30 días</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Costo Total</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${healthReport.costsSummary.total.toFixed(2)}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Costo Promedio</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${healthReport.costsSummary.average.toFixed(2)}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Health Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Tipos de Registros</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatHealthTypeData(healthReport.byType)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#82ca9d" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Costos por Mes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={formatMonthlyCosts(healthReport.costsSummary.byMonth)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, 'Costo']} />
                        <Bar dataKey="cost" fill="#ffc658" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsDashboard;
