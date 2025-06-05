
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import ReportsDashboard from '@/components/ReportsDashboard';

const Reports = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden p-4 pb-24">
      <div className="absolute inset-0 opacity-5">
        <img 
          src="/lovable-uploads/953e2699-9daf-4fea-86c8-e505a1e54eb3.png" 
          alt="" 
          className="w-full h-full object-cover"
        />
      </div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            ← Volver al Panel
          </Button>
        </div>
        <ReportsDashboard />
      </div>
    </div>
  );
};

export default Reports;
