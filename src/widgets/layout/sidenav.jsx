import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import {
  Avatar,
  Button,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav, setMinimizedSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav, minimizedSidenav } = controller;
  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900",
    white: "bg-white shadow-sm",
    transparent: "bg-transparent",
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] ${
        minimizedSidenav ? "w-20" : "w-72"
      } rounded-xl transition-all duration-300 xl:translate-x-0 border border-blue-gray-100`}
    >
      <div
        className={`relative`}
      >
        <div className={`py-3 text-left ${minimizedSidenav ? "px-4" : "px-4"} flex items-center gap-2`}>
          <Link to="/" className="flex items-center gap-2">
            <img 
              src={minimizedSidenav 
                ? (sidenavType === "dark" ? "/img/icon_vit.png" : "/img/icon.png")
                : (sidenavType === "dark" ? "/img/logo_vit.png" : "/img/logo_svart.png")
              } 
              alt="Logo" 
              className="h-24 w-24 object-contain"
            />
            {!minimizedSidenav && (
              <Typography
                variant="h5"
                color={sidenavType === "dark" ? "white" : "blue-gray"}
                className="whitespace-nowrap"
              >
                {brandName}
              </Typography>
            )}
          </Link>
          {/* Toggle minimize button when expanded - only visible on desktop */}
          {!minimizedSidenav && (
            <IconButton
              variant="text"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
              size="sm"
              ripple={false}
              className="hidden xl:grid ml-2"
              onClick={() => setMinimizedSidenav(dispatch, !minimizedSidenav)}
            >
              <ChevronLeftIcon strokeWidth={2.5} className="h-4 w-4" />
            </IconButton>
          )}
        </div>
        {/* Toggle expand button when minimized - positioned between logo and menu */}
        {minimizedSidenav && (
          <div className="px-4 pb-2">
            <IconButton
              variant="text"
              color={sidenavType === "dark" ? "white" : "blue-gray"}
              size="sm"
              ripple={false}
              className="hidden xl:grid w-full"
              onClick={() => setMinimizedSidenav(dispatch, !minimizedSidenav)}
            >
              <ChevronRightIcon strokeWidth={2.5} className="h-4 w-4" />
            </IconButton>
          </div>
        )}
        <IconButton
          variant="text"
          color="white"
          size="sm"
          ripple={false}
          className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
        </IconButton>
      </div>
      <div className="m-4">
        {routes.map(({ layout, title, pages }, key) => (
          <ul key={key} className="mb-4 flex flex-col gap-1">
            {title && !minimizedSidenav && (
              <li className="mx-3.5 mt-4 mb-2">
                <Typography
                  variant="small"
                  color={sidenavType === "dark" ? "white" : "blue-gray"}
                  className="font-black uppercase opacity-75"
                >
                  {title}
                </Typography>
              </li>
            )}
            {pages.filter(page => page.showInNav !== false).map(({ icon, name, path }) => (
              <li key={name}>
                <NavLink to={`/${layout}${path}`}>
                  {({ isActive }) => (
                    <Button
                      variant={isActive ? "gradient" : "text"}
                      color={
                        isActive
                          ? sidenavColor
                          : sidenavType === "dark"
                          ? "white"
                          : "blue-gray"
                      }
                      className={`flex items-center ${minimizedSidenav ? "justify-center px-2" : "gap-4 px-4"} capitalize`}
                      fullWidth
                    >
                      {icon}
                      {!minimizedSidenav && (
                        <Typography
                          color="inherit"
                          className="font-medium capitalize"
                        >
                          {name}
                        </Typography>
                      )}
                    </Button>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/logo-ct.png",
  brandName: "LINK",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
