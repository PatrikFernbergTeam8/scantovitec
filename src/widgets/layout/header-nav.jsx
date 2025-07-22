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
  ClockIcon,
  CreditCardIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/solid";
import {
  FunnelIcon,
  CalendarDaysIcon,
  MapPinIcon,
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
      <div className="flex items-center justify-between px-4 py-2">
        
        {/* Left: Logo and Brand */}
        <div className="flex items-center gap-4 flex-shrink-0">
          <Link to="/dashboard/home" className="flex items-center gap-3">
            <img 
              src="/img/logo_svart.png" 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
            <Typography
              variant="h5"
              color="blue-gray"
              className="font-bold hidden sm:block"
            >
              {brandName}
            </Typography>
          </Link>
        </div>

        {/* Center: Navigation or Filters */}
        <div className="flex-1 flex justify-center items-center px-4">
          {pathname === '/dashboard/scantovitec' && filters ? (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <FunnelIcon className="h-4 w-4 text-gray-500" />
                <Typography variant="small" className="font-medium text-gray-700">
                  Filter:
                </Typography>
              </div>
              
              {/* Month filter */}
              <Menu>
                <MenuHandler>
                  <Button
                    variant={filters.month ? "filled" : "outlined"}
                    color={filters.month ? "blue" : "gray"}
                    size="sm"
                    className="flex items-center gap-2 normal-case min-w-32"
                  >
                    <CalendarDaysIcon className="h-4 w-4" />
                    {filters.month ? months.find(m => m.value === filters.month)?.label : 'Välj månad'}
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
                    className="flex items-center gap-2 normal-case min-w-32"
                  >
                    <MapPinIcon className="h-4 w-4" />
                    {filters.city ? cities.find(c => c.value === filters.city)?.label : 'Välj ort'}
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

              {/* Reset button */}
              {(filters.month || filters.city) && (
                <Button
                  variant="text"
                  color="gray"
                  size="sm"
                  onClick={onResetFilters}
                  className="flex items-center gap-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                  Rensa
                </Button>
              )}
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