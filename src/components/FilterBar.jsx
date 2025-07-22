import React from 'react';
import { 
  Chip,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Button,
  Typography 
} from "@material-tailwind/react";
import { 
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

export function FilterBar({ filters, onFilterChange, onReset }) {
  const months = [
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

  const cities = [
    { value: 'Stockholm', label: 'Stockholm' },
    { value: 'Göteborg', label: 'Göteborg' },
    { value: 'Malmö', label: 'Malmö' },
    { value: 'Uppsala', label: 'Uppsala' },
    { value: 'Linköping', label: 'Linköping' },
    { value: 'Örebro', label: 'Örebro' },
    { value: 'Västerås', label: 'Västerås' }
  ];

  const getSelectedMonthLabel = () => {
    const month = months.find(m => m.value === filters.month);
    return month ? month.label : 'Välj månad';
  };

  const getSelectedCityLabel = () => {
    const city = cities.find(c => c.value === filters.city);
    return city ? city.label : 'Välj ort';
  };

  const hasActiveFilters = filters.month || filters.city;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-center gap-8 max-w-7xl mx-auto">
        
        {/* Filter icon and label */}
        <div className="flex items-center gap-2">
          <FunnelIcon className="h-5 w-5 text-gray-500" />
          <Typography variant="h6" color="gray" className="font-medium">
            Filter:
          </Typography>
        </div>
        
        {/* Filter buttons */}
        <div className="flex items-center gap-4">
          
          {/* Month filter */}
          <Menu>
            <MenuHandler>
              <Button
                variant={filters.month ? "filled" : "outlined"}
                color={filters.month ? "blue" : "gray"}
                size="sm"
                className="flex items-center gap-2 normal-case"
              >
                <CalendarDaysIcon className="h-4 w-4" />
                {getSelectedMonthLabel()}
              </Button>
            </MenuHandler>
            <MenuList className="max-h-60 overflow-y-auto">
              <MenuItem onClick={() => onFilterChange({ ...filters, month: '' })}>
                Alla månader
              </MenuItem>
              {months.map((month) => (
                <MenuItem
                  key={month.value}
                  onClick={() => onFilterChange({ ...filters, month: month.value })}
                  className={filters.month === month.value ? 'bg-blue-50' : ''}
                >
                  {month.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          {/* City filter */}
          <Menu>
            <MenuHandler>
              <Button
                variant={filters.city ? "filled" : "outlined"}
                color={filters.city ? "blue" : "gray"}
                size="sm"
                className="flex items-center gap-2 normal-case"
              >
                <MapPinIcon className="h-4 w-4" />
                {getSelectedCityLabel()}
              </Button>
            </MenuHandler>
            <MenuList className="max-h-60 overflow-y-auto">
              <MenuItem onClick={() => onFilterChange({ ...filters, city: '' })}>
                Alla orter
              </MenuItem>
              {cities.map((city) => (
                <MenuItem
                  key={city.value}
                  onClick={() => onFilterChange({ ...filters, city: city.value })}
                  className={filters.city === city.value ? 'bg-blue-50' : ''}
                >
                  {city.label}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </div>

        {/* Reset button */}
        {hasActiveFilters && (
          <Button
            variant="text"
            color="gray"
            size="sm"
            onClick={onReset}
            className="flex items-center gap-2"
          >
            <XMarkIcon className="h-4 w-4" />
            Rensa alla
          </Button>
        )}

      </div>
    </div>
  );
}

export default FilterBar;