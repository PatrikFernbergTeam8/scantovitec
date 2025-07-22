import PropTypes from "prop-types";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Collapse,
  Select,
  Option,
} from "@material-tailwind/react";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  BellIcon,
  ClockIcon as ClockIconSolid,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
  ClockIcon,
  ChartBarIcon,
  UserGroupIcon,
} from "@heroicons/react/24/outline";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function HeaderNav({ brandName, routes, filters, onFilterChange, onResetFilters }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar } = controller;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const weekOptions = [
    { value: 'current', label: 'Aktuell vecka' },
    { value: 'last', label: 'Förra veckan' }
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
    return `flex items-center gap-2 normal-case min-w-fit flex-shrink-0 px-3 py-2 rounded-xl transition-all duration-200 ${
      isActive 
        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-2xl shadow-blue-500/50' 
        : 'bg-white text-gray-700 shadow-xl shadow-gray-400/30 hover:shadow-2xl hover:shadow-gray-500/40'
    }`;
  };
  

  // Get main navigation items and sections (filter out items with showInNav: false)
  const mainRoutes = routes.find(route => route.layout === "dashboard" && !route.title)?.pages.filter(page => page.showInNav !== false) || [];
  const sectionRoutes = routes.filter(route => route.layout === "dashboard" && route.title).map(section => ({
    ...section,
    pages: section.pages.filter(page => page.showInNav !== false)
  })).filter(section => section.pages.length > 0);

  return (
    <Navbar
      color={fixedNavbar ? "white" : "transparent"}
      className={`${fixedNavbar ? "sticky top-0" : "relative"} z-50 transition-all border-0 ${
        fixedNavbar
          ? "shadow-md shadow-blue-gray-500/5 backdrop-blur-md backdrop-saturate-200"
          : ""
      }`}
      fullWidth
      blurred={fixedNavbar}
    >
      <div className="flex items-center justify-between px-1 mt-2 -mb-6 h-16">
        
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/dashboard/home" className="flex items-center gap-3">
            <img 
              src="/img/LF_Logo.png" 
              alt="Logo" 
              className="h-24 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Center: Navigation or Filters */}
        <div className="flex-1 flex justify-start items-center px-4 ml-64">
          {pathname === '/dashboard/scantovitec' && filters ? (
            <div className="flex items-center gap-4 overflow-x-auto max-w-full">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-2 rounded-full border border-blue-200/50">
                  <FunnelIcon className="h-4 w-4 text-blue-600" />
                  <Typography variant="small" className="font-semibold text-blue-700">
                    Filter
                  </Typography>
                </div>
              </div>
              
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
                {/* Month filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.month)}
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.month ? months.find(m => m.value === filters.month)?.label : 'Månad'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
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

                {/* Year filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.year)}
                    >
                      <CalendarDaysIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.year ? years.find(y => y.value === filters.year)?.label : 'År'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange({ ...filters, year: '' })}>
                      Alla år
                    </MenuItem>
                    {years.map((year) => (
                      <MenuItem
                        key={year.value}
                        onClick={() => onFilterChange({ ...filters, year: year.value })}
                        className={filters.year === year.value ? 'bg-blue-50' : ''}
                      >
                        {year.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Quarter filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.quarter)}
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.quarter ? quarters.find(q => q.value === filters.quarter)?.label : 'Kvartal'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange({ ...filters, quarter: '' })}>
                      Alla kvartal
                    </MenuItem>
                    {quarters.map((quarter) => (
                      <MenuItem
                        key={quarter.value}
                        onClick={() => onFilterChange({ ...filters, quarter: quarter.value })}
                        className={filters.quarter === quarter.value ? 'bg-blue-50' : ''}
                      >
                        {quarter.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Last Days filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.lastDays)}
                    >
                      <ClockIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.lastDays ? lastDaysOptions.find(d => d.value === filters.lastDays)?.label : 'Period'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange({ ...filters, lastDays: '' })}>
                      Alla perioder
                    </MenuItem>
                    {lastDaysOptions.map((option) => (
                      <MenuItem
                        key={option.value}
                        onClick={() => onFilterChange({ ...filters, lastDays: option.value })}
                        className={filters.lastDays === option.value ? 'bg-blue-50' : ''}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* City filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.city)}
                    >
                      <MapPinIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.city ? cities.find(c => c.value === filters.city)?.label : 'Ort'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
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

                {/* Volume Level filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.volumeLevel)}
                    >
                      <ChartBarIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.volumeLevel ? volumeLevels.find(v => v.value === filters.volumeLevel)?.label : 'Volym'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange({ ...filters, volumeLevel: '' })}>
                      Alla volymer
                    </MenuItem>
                    {volumeLevels.map((level) => (
                      <MenuItem
                        key={level.value}
                        onClick={() => onFilterChange({ ...filters, volumeLevel: level.value })}
                        className={filters.volumeLevel === level.value ? 'bg-blue-50' : ''}
                      >
                        {level.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Customer Activity filter */}
                <Menu>
                  <MenuHandler>
                    <Button
                      variant="text"
                      className={getFilterButtonClass(filters.customerActivity)}
                    >
                      <UserGroupIcon className="h-4 w-4" />
                      <span className="font-medium text-sm">
                        {filters.customerActivity ? customerActivityLevels.find(a => a.value === filters.customerActivity)?.label : 'Aktivitet'}
                      </span>
                    </Button>
                  </MenuHandler>
                  <MenuList className="max-h-60 overflow-y-auto shadow-2xl shadow-gray-500/50 border-0 bg-white">
                    <MenuItem onClick={() => onFilterChange({ ...filters, customerActivity: '' })}>
                      Alla aktivitetsnivåer
                    </MenuItem>
                    {customerActivityLevels.map((level) => (
                      <MenuItem
                        key={level.value}
                        onClick={() => onFilterChange({ ...filters, customerActivity: level.value })}
                        className={filters.customerActivity === level.value ? 'bg-blue-50' : ''}
                      >
                        {level.label}
                      </MenuItem>
                    ))}
                  </MenuList>
                </Menu>

                {/* Reset button */}
                {(filters.month || filters.year || filters.quarter || filters.lastDays || filters.city || filters.volumeLevel || filters.customerActivity) && (
                  <Button
                    variant="text"
                    onClick={onResetFilters}
                    className="flex items-center gap-2 flex-shrink-0 px-3 py-2 rounded-xl transition-all duration-200 bg-red-50 text-red-600 shadow-xl shadow-red-400/30 hover:shadow-2xl hover:shadow-red-500/40"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    <span className="font-medium text-sm">Rensa</span>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1">
              {/* Main navigation items */}
              {mainRoutes.map(({ icon, name, path }) => (
                <NavLink key={name} to={`/dashboard${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={isActive ? "blue" : "blue-gray"}
                      className="flex items-center gap-2 px-4 py-2 normal-case"
                      size="sm"
                    >
                      {icon}
                      <span className="font-medium capitalize">{name}</span>
                    </Button>
                  )}
                </NavLink>
              ))}

              {/* Section dropdowns */}
              {sectionRoutes.map((section) => (
                <Menu key={section.title} placement="bottom-start">
                  <MenuHandler>
                    <Button
                      variant="text"
                      color="blue-gray"
                      className="flex items-center gap-2 px-4 py-2 normal-case"
                      size="sm"
                    >
                      <span className="font-medium capitalize">{section.title}</span>
                      <ChevronDownIcon className="h-4 w-4" />
                    </Button>
                  </MenuHandler>
                  <MenuList className="min-w-fit">
                    {section.pages.map(({ icon, name, path }) => {
                      const isActive = pathname === `/dashboard${path}`;
                      return (
                        <MenuItem
                          key={name}
                          className={`flex items-center gap-3 ${isActive ? "bg-blue-50" : ""}`}
                          onClick={() => navigate(`/dashboard${path}`)}
                        >
                          {icon}
                          <Typography variant="small" className="font-medium capitalize">
                            {name}
                          </Typography>
                        </MenuItem>
                      );
                    })}
                  </MenuList>
                </Menu>
              ))}
            </div>
          )}
        </div>

        {/* Right: Mobile Menu */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Mobile Menu Toggle */}
          <IconButton
            variant="text"
            color="blue-gray"
            size="sm"
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </IconButton>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <Collapse open={mobileMenuOpen} className="lg:hidden">
        <div className="px-4 py-4 border-t border-blue-gray-100">
          

          {/* Mobile Navigation Links */}
          <div className="space-y-2">
            {mainRoutes.map(({ icon, name, path }) => {
              const isActive = pathname === `/dashboard${path}`;
              return (
                <NavLink
                  key={name}
                  to={`/dashboard${path}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button
                    variant={isActive ? "gradient" : "text"}
                    color={isActive ? "blue" : "blue-gray"}
                    className="flex items-center gap-3 w-full justify-start normal-case"
                    size="sm"
                  >
                    {icon}
                    <span className="font-medium capitalize">{name}</span>
                  </Button>
                </NavLink>
              );
            })}

            {/* Mobile Section Links */}
            {sectionRoutes.map((section) => (
              <div key={section.title} className="space-y-1">
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-semibold uppercase opacity-75 px-3 py-2"
                >
                  {section.title}
                </Typography>
                {section.pages.map(({ icon, name, path }) => {
                  const isActive = pathname === `/dashboard${path}`;
                  return (
                    <NavLink
                      key={name}
                      to={`/dashboard${path}`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button
                        variant={isActive ? "gradient" : "text"}
                        color={isActive ? "blue" : "blue-gray"}
                        className="flex items-center gap-3 w-full justify-start normal-case pl-6"
                        size="sm"
                      >
                        {icon}
                        <span className="font-medium capitalize">{name}</span>
                      </Button>
                    </NavLink>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Collapse>
    </Navbar>
  );
}

HeaderNav.defaultProps = {
  brandName: "LINK",
};

HeaderNav.propTypes = {
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
  filters: PropTypes.object,
  onFilterChange: PropTypes.func,
  onResetFilters: PropTypes.func,
};

HeaderNav.displayName = "/src/widgets/layout/header-nav.jsx";

export default HeaderNav;