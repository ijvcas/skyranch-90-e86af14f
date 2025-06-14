
import React from 'react';
import { BarChart3 } from 'lucide-react';
import PageLayout from '@/components/ui/page-layout';
import ReportsDashboard from '@/components/ReportsDashboard';

const Reports: React.FC = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center space-x-2">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <h1 className="text-3xl font-bold">Reportes y Análisis</h1>
        </div>

        <ReportsDashboard />
      </div>
    </PageLayout>
  );
};

export default Reports;
