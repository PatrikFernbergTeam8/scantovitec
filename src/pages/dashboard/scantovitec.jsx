import React, { useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody, Button, Menu, MenuHandler, MenuList, MenuItem } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { statisticsCardsData } from "@/data";
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/outline";
import {
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon as ChartBarOutlineIcon,
  UserGroupIcon as UserGroupOutlineIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import ApiService from "@/services/api";

export function Scantovitec({ filters, onFilterChange, onResetFilters }) {
  const [statisticsData, setStatisticsData] = useState([]);
  const [chartsData, setChartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use default filters if not provided (for direct access)
  const defaultFilters = {
    month: '',
    year: '',
    city: ''
  };
  const activeFilters = filters || defaultFilters;

  // Icon mapping for statistics cards
  const iconMap = {
    BuildingOfficeIcon,
    UserGroupIcon,
    DocumentTextIcon,
    ChartBarIcon
  };

  // Filter options
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

  const quarters = [
    { value: '1', label: 'Q1 (Jan-Mar)' },
    { value: '2', label: 'Q2 (Apr-Jun)' },
    { value: '3', label: 'Q3 (Jul-Sep)' },
    { value: '4', label: 'Q4 (Okt-Dec)' }
  ];

  const years = [
    { value: '2024', label: '2024' },
    { value: '2023', label: '2023' },
    { value: '2022', label: '2022' }
  ];

  const lastDaysOptions = [
    { value: '0', label: 'Idag' },
    { value: '7', label: 'Senaste 7 dagarna' },
    { value: '30', label: 'Senaste 30 dagarna' },
    { value: '90', label: 'Senaste 90 dagarna' }
  ];

  const volumeLevels = [
    { value: 'low', label: 'Låg volym (1-10 sidor)' },
    { value: 'medium', label: 'Medel volym (11-50 sidor)' },
    { value: 'high', label: 'Hög volym (50+ sidor)' }
  ];

  const customerActivityLevels = [
    { value: 'very_active', label: 'Mycket aktiva (senaste 7 dagarna)' },
    { value: 'active', label: 'Aktiva (senaste 30 dagarna)' },
    { value: 'inactive', label: 'Inaktiva (inga scanningar 30 dagar)' }
  ];

  // Helper function for modern filter button styling
  const getFilterButtonClass = (isActive) => {
    return `flex items-center gap-[0.25rem] sm:gap-[0.5rem] normal-case min-w-fit flex-shrink-0 px-[0.5rem] sm:px-[0.75rem] py-[0.25rem] sm:py-[0.5rem] rounded-lg sm:rounded-xl transition-all duration-200 focus:outline-none focus:ring-0 focus:shadow-none text-xs sm:text-sm ${
      isActive 
        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50' 
        : 'bg-white text-gray-700 border border-gray-200 hover:border-gray-300'
    }`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel with filters
        const [statistics, scanningActivity, customersByCity, customerActivity, scanningEfficiency] = await Promise.all([
          ApiService.getStatistics(activeFilters),
          ApiService.getScanningActivityRolling12Months(activeFilters),
          ApiService.getCustomersByCity(activeFilters),
          ApiService.getCustomerActivity(activeFilters),
          ApiService.getScanningEfficiency(activeFilters)
        ]);

        // Update statistics cards
        setStatisticsData(statistics);

        // Update charts data
        const updatedChartsData = [
          {
            color: "white",
            title: "Skannade Dokument",
            description: "Skannade dokument per månad",
            chart: {
              ...scanningActivity,
              options: {
                colors: ["#388e3c"],
                plotOptions: {
                  bar: {
                    columnWidth: "40%",
                    borderRadius: 5,
                  },
                },
                xaxis: {
                  categories: scanningActivity.categories,
                },
                chart: {
                  toolbar: { show: false },
                },
                dataLabels: { enabled: false },
                grid: {
                  show: true,
                  borderColor: "#dddddd",
                  strokeDashArray: 5,
                  padding: { top: 5, right: 20 },
                },
                fill: { opacity: 0.8 },
                tooltip: { theme: "dark" },
              }
            }
          },
          {
            color: "white",
            title: "Kundaktivitet",
            description: "Aktiva/Inaktiva kunder",
            chart: {
              ...customerActivity,
              options: {
                chart: { type: "donut" },
                labels: ["Aktiva Kunder", "Inaktiva Kunder"],
                colors: ["#388e3c", "#e0e0e0"],
                legend: { show: false },
                plotOptions: {
                  pie: {
                    donut: {
                      size: "70%",
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: customerActivity.label,
                          formatter: () => customerActivity.percentage
                        }
                      }
                    }
                  }
                },
                dataLabels: { 
                  enabled: false
                },
                stroke: { width: 2, colors: ["#fff"] },
                fill: {
                  type: "gradient",
                  gradient: {
                    shade: "light",
                    type: "horizontal",
                    shadeIntensity: 0.25,
                    gradientToColors: ["#66bb6a", "#f5f5f5"],
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                  }
                }
              }
            }
          },
          {
            color: "white",
            title: "Batch-Scanning Effektivitet",
            description: "Andel scanningar i batch (inom 5 min)",
            chart: {
              ...scanningEfficiency,
              options: {
                chart: { type: "donut" },
                labels: ["Batch-scanningar", "Enstaka scanningar"],
                colors: ["#0288d1", "#e0e0e0"],
                legend: { 
                  show: false
                },
                plotOptions: {
                  pie: {
                    donut: {
                      size: "70%",
                      labels: {
                        show: true,
                        total: {
                          show: true,
                          label: "Effektivitet",
                          fontSize: "14px",
                          formatter: () => scanningEfficiency.percentage
                        }
                      }
                    }
                  }
                },
                dataLabels: { 
                  enabled: false
                },
                stroke: { width: 2, colors: ["#fff"] },
                fill: {
                  type: "gradient",
                  gradient: {
                    shade: "light",
                    type: "horizontal",
                    shadeIntensity: 0.25,
                    gradientToColors: ["#42a5f5", "#f5f5f5"],
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                  }
                }
              }
            }
          },
          {
            color: "white",
            title: customersByCity.title || "Mest Aktiva Kontor Senaste 30 Dagarna",
            description: "Översikt av kunder per stad",
            type: "table",
            data: customersByCity.data || customersByCity
          }
        ];

        setChartsData(updatedChartsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeFilters]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-120px)] w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <Typography variant="h6" color="blue-gray">Laddar dashboard...</Typography>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[calc(100vh-120px)] w-full flex items-center justify-center">
        <div className="text-center">
          <Typography variant="h6" color="red" className="mb-4">{error}</Typography>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Försök igen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col bg-gradient-to-br from-blue-50/70 to-white">
      {/* Header with Logo and Filters */}
      <div className="flex-shrink-0">
        <div className="flex items-center justify-between px-[0.75rem] sm:px-[1.5rem] py-[1rem] sm:py-[1.25rem]">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <img 
              src="/img/LF_Logo.png" 
              alt="Logo" 
              className="h-[4.5rem] sm:h-[5rem] lg:h-[5.5rem] w-auto object-contain"
            />
          </div>

          {/* Filters */}
          <div className="flex-1 flex justify-end items-center ml-[1rem]">
            <div className="flex items-center gap-[0.5rem] sm:gap-[1rem] overflow-x-auto max-w-full">
              <div className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] flex-shrink-0">
                <div className="flex items-center gap-[0.25rem] sm:gap-[0.5rem] bg-gradient-to-r from-blue-50 to-indigo-50 px-[0.5rem] sm:px-[0.75rem] py-[0.25rem] sm:py-[0.5rem] rounded-full border border-blue-200/50">
                  <FunnelIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem] text-blue-600" />
                  <Typography variant="small" className="font-semibold text-blue-700 text-xs sm:text-sm">
                    Filter
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-[0.5rem] sm:gap-[0.75rem] overflow-x-auto scrollbar-hide">
                {/* Month filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.month)}>
                      <CalendarDaysIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.month ? months.find(m => m.value === activeFilters.month)?.label : 'Månad'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, month: '' })}>
                      Alla månader
                    </MenuItem>
                    {months.map((month) => (
                      <MenuItem
                        key={month.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, month: month.value })}
                        className={activeFilters.month === month.value ? 'bg-blue-50' : ''}
                      >
                        {month.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Year filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.year)}>
                      <CalendarDaysIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.year ? years.find(y => y.value === activeFilters.year)?.label : 'År'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, year: '' })}>
                      Alla år
                    </MenuItem>
                    {years.map((year) => (
                      <MenuItem
                        key={year.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, year: year.value })}
                        className={activeFilters.year === year.value ? 'bg-blue-50' : ''}
                      >
                        {year.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Quarter filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.quarter)}>
                      <ClockIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.quarter ? quarters.find(q => q.value === activeFilters.quarter)?.label : 'Kvartal'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, quarter: '' })}>
                      Alla kvartal
                    </MenuItem>
                    {quarters.map((quarter) => (
                      <MenuItem
                        key={quarter.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, quarter: quarter.value })}
                        className={activeFilters.quarter === quarter.value ? 'bg-blue-50' : ''}
                      >
                        {quarter.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Last Days filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.lastDays)}>
                      <ClockIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.lastDays ? lastDaysOptions.find(d => d.value === activeFilters.lastDays)?.label : 'Period'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, lastDays: '' })}>
                      Alla perioder
                    </MenuItem>
                    {lastDaysOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, lastDays: option.value })}
                        className={activeFilters.lastDays === option.value ? 'bg-blue-50' : ''}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* City filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.city)}>
                      <MapPinIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.city ? cities.find(c => c.value === activeFilters.city)?.label : 'Ort'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, city: '' })}>
                      Alla orter
                    </MenuItem>
                    {cities.map((city) => (
                      <MenuItem
                        key={city.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, city: city.value })}
                        className={activeFilters.city === city.value ? 'bg-blue-50' : ''}
                      >
                        {city.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Volume Level filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.volumeLevel)}>
                      <ChartBarOutlineIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.volumeLevel ? volumeLevels.find(v => v.value === activeFilters.volumeLevel)?.label : 'Volym'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, volumeLevel: '' })}>
                      Alla volymer
                    </MenuItem>
                    {volumeLevels.map((level) => (
                      <MenuItem
                        key={level.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, volumeLevel: level.value })}
                        className={activeFilters.volumeLevel === level.value ? 'bg-blue-50' : ''}
                      >
                        {level.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Customer Activity filter */}
                <Menu>
                  <MenuHandler>
                    <Button variant="text" className={getFilterButtonClass(activeFilters.customerActivity)}>
                      <UserGroupOutlineIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                      <span className="font-medium">
                        {activeFilters.customerActivity ? customerActivityLevels.find(a => a.value === activeFilters.customerActivity)?.label : 'Aktivitet'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange && onFilterChange({ ...activeFilters, customerActivity: '' })}>
                      Alla aktivitetsnivåer
                    </MenuItem>
                    {customerActivityLevels.map((level) => (
                      <MenuItem
                        key={level.value}
                        onClick={() => onFilterChange && onFilterChange({ ...activeFilters, customerActivity: level.value })}
                        className={activeFilters.customerActivity === level.value ? 'bg-blue-50' : ''}
                      >
                        {level.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Reset button */}
                {(activeFilters.month || activeFilters.year || activeFilters.quarter || activeFilters.lastDays || activeFilters.city || activeFilters.volumeLevel || activeFilters.customerActivity) && (
                  <Button
                    variant="text"
                    onClick={onResetFilters}
                    className="flex items-center gap-[0.25rem] sm:gap-[0.5rem] flex-shrink-0 px-[0.5rem] sm:px-[0.75rem] py-[0.25rem] sm:py-[0.5rem] rounded-lg sm:rounded-xl transition-all duration-200 bg-gray-100 text-gray-600 border border-gray-200 hover:border-gray-300 hover:bg-gray-200 focus:outline-none focus:ring-0 focus:shadow-none text-xs sm:text-sm"
                  >
                    <XMarkIcon className="h-[0.75rem] w-[0.75rem] sm:h-[1rem] sm:w-[1rem]" />
                    <span className="font-medium">Rensa</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Statistics Cards - Compact responsive grid */}
        <div className="flex-shrink-0 grid gap-[0.75rem] sm:gap-[1rem] md:gap-[1.25rem] 
                          grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4
                          px-[1rem] sm:px-[1.25rem] md:px-[1.75rem] pt-[1rem] sm:pt-[1.25rem] md:pt-[1.5rem] pb-[1rem] sm:pb-[1.25rem] md:pb-[1.5rem]">
        {statisticsData.map((item) => (
          <StatisticsCard
            key={item.title}
            color={item.color}
            title={item.title}
            value={item.value}
            icon={React.createElement(iconMap[item.icon], {
              className: "w-[1.5rem] h-[1.5rem] sm:w-[2rem] sm:h-[2rem] md:w-[2.5rem] md:h-[2.5rem] text-blue-600",
            })}
            footer={
              <Typography className="font-normal text-blue-gray-600 text-xs">
                <strong className={item.footer.color}>{item.footer.value}</strong>
                &nbsp;{item.footer.label}
              </Typography>
            }
          />
        ))}
      </div>
      
        {/* Charts Grid - Takes remaining space */}
        <div className="flex-1 overflow-hidden px-[0.5rem] sm:px-[0.75rem] md:px-[1rem] pb-[0.5rem] sm:pb-[0.75rem] md:pb-[1rem]">
          <div className="grid gap-[0.25rem] sm:gap-[0.5rem] md:gap-[0.75rem] 
                          grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 
                          grid-rows-2 h-full">
        {chartsData.map((item, index) => (
            <div key={index} className={`${
              item.title.includes('Kundaktivitet') 
                ? 'col-start-1 col-end-2 row-start-2 row-end-3' 
                : item.title.includes('Batch-Scanning') 
                  ? 'col-start-2 col-end-3 row-start-2 row-end-3' 
                  : (item.title.includes('Mest Aktiva Kontor') || item.title.includes('Lista med alla kontor') || item.title.includes('Alla kontor'))
                    ? 'col-start-3 col-end-5 row-start-1 row-end-3' 
                    : 'col-start-1 col-end-3 row-start-1 row-end-2'
            }`}>
                {item.type === 'table' ? (
                  <Card className="shadow-lg shadow-gray-500/40 border-0 bg-white h-full flex flex-col drop-shadow-lg">
                    <CardHeader variant="gradient" color="white" floated={false} shadow={false} className="p-[0.5rem] sm:p-[0.75rem] md:p-[1rem]">
                      <Typography variant="h6" color="blue-gray" className="text-sm sm:text-base">
                        {item.title}
                      </Typography>
                    </CardHeader>
                    <CardBody className="px-[0.5rem] sm:px-[0.75rem] md:px-[1rem] pt-0 pb-[0.5rem] sm:pb-[0.75rem] md:pb-[1rem] overflow-auto flex-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}} 
                              onScroll={(e) => e.target.style.setProperty('-webkit-scrollbar', 'none')}>
                      <div className="overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                        <table className="w-full text-left table-auto">
                          <thead>
                            <tr className="bg-gray-50/50">
                              <th className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs font-medium text-blue-gray-600">Ort</th>
                              <th className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs font-medium text-blue-gray-600">Skannade Dokument</th>
                              <th className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs font-medium text-blue-gray-600">Sidor</th>
                              <th className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs font-medium text-blue-gray-600">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {item.data.map((customer, i) => (
                              <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                <td className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs text-blue-gray-900 font-medium">{customer.ort}</td>
                                <td className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs text-blue-gray-600">{typeof customer.skannadeDokument === 'number' ? customer.skannadeDokument.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : customer.skannadeDokument}</td>
                                <td className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs text-blue-gray-600">{typeof customer.totalSidor === 'number' ? customer.totalSidor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : customer.totalSidor}</td>
                                <td className="p-[0.25rem] sm:p-[0.375rem] md:p-[0.5rem] text-xs">
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    customer.status === 'Mycket Aktiv' 
                                      ? 'bg-green-200 text-green-900' 
                                      : customer.status === 'Aktiv'
                                        ? 'bg-green-100 text-green-800'
                                        : customer.status === 'Mindre Aktiv'
                                          ? 'bg-orange-100 text-orange-800'
                                          : 'bg-red-100 text-red-800'
                                  }`}>
                                    {customer.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardBody>
                  </Card>
                ) : (
                  <StatisticsChart
                    {...item}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Scantovitec;