import { Routes, Route, useLocation } from "react-router-dom";
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
  const isFullWidthPage = isHomePage || isTablesPage;

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <HeaderNav routes={routes} />
      <Configurator />
      {isFullWidthPage ? (
        // Full-width pages without container constraints
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
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
                pages.map(({ path, element }) => (
                  <Route exact path={path} element={element} />
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
