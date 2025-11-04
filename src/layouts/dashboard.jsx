import { Routes, Route, Navigate } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      {/* Sidebar */}
      <Sidenav
        routes={routes}
        brandImg={
          sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
        }
      />

      {/* Main content */}
      <div className="p-4 xl:ml-80">
        <div className="mb-6">
          <DashboardNavbar />
        </div>

        <Routes>
          {routes
            .filter((r) => r.layout === "dashboard")
            .flatMap(({ pages }) =>
              pages.flatMap(({ path, element, subRoutes }) =>
                subRoutes
                  ? subRoutes.map((sub) => (
                      <Route
                        key={sub.path}
                        path={sub.path}
                        element={sub.element}
                      />
                    ))
                  : [
                      <Route
                        key={path}
                        path={path}
                        element={element}
                      />,
                    ]
              )
            )}

          {/* Default redirect to /dashboard/home */}
          <Route path="*" element={<Navigate to="home" replace />} />
        </Routes>

        {/* <div className="text-center mt-6">
          <Footer />
        </div> */}
      </div>

      {/* Configurator Button */}
      {/* <IconButton
        size="lg"
        color="white"
        className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
        onClick={() => setOpenConfigurator(dispatch, true)}
      >
        <Cog6ToothIcon className="h-5 w-5" />
      </IconButton> */}

      <Configurator />
    </div>
  );
}

Dashboard.displayName = "/src/layouts/dashboard.jsx";

export default Dashboard;
