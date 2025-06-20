
import { useState, useMemo } from 'react';

interface HealthRecord {
  id: string;
  animalId: string;
  recordType: string;
  title: string;
  description?: string;
  veterinarian?: string;
  medication?: string;
  dosage?: string;
  cost?: number;
  dateAdministered: string;
  nextDueDate?: string;
  notes?: string;
}

export const useHealthRecordsFilter = (records: HealthRecord[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [recordTypeFilter, setRecordTypeFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');

  const filteredRecords = useMemo(() => {
    let filtered = [...records];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(searchLower) ||
        record.description?.toLowerCase().includes(searchLower) ||
        record.veterinarian?.toLowerCase().includes(searchLower) ||
        record.medication?.toLowerCase().includes(searchLower) ||
        record.notes?.toLowerCase().includes(searchLower)
      );
    }

    // Apply record type filter
    if (recordTypeFilter !== 'all') {
      filtered = filtered.filter(record => record.recordType === recordTypeFilter);
    }

    // Apply date range filter
    if (dateRangeFilter !== 'all') {
      const now = new Date();
      const days = {
        'last-30': 30,
        'last-90': 90,
        'last-180': 180,
        'last-365': 365
      }[dateRangeFilter] || 0;

      if (days > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(now.getDate() - days);
        
        filtered = filtered.filter(record => {
          const recordDate = new Date(record.dateAdministered);
          return recordDate >= cutoffDate;
        });
      }
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.dateAdministered).getTime() - new Date(a.dateAdministered).getTime()
    );
  }, [records, searchTerm, recordTypeFilter, dateRangeFilter]);

  const hasActiveFilters = searchTerm !== '' || recordTypeFilter !== 'all' || dateRangeFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setRecordTypeFilter('all');
    setDateRangeFilter('all');
  };

  return {
    searchTerm,
    setSearchTerm,
    recordTypeFilter,
    setRecordTypeFilter,
    dateRangeFilter,
    setDateRangeFilter,
    filteredRecords,
    hasActiveFilters,
    clearFilters
  };
};
