import PropTypes from "prop-types";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Navbar,
  Typography,
  Button,
  IconButton,
  Input,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
  Card,
  List,
  ListItem,
  Collapse,
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
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function HeaderNav({ brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { fixedNavbar } = controller;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  
  // Mobile menu state
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  // Get all searchable pages from routes
  const getSearchablePages = () => {
    const pages = [];
    routes.forEach(route => {
      if (route.layout === "dashboard" && route.pages) {
        route.pages.forEach(page => {
          pages.push({
            name: page.name,
            path: `/${route.layout}${page.path}`,
            icon: page.icon
          });
        });
      }
    });
    return pages;
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    const searchablePages = getSearchablePages();
    const filtered = searchablePages.filter(page =>
      page.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setSearchResults(filtered);
    setShowResults(filtered.length > 0);
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle result selection
  const handleResultSelect = (path) => {
    navigate(path);
    setSearchQuery("");
    setShowResults(false);
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get main navigation items and sections
  const mainRoutes = routes.find(route => route.layout === "dashboard" && !route.title)?.pages || [];
  const sectionRoutes = routes.filter(route => route.layout === "dashboard" && route.title);

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
        <div className="flex items-center gap-4">
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

        {/* Center: Desktop Navigation */}
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

        {/* Right: Search, User Controls, Mobile Menu */}
        <div className="flex items-center gap-2">
          
          {/* Search - Hidden on mobile */}
          <div className="hidden md:block relative" ref={searchRef}>
            <Input 
              label="Sök sidor..."
              size="md"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
              className="!min-w-[200px]"
            />
            {showResults && (
              <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto">
                <List className="p-0">
                  {searchResults.map((result, index) => (
                    <ListItem
                      key={index}
                      className="flex items-center gap-3 hover:bg-blue-gray-50 cursor-pointer"
                      onClick={() => handleResultSelect(result.path)}
                    >
                      {result.icon && <span className="text-blue-gray-500">{result.icon}</span>}
                      <Typography variant="small" color="blue-gray" className="font-medium capitalize">
                        {result.name}
                      </Typography>
                    </ListItem>
                  ))}
                </List>
              </Card>
            )}
          </div>

          {/* Notifications */}
          <Menu>
            <MenuHandler>
              <IconButton variant="text" color="blue-gray" size="sm">
                <BellIcon className="h-5 w-5" />
              </IconButton>
            </MenuHandler>
            <MenuList className="w-max border-0">
              <MenuItem className="flex items-center gap-3">
                <Avatar
                  src="https://demos.creative-tim.com/material-dashboard/assets/img/team-2.jpg"
                  alt="notification"
                  size="sm"
                  variant="circular"
                />
                <div>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="mb-1 font-normal"
                  >
                    <strong>New message</strong> from Laur
                  </Typography>
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="flex items-center gap-1 text-xs font-normal opacity-60"
                  >
                    <ClockIcon className="h-3.5 w-3.5" /> 13 minutes ago
                  </Typography>
                </div>
              </MenuItem>
            </MenuList>
          </Menu>

          {/* Settings */}
          <IconButton
            variant="text"
            color="blue-gray"
            size="sm"
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </IconButton>

          {/* Sign In */}
          <Link to="/auth/sign-in">
            <Button
              variant="text"
              color="blue-gray"
              size="sm"
              className="hidden xl:flex items-center gap-1 px-4 normal-case"
            >
              <UserCircleIcon className="h-4 w-4" />
              Sign In
            </Button>
            <IconButton
              variant="text"
              color="blue-gray"
              size="sm"
              className="xl:hidden"
            >
              <UserCircleIcon className="h-5 w-5" />
            </IconButton>
          </Link>

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
          
          {/* Mobile Search */}
          <div className="mb-4" ref={searchRef}>
            <Input 
              label="Sök sidor..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery && setShowResults(true)}
            />
          </div>

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
};

HeaderNav.displayName = "/src/widgets/layout/header-nav.jsx";

export default HeaderNav;