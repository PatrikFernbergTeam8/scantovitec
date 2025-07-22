import { Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import React from "react";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  HeaderNav,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const location = useLocation();
  const isHomePage = location.pathname === "/" || location.pathname === "/dashboard/home";
  const isTablesPage = location.pathname === "/dashboard/tables";
  const isScantovitecPage = location.pathname === "/dashboard/scantovitec";
  const isFullWidthPage = isHomePage || isTablesPage || isScantovitecPage;

  // Filter state for scantovitec page
  const [filters, setFilters] = useState({
    month: '',
    year: '',
    quarter: '',
    week: '',
    lastDays: '',
    dateFrom: '',
    dateTo: '',
    city: '',
    volumeLevel: '',
    customerActivity: ''
  });

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      month: '',
      year: '',
      quarter: '',
      week: '',
      lastDays: '',
      dateFrom: '',
      dateTo: '',
      city: '',
      volumeLevel: '',
      customerActivity: ''
    });
  };

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <HeaderNav 
        routes={routes} 
        filters={isScantovitecPage ? filters : null}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />
      <Configurator />
      {isFullWidthPage ? (
        // Full-width pages without container constraints
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element, name }) => (
                <Route 
                  key={path}
                  exact 
                  path={path} 
                  element={
                    name === 'scantovitec' 
                      ? React.cloneElement(element, { filters, onFilterChange: handleFilterChange, onResetFilters: handleResetFilters })
                      : element
                  } 
                />
              ))
          )}
        </Routes>
      ) : (
        // Other pages with container
        <div className="px-4 max-w-screen-2xl mx-auto">
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === "dashboard" &&
                pages.map(({ path, element, name }) => (
                  <Route 
                    key={path}
                    exact 
                    path={path} 
                    element={
                      name === 'scantovitec' 
                        ? React.cloneElement(element, { filters, onFilterChange: handleFilterChange, onResetFilters: handleResetFilters })
                        : element
                    } 
                  />
                ))
            )}
          </Routes>
        </div>
      )}
        <div className="text-blue-gray-600">
          <Footer />
        </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
