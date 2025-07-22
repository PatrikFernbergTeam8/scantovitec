import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Avatar,
  Chip,
  Tooltip,
  Progress,
  Button,
  Spinner,
  Input,
} from "@material-tailwind/react";
import { EllipsisVerticalIcon, ArrowPathIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { BanknotesIcon, UsersIcon, UserPlusIcon, ChartBarIcon, PrinterIcon, CurrencyDollarIcon, BookmarkIcon, WrenchScrewdriverIcon, HandRaisedIcon } from "@heroicons/react/24/solid";
import { printersInventoryData } from "@/data";
import React, { useState, useEffect } from "react";
import { StatisticsCard } from "@/widgets/cards";

// Import Google Sheets hook
import { useGoogleSheetsData, reservePrinterInSheet, unreservePrinterInSheet } from "@/services/googleSheets";

export function Tables() {
  // Use Google Sheets API - hooks must be called at top level
  const { data: liveData, loading, error, refetch } = useGoogleSheetsData();
  
  // Sorting state
  const [sortConfig, setSortConfig] = useState({
    key: 'status',
    direction: 'asc'
  });

  // Reservation input state
  const [reservationInput, setReservationInput] = useState({
    rowNumber: null,
    name: ''
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Use live data if available, otherwise fall back to static data
  const allPrinters = liveData.length > 0 ? liveData : printersInventoryData;
  
  // Sorting function
  const sortPrinters = (printers) => {
    if (!sortConfig.key) return printers;
    
    return [...printers].sort((a, b) => {
      let aValue, bValue;
      
      switch (sortConfig.key) {
        case 'brandModel':
          aValue = `${a.brand} ${a.model}`.toLowerCase();
          bValue = `${b.brand} ${b.model}`.toLowerCase();
          break;
        case 'serialNumber':
          aValue = (a.serialNumber || '').toLowerCase();
          bValue = (b.serialNumber || '').toLowerCase();
          break;
        case 'status':
          // Custom status order: Tillgänglig, Ej klar, Under lagning, Levererad
          const statusOrder = {
            'tillgänglig': 1,
            'inväntar rekond': 2,
            'under lagning': 3,
            'levererad': 4
          };
          aValue = statusOrder[getStatusText(a.status).toLowerCase()] || 5;
          bValue = statusOrder[getStatusText(b.status).toLowerCase()] || 5;
          break;
        case 'location':
          aValue = (a.location || '').toLowerCase();
          bValue = (b.location || '').toLowerCase();
          break;
        case 'sellerName':
          aValue = (a.sellerName || '').toLowerCase();
          bValue = (b.sellerName || '').toLowerCase();
          break;
        case 'price':
          // Extract numeric value for price sorting
          const extractPrice = (price) => {
            if (typeof price === 'string') {
              const numMatch = price.replace(/\s/g, '').match(/\d+/);
              return numMatch ? parseInt(numMatch[0]) : 0;
            }
            return typeof price === 'number' ? price : 0;
          };
          aValue = extractPrice(a.price);
          bValue = extractPrice(b.price);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };
  
  // Handle sort click
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  // Get status text function (moved up to be available for filtering)
  const getStatusText = (status) => {
    switch (status) {
      case "delivered":
        return "Levererad";
      case "pending":
        return "Inväntar rekond";
      case "cancelled":
        return "Under lagning";
      case "available":
        return "Tillgänglig";
      default:
        return status;
    }
  };
  
  // Search/filter function
  const filterPrinters = (printers) => {
    if (!searchQuery.trim()) return printers;
    
    return printers.filter(printer => {
      const searchTerm = searchQuery.toLowerCase();
      return (
        (printer.brand || '').toLowerCase().includes(searchTerm) ||
        (printer.model || '').toLowerCase().includes(searchTerm) ||
        (printer.serialNumber || '').toLowerCase().includes(searchTerm) ||
        (printer.location || '').toLowerCase().includes(searchTerm) ||
        (printer.sellerName || '').toLowerCase().includes(searchTerm) ||
        (printer.customerName || '').toLowerCase().includes(searchTerm) ||
        `${printer.brand} ${printer.model}`.toLowerCase().includes(searchTerm)
      );
    });
  };

  // Separate, filter, and sort printers based on condition and search query
  const usedPrinters = sortPrinters(filterPrinters(allPrinters.filter(printer => printer.condition === 'used')));
  const newPrinters = sortPrinters(filterPrinters(allPrinters.filter(printer => printer.condition === 'new')));
  
  
  // Function to show reservation input
  const showReservationInput = (printer) => {
    setReservationInput({
      rowNumber: printer._rowNumber,
      name: ''
    });
  };

  // Function to cancel reservation input
  const cancelReservationInput = () => {
    setReservationInput({
      rowNumber: null,
      name: ''
    });
  };

  // Function to confirm reservation
  const confirmReservation = async (printer) => {
    if (!reservationInput.name.trim()) {
      alert('Vänligen ange ditt namn');
      return;
    }

    try {
      const success = await reservePrinterInSheet(printer, reservationInput.name.trim());
      if (success) {
        // Reset input state
        setReservationInput({
          rowNumber: null,
          name: ''
        });
        // Refresh data from Google Sheets
        refetch();
      } else {
        console.error('Failed to reserve printer in Google Sheets');
      }
    } catch (error) {
      console.error('Error reserving printer:', error);
    }
  };
  
  // Function to unreserve a printer by updating Google Sheets
  const unreservePrinter = async (printer) => {
    try {
      const success = await unreservePrinterInSheet(printer);
      if (success) {
        // Refresh data from Google Sheets
        refetch();
      } else {
        console.error('Failed to unreserve printer in Google Sheets');
      }
    } catch (error) {
      console.error('Error unreserving printer:', error);
    }
  };
  
  // Calculate statistics
  const totalPrinters = usedPrinters.length + newPrinters.length;
  const totalReserved = allPrinters.filter(printer => printer.reservedBy).length;
  
  // Calculate total inventory value (all printers regardless of status or reservation)
  const totalValue = allPrinters.reduce((sum, printer) => {
    const value = printer.price;
    if (typeof value === 'string') {
      // Extract number from string like "5 000" or "Se avtal"
      const numMatch = value.replace(/\s/g, '').match(/\d+/);
      return sum + (numMatch ? parseInt(numMatch[0]) : 0);
    }
    return sum + (typeof value === 'number' ? value : 0);
  }, 0);
  
  // Debug log
  console.log('All printers for value calculation:', allPrinters.length);
  console.log('Used printers:', usedPrinters.length);
  console.log('New printers:', newPrinters.length);
  console.log('Reserved printers:', totalReserved);
  console.log('Total value:', totalValue);

  // Function to render a printer table
  const renderPrinterTable = (printers, title, headerColor = "gray", isNewPrintersTable = false) => {
    const getGradientClass = (isNewPrintersTable) => {
      return isNewPrintersTable 
        ? "bg-gradient-to-r from-blue-500 to-blue-600" 
        : "bg-gradient-to-r from-green-500 to-green-600";
    };

    return (
      <div className="group">
        <Card className="rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gray-200 p-4 text-blue-gray-800 relative">
            <div className="relative z-10">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="h6" className="mb-2 font-bold">
                    {title}
                  </Typography>
                  <div className="flex items-center gap-2">
                    <Typography variant="small" className="text-blue-gray-600">
                      {printers.length} skrivare i lager
                    </Typography>
                    {loading && <Spinner className="h-4 w-4" />}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {error && (
                    <Typography variant="small" className="mr-2 text-red-600">
                      Error: {error}
                    </Typography>
                  )}
                  <Button
                    variant="outlined"
                    color="blue-gray"
                    size="sm"
                    onClick={refetch}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <ArrowPathIcon className="h-4 w-4" />
                    Uppdatera
                  </Button>
                </div>
              </div>
            </div>
          </div>
        <CardBody className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] table-auto">
              <thead>
                <tr className="bg-gray-50/50">
                  {[
                    { label: "Märke/Modell", key: "brandModel" },
                    { label: "Serienummer", key: "serialNumber" },
                    { label: "Status", key: "status" },
                    { label: isNewPrintersTable ? "Säljare" : "Senaste kund", key: isNewPrintersTable ? "sellerName" : "location" },
                    { label: "Lagervärde", key: "price" },
                    { label: "", key: null }
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      className={`py-2 px-4 text-left rounded-lg ${key ? 'cursor-pointer hover:bg-gray-100 transition-colors duration-200' : ''}`}
                      onClick={key ? () => handleSort(key) : undefined}
                    >
                      <div className="flex items-center gap-2">
                        <Typography
                          variant="small"
                          className="text-xs font-semibold uppercase text-blue-gray-600 tracking-wider"
                        >
                          {label}
                        </Typography>
                        {key && (
                          <div className="flex flex-col">
                            <ChevronUpIcon 
                              className={`h-3 w-3 transition-colors duration-200 ${
                                sortConfig.key === key && sortConfig.direction === 'asc' 
                                  ? 'text-blue-600' 
                                  : 'text-blue-gray-300'
                              }`}
                            />
                            <ChevronDownIcon 
                              className={`h-3 w-3 transition-colors duration-200 ${
                                sortConfig.key === key && sortConfig.direction === 'desc' 
                                  ? 'text-blue-600' 
                                  : 'text-blue-gray-300'
                              }`}
                            />
                          </div>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {printers.map(
                  ({ brand, model, status, location, price, serialNumber, sellerName, customerName, isSold, _rowNumber }, key) => {
                    const className = `py-2 px-4 ${
                      key === printers.length - 1
                        ? ""
                        : "border-b border-gray-100"
                    }`;

                    const getStatusColor = (status) => {
                      switch (status) {
                        case "delivered":
                          return "green";
                        case "pending":
                          return "orange";
                        case "cancelled":
                          return "red";
                        case "available":
                          return "green";
                        default:
                          return "blue-gray";
                      }
                    };

                    const getStatusGradient = (status) => {
                      switch (status) {
                        case "delivered":
                          return "bg-gradient-to-r from-green-100 to-green-200 text-green-800";
                        case "pending":
                          return "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800";
                        case "cancelled":
                          return "bg-gradient-to-r from-red-100 to-red-200 text-red-800";
                        case "available":
                          return "bg-gradient-to-r from-green-100 to-green-200 text-green-800";
                        default:
                          return "bg-gradient-to-r from-blue-gray-100 to-blue-gray-200 text-blue-gray-800";
                      }
                    };

                    return (
                      <tr key={`${brand}-${model}-${key}`} className="group">
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {brand} {model}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {serialNumber}
                          </Typography>
                        </td>
                        <td className={className}>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusGradient(status)}`}>
                            {getStatusText(status)}
                          </span>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {isNewPrintersTable && sellerName ? sellerName : location}
                          </Typography>
                        </td>
                        <td className={className}>
                          <Typography className="text-sm font-semibold text-blue-gray-700">
                            {price}
                          </Typography>
                        </td>
                        <td className={className}>
                          {/* Check if printer is reserved or sold */}
                          {allPrinters.find(p => p._rowNumber === _rowNumber)?.reservedBy ? (
                            <Typography className="text-sm font-semibold text-blue-gray-700">
                              {allPrinters.find(p => p._rowNumber === _rowNumber)?.isSold ? 
                                `Såld till ${allPrinters.find(p => p._rowNumber === _rowNumber)?.customerName || 'okänd kund'}` : 
                                allPrinters.find(p => p._rowNumber === _rowNumber)?.reservedBy
                              }
                            </Typography>
                          ) : (
                            /* Show reservation input or button only for available printers */
                            status === 'available' ? (
                              reservationInput.rowNumber === _rowNumber ? (
                                <div className="flex gap-2 items-center">
                                  <Input
                                    size="sm"
                                    placeholder="Ditt namn"
                                    value={reservationInput.name}
                                    onChange={(e) => setReservationInput(prev => ({ ...prev, name: e.target.value }))}
                                    className="w-24 !border-[#25323A] focus:!border-[#25323A] focus:!border-t-[#25323A] rounded-lg text-xs"
                                    labelProps={{
                                      className: "hidden",
                                    }}
                                    containerProps={{
                                      className: "!min-w-0",
                                    }}
                                  />
                                  <span
                                    onClick={() => confirmReservation({ brand, model, status, location, price, serialNumber, _rowNumber })}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 cursor-pointer hover:from-green-200 hover:to-green-300 transition-colors duration-200"
                                  >
                                    OK
                                  </span>
                                  <span
                                    onClick={cancelReservationInput}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 cursor-pointer hover:from-gray-200 hover:to-gray-300 transition-colors duration-200"
                                  >
                                    Avbryt
                                  </span>
                                </div>
                              ) : (
                                <span 
                                  onClick={() => showReservationInput({ brand, model, status, location, price, serialNumber, _rowNumber })}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 cursor-pointer hover:from-blue-200 hover:to-blue-300 transition-colors duration-200"
                                >
                                  Reservera
                                </span>
                              )
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600">
                                Går ej att reservera
                              </span>
                            )
                          )}
                        </td>
                    </tr>
                  );
                }
                )}
              </tbody>
            </table>
          </div>
        </CardBody>
        </Card>
      </div>
    );
  };
  
  // Format value for display
  const formatValue = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`;
    } else {
      return `${value}`;
    }
  };
  
  // Debug log to see what data we're getting
  console.log('Live data:', liveData);
  console.log('Used printers:', usedPrinters.length);
  console.log('New printers:', newPrinters.length);
  
  return (
    <div className="mb-8">
      {/* Combined Statistics and Search - Full Width Background */}
      <div className="relative mb-12 py-20 w-full bg-[url('/img/background-image.png')] bg-cover bg-center">
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between gap-8">
            {/* Statistics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1">
              {/* Skrivare i lager */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <PrinterIcon className="w-12 h-12 mb-4 opacity-90" />
                    <Typography variant="h6" className="opacity-90 mb-2">
                      Skrivare i lager
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {totalPrinters}
                    </Typography>
                  </div>
                </div>
              </div>
              
              {/* Lagervärde */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <CurrencyDollarIcon className="w-12 h-12 mb-4 opacity-90" />
                    <Typography variant="h6" className="opacity-90 mb-2">
                      Lagervärde
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {formatValue(totalValue)}
                    </Typography>
                  </div>
                </div>
              </div>
              
              {/* Reserverade */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <HandRaisedIcon className="w-12 h-12 mb-4 opacity-90" />
                    <Typography variant="h6" className="opacity-90 mb-2">
                      Reserverade
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {totalReserved}
                    </Typography>
                  </div>
                </div>
              </div>
              
              {/* Lagning */}
              <div className="group hover:scale-105 transition-transform duration-300">
                <div className="rounded-xl p-4 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <WrenchScrewdriverIcon className="w-12 h-12 mb-4 opacity-90" />
                    <Typography variant="h6" className="opacity-90 mb-2">
                      Under lagning
                    </Typography>
                    <Typography variant="h3" className="font-bold">
                      {allPrinters.filter(p => p.status === 'cancelled').length}
                    </Typography>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Section */}
            <div className="flex flex-col gap-3 w-1/3 min-w-[300px]">
              <Typography variant="h6" className="font-semibold text-white">
                Sök skrivare
              </Typography>
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Sök på märke, modell, serienummer..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="!border-white/30 focus:!border-white focus:!border-t-white w-full rounded-lg !text-white placeholder:!text-white/70 bg-white/10"
                  labelProps={{
                    className: "hidden",
                  }}
                  containerProps={{
                    className: "!min-w-0",
                  }}
                />
                {searchQuery && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="px-4 py-2 rounded-lg border-white/30 text-white hover:bg-white/10 transition-all duration-200"
                  >
                    Rensa
                  </Button>
                )}
              </div>
              {searchQuery && (
                <div className="bg-black/20 rounded-lg p-3">
                  <Typography variant="small" className="text-sm font-medium text-white">
                    {(usedPrinters.length + newPrinters.length) > 0 ? 
                      `${usedPrinters.length + newPrinters.length} resultat funna` : 
                      'Inga resultat'
                    }
                  </Typography>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-blue-900/40 to-purple-900/50"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 flex flex-col gap-12">
        {/* Begagnade skrivare i lager */}
        {renderPrinterTable(usedPrinters, "Begagnade skrivare i lager", "gray")}
        
        {/* Nya skrivare i lager */}
        {renderPrinterTable(newPrinters, "Nya skrivare i lager", "blue", true)}
      </div>
    </div>
  );
}

export default Tables;
