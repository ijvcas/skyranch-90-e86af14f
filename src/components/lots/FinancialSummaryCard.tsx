
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Euro } from 'lucide-react';
import { useTimezone } from '@/hooks/useTimezone';
import { calculateFinancialSummary } from '@/utils/financialCalculations';
import { logFinancialCalculations } from '@/utils/financialDebugLogger';
import OwnedPropertiesSection from './financial/OwnedPropertiesSection';
import NegotiatingPropertiesSection from './financial/NegotiatingPropertiesSection';
import TotalProjectionSection from './financial/TotalProjectionSection';
import type { CadastralParcel } from '@/services/cadastralService';

interface FinancialSummaryCardProps {
  parcels: CadastralParcel[];
}

const FinancialSummaryCard: React.FC<FinancialSummaryCardProps> = ({ parcels }) => {
  const { formatCurrency } = useTimezone();
  
  const summary = calculateFinancialSummary(parcels);
  
  // Debug logging
  logFinancialCalculations(summary, formatCurrency);

  if (summary.propiedadParcels.length === 0 && summary.negotiatingParcels.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Euro className="w-5 h-5 text-green-600" />
          Resumen Financiero de Tierras
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <OwnedPropertiesSection summary={summary} />
        <NegotiatingPropertiesSection summary={summary} />
        <TotalProjectionSection summary={summary} />
      </CardContent>
    </Card>
  );
};

export default FinancialSummaryCard;
