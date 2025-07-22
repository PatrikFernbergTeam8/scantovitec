import React from 'react';
import {
  Select,
  Option,
  Typography,
  Button
} from "@material-tailwind/react";
import { 
  CalendarDaysIcon, 
  BuildingOfficeIcon,
  FunnelIcon 
} from "@heroicons/react/24/outline";

export function DashboardFilters({ filters, onFilterChange, onReset }) {
  const months = [
    { value: '', label: 'Alla månader' },
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Mars' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Maj' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Augusti' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = [
    { value: '', label: 'Alla år' },
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' }
  ];

  const cities = [
    { value: '', label: 'Alla orter' },
    { value: 'Stockholm', label: 'Stockholm' },
    { value: 'Göteborg', label: 'Göteborg' },
    { value: 'Malmö', label: 'Malmö' },
    { value: 'Uppsala', label: 'Uppsala' },
    { value: 'Linköping', label: 'Linköping' },
    { value: 'Örebro', label: 'Örebro' },
    { value: 'Västerås', label: 'Västerås' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 bg-white/90 backdrop-blur-sm rounded-lg px-6 py-3 border border-blue-gray-100 shadow-sm">
      
      {/* Month Filter */}
      <div className="flex items-center gap-2">
        <CalendarDaysIcon className="h-4 w-4 text-blue-gray-500" />
        <Select
          size="sm"
          value={filters.month}
          onChange={(value) => onFilterChange({ ...filters, month: value })}
          className="w-32"
        >
          {months.map((month) => (
            <Option key={month.value} value={month.value}>
              {month.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Year Filter */}
      <div className="flex items-center gap-2">
        <Typography variant="small" className="text-blue-gray-600">
          År:
        </Typography>
        <Select
          size="sm"
          value={filters.year}
          onChange={(value) => onFilterChange({ ...filters, year: value })}
          className="w-20"
        >
          {years.map((year) => (
            <Option key={year.value} value={year.value}>
              {year.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* City Filter */}
      <div className="flex items-center gap-2">
        <BuildingOfficeIcon className="h-4 w-4 text-blue-gray-500" />
        <Select
          size="sm"
          value={filters.city}
          onChange={(value) => onFilterChange({ ...filters, city: value })}
          className="w-32"
        >
          {cities.map((city) => (
            <Option key={city.value} value={city.value}>
              {city.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* Reset Button */}
      <Button
        size="sm"
        variant="outlined"
        color="blue-gray"
        onClick={onReset}
        className="px-4 py-1"
      >
        Rensa alla
      </Button>
    </div>
  );
}

export default DashboardFilters;