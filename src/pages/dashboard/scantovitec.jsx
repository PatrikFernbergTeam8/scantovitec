import React, { useState, useEffect } from "react";
import { Typography, Card, CardHeader, CardBody } from "@material-tailwind/react";
import { StatisticsCard } from "@/widgets/cards";
import { StatisticsChart } from "@/widgets/charts";
import { FilterBar } from "@/components/FilterBar";
import { statisticsCardsData } from "@/data";
import { 
  BuildingOfficeIcon, 
  UserGroupIcon, 
  DocumentTextIcon, 
  ChartBarIcon 
} from "@heroicons/react/24/solid";
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel with filters
        const [statistics, scanningActivity, customersByCity, customerActivity, scanningEfficiency] = await Promise.all([
          ApiService.getStatistics(activeFilters),
          ApiService.getScanningActivity(activeFilters),
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
            title: "Scanning Aktivitet",
            description: "Sidor scannde per månad",
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
            title: "Mest Aktiva Kontor Denna Månad",
            description: "Översikt av kunder per stad",
            type: "table",
            data: customersByCity
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
            description: "Andel scanningar i batch (inom 15 min)",
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
    <div className="h-[calc(100vh-80px)] w-full overflow-visible flex flex-col">
      {/* Statistics Cards - Compact responsive grid with shadow space */}
      <div className="flex-shrink-0 grid gap-2 sm:gap-3 md:gap-4 
                      grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4
                      px-2 sm:px-3 md:px-4 pt-4 sm:pt-5 md:pt-6 pb-1 sm:pb-1.5 md:pb-2">
        {statisticsData.map((item) => (
          <StatisticsCard
            key={item.title}
            color={item.color}
            title={item.title}
            value={item.value}
            icon={React.createElement(iconMap[item.icon], {
              className: "w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-white",
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
      
      {/* Charts Grid - Takes remaining space with adequate spacing for shadows */}
      <div className="flex-1 px-2 sm:px-3 md:px-4 pt-1 sm:pt-1.5 md:pt-2 pb-2 sm:pb-3 md:pb-4 overflow-visible">
        <div className="h-full grid gap-2 sm:gap-3 md:gap-4 
                        grid-cols-1 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4" 
                        style={{gridTemplateRows: '1fr 1fr'}}>
          {chartsData.map((item, index) => (
            <div key={index} className={`h-full min-h-0 ${
              item.title.includes('Kundaktivitet') 
                ? 'md:col-span-1 md:row-span-1' 
                : item.title.includes('Batch-Scanning') 
                  ? 'md:col-span-1 md:row-span-1' 
                  : item.title.includes('Mest Aktiva Kontor') 
                    ? 'md:col-span-2 md:row-span-2' 
                    : 'md:col-span-2 md:row-span-1'
            }`}>
              {item.type === 'table' ? (
                <Card className="shadow-lg shadow-gray-500/40 border-0 bg-white h-full flex flex-col drop-shadow-lg">
                  <CardHeader variant="gradient" color="white" floated={false} shadow={false} className="p-4">
                    <Typography variant="h6" color="blue-gray">
                      {item.title}
                    </Typography>
                  </CardHeader>
                  <CardBody className="px-4 pt-0 pb-4 overflow-auto flex-1" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}} 
                            onScroll={(e) => e.target.style.setProperty('-webkit-scrollbar', 'none')}>
                    <div className="overflow-x-auto" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                      <table className="w-full text-left table-auto">
                        <thead>
                          <tr className="bg-gray-50/50">
                            <th className="p-2 text-xs font-medium text-blue-gray-600">Ort</th>
                            <th className="p-2 text-xs font-medium text-blue-gray-600">Skannade Dokument</th>
                            <th className="p-2 text-xs font-medium text-blue-gray-600">Sidor</th>
                            <th className="p-2 text-xs font-medium text-blue-gray-600">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.data.map((customer, i) => (
                            <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                              <td className="p-2 text-xs text-blue-gray-900 font-medium">{customer.ort}</td>
                              <td className="p-2 text-xs text-blue-gray-600">{customer.skannadeDokument}</td>
                              <td className="p-2 text-xs text-blue-gray-600">{customer.totalSidor}</td>
                              <td className="p-2 text-xs">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  customer.status === 'Aktiv' 
                                    ? 'bg-green-100 text-green-800' 
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
  );
}

export default Scantovitec;