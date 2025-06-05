
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, Search, X } from 'lucide-react';

interface SearchFilters {
  name: string;
  tag: string;
  species: string;
  breed: string;
  healthStatus: string;
  ageMin: string;
  ageMax: string;
  weightMin: string;
  weightMax: string;
  gender: string;
}

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({ onSearch, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    name: '',
    tag: '',
    species: '',
    breed: '',
    healthStatus: '',
    ageMin: '',
    ageMax: '',
    weightMin: '',
    weightMax: '',
    gender: ''
  });

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
  };

  const handleClear = () => {
    setFilters({
      name: '',
      tag: '',
      species: '',
      breed: '',
      healthStatus: '',
      ageMin: '',
      ageMax: '',
      weightMin: '',
      weightMax: '',
      gender: ''
    });
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-5 h-5" />
                <span>Búsqueda Avanzada</span>
                {hasActiveFilters && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Filtros activos
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search-name">Nombre</Label>
                <Input
                  id="search-name"
                  placeholder="Buscar por nombre..."
                  value={filters.name}
                  onChange={(e) => handleFilterChange('name', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-tag">ID/Tag</Label>
                <Input
                  id="search-tag"
                  placeholder="Buscar por ID..."
                  value={filters.tag}
                  onChange={(e) => handleFilterChange('tag', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Especie</Label>
                <Select value={filters.species} onValueChange={(value) => handleFilterChange('species', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especie" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ovino">Ovino</SelectItem>
                    <SelectItem value="bovino">Bovino</SelectItem>
                    <SelectItem value="equino">Equino</SelectItem>
                    <SelectItem value="porcino">Porcino</SelectItem>
                    <SelectItem value="caprino">Caprino</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="search-breed">Raza</Label>
                <Input
                  id="search-breed"
                  placeholder="Buscar por raza..."
                  value={filters.breed}
                  onChange={(e) => handleFilterChange('breed', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Estado de Salud</Label>
                <Select value={filters.healthStatus} onValueChange={(value) => handleFilterChange('healthStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado de salud" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="healthy">Saludable</SelectItem>
                    <SelectItem value="sick">Enfermo</SelectItem>
                    <SelectItem value="pregnant">Gestante</SelectItem>
                    <SelectItem value="treatment">En Tratamiento</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Género</Label>
                <Select value={filters.gender} onValueChange={(value) => handleFilterChange('gender', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar género" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Macho</SelectItem>
                    <SelectItem value="female">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Edad (años)</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Mín"
                    value={filters.ageMin}
                    onChange={(e) => handleFilterChange('ageMin', e.target.value)}
                    type="number"
                  />
                  <Input
                    placeholder="Máx"
                    value={filters.ageMax}
                    onChange={(e) => handleFilterChange('ageMax', e.target.value)}
                    type="number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Peso (kg)</Label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Mín"
                    value={filters.weightMin}
                    onChange={(e) => handleFilterChange('weightMin', e.target.value)}
                    type="number"
                  />
                  <Input
                    placeholder="Máx"
                    value={filters.weightMax}
                    onChange={(e) => handleFilterChange('weightMax', e.target.value)}
                    type="number"
                  />
                </div>
              </div>
            </div>

            <div className="flex space-x-2 pt-4 border-t">
              <Button onClick={handleSearch} className="bg-green-600 hover:bg-green-700">
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
              <Button variant="outline" onClick={handleClear}>
                <X className="w-4 h-4 mr-2" />
                Limpiar Filtros
              </Button>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default AdvancedSearch;
