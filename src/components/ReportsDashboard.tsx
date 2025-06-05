
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, Download, TrendingUp, Heart, Calendar, DollarSign } from 'lucide-react';
import { generateAnimalSummaryReport, generateHealthReport, AnimalSummaryData, HealthReportData } from '@/services/reportsService';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

const ReportsDashboard = () => {
  const [animalSummary, setAnimalSummary] = useState<AnimalSummaryData | null>(null);
  const [healthReport, setHealthReport] = useState<HealthReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [animalData, healthData] = await Promise.all([
          generateAnimalSummaryReport(),
          generateHealthReport()
        ]);
        setAnimalSummary(animalData);
        setHealthReport(healthData);
      } catch (error) {
        console.error('Error loading reports:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const exportToCSV = (data: any[], filename: string) => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + Object.keys(data[0]).join(",") + "\n"
      + data.map(row => Object.values(row).join(",")).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Generando reportes...</div>
      </div>
    );
  }

  const speciesChartData = animalSummary ? Object.entries(animalSummary.bySpecies).map(([species, count]) => ({
    name: species.charAt(0).toUpperCase() + species.slice(1),
    value: count
  })) : [];

  const healthStatusChartData = animalSummary ? Object.entries(animalSummary.byHealthStatus).map(([status, count]) => ({
    name: status === 'healthy' ? 'Saludable' : 
          status === 'sick' ? 'Enfermo' :
          status === 'pregnant' ? 'Gestante' :
          status === 'treatment' ? 'En Tratamiento' : status,
    value: count
  })) : [];

  const healthRecordsData = healthReport ? Object.entries(healthReport.byType).map(([type, count]) => ({
    name: type === 'vaccination' ? 'Vacunación' :
          type === 'treatment' ? 'Tratamiento' :
          type === 'checkup' ? 'Revisión' :
          type === 'illness' ? 'Enfermedad' :
          type === 'medication' ? 'Medicación' : type,
    count
  })) : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Reportes y Estadísticas</h2>
        <Button onClick={() => window.print()} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar PDF
        </Button>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Resumen General</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="financial">Financiero</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Animales</p>
                    <p className="text-2xl font-bold text-gray-900">{animalSummary?.totalAnimals || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Edad Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">{animalSummary?.averageAge || 0} años</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Nacimientos Recientes</p>
                    <p className="text-2xl font-bold text-gray-900">{animalSummary?.recentBirths || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Registros de Salud</p>
                    <p className="text-2xl font-bold text-gray-900">{healthReport?.totalRecords || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribución por Especie</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={speciesChartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {speciesChartData.map((entry, index) => (
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
                  <BarChart data={healthStatusChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Heart className="h-8 w-8 text-red-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Registros</p>
                    <p className="text-2xl font-bold text-gray-900">{healthReport?.totalRecords || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Vacunas Próximas</p>
                    <p className="text-2xl font-bold text-gray-900">{healthReport?.upcomingVaccinations || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Costo Promedio</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${healthReport?.costsSummary.average.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Registros por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={healthRecordsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <DollarSign className="h-8 w-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Costo Total Salud</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${healthReport?.costsSummary.total.toFixed(2) || '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Costo Promedio por Animal</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${animalSummary && healthReport ? 
                        (healthReport.costsSummary.total / animalSummary.totalAnimals).toFixed(2) : '0.00'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Gastos por Mes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {healthReport && Object.entries(healthReport.costsSummary.byMonth).map(([month, cost]) => (
                  <div key={month} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="font-medium">{month}</span>
                    <Badge variant="outline">${cost.toFixed(2)}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsDashboard;
