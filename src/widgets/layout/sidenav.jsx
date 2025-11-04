import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import {
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import {
  Button,
  IconButton,
  Typography,
  Collapse,
} from "@material-tailwind/react";
import { useState } from "react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";

export function Sidenav({ brandImg, brandName, routes }) {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavColor, sidenavType, openSidenav } = controller;
  const [openDropdown, setOpenDropdown] = useState(null);

  const sidenavTypes = {
    dark: "bg-gradient-to-br from-gray-800 to-gray-900 text-white",
    white: "bg-white shadow-sm text-blue-gray-700",
    transparent: "bg-transparent text-blue-gray-700",
  };

  const handleCloseOnMobile = () => {
    if (window.innerWidth < 1280) setOpenSidenav(dispatch, false);
  };

  const toggleDropdown = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <aside
      className={`${sidenavTypes[sidenavType]} ${
        openSidenav ? "translate-x-0" : "-translate-x-80"
      } fixed inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100 overflow-hidden`}
    >
      {/* 🏷️ Fixed Header with Brand and Logo */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-inherit py-6 px-6 border-b border-gray-300/20">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/img/Logo.jpeg"
            alt="logo"
            className="h-10 w-10 object-contain rounded-full shadow-md"
          />
          <Typography
            variant="h6"
            color={sidenavType === "dark" ? "white" : "blue-gray"}
            className="font-bold tracking-wide"
          >
            {brandName}
          </Typography>
        </Link>
        <IconButton
          variant="text"
          color={sidenavType === "dark" ? "white" : "blue-gray"}
          size="sm"
          ripple={false}
          className="xl:hidden"
          onClick={() => setOpenSidenav(dispatch, false)}
        >
          <XMarkIcon strokeWidth={2.5} className="h-5 w-5" />
        </IconButton>
      </div>

      {/* 🧭 Scrollable Navigation */}
      <div className="h-[calc(100vh-140px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400/40 scrollbar-track-transparent hover:scrollbar-thumb-gray-500/50 px-4 pb-6">
        {routes
          .filter((routeGroup) => routeGroup.layout !== "auth")
          .map(({ layout, title, pages }, key) => (
            <ul key={key} className="mb-4 flex flex-col gap-1">
              {title && (
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

              {/* Loop all pages */}
              {pages.map(({ icon, name, path, subRoutes }) => (
                <li key={name}>
                  {/* Dropdown parent (like Product) */}
                  {subRoutes ? (
                    <>
                      <Button
                        variant="text"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="flex items-center justify-between gap-4 px-4 capitalize hover:bg-gray-100/10"
                        fullWidth
                        onClick={() => toggleDropdown(name)}
                      >
                        <div className="flex items-center gap-4">
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </div>
                        {openDropdown === name ? (
                          <ChevronDownIcon className="w-4 h-4" />
                        ) : (
                          <ChevronRightIcon className="w-4 h-4" />
                        )}
                      </Button>

                      {/* Sub routes */}
                      <Collapse open={openDropdown === name}>
                        <ul className="ml-8 mt-2 flex flex-col gap-1 border-l border-gray-300/40 pl-3">
                          {subRoutes.map((sub) => (
                            <li key={sub.name}>
                              <NavLink to={`/${layout}/${sub.path}`}>
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
                                    className="flex items-center gap-3 px-4 text-sm capitalize hover:bg-gray-100/10"
                                    fullWidth
                                    onClick={handleCloseOnMobile}
                                  >
                                    {sub.icon && (
                                      <span className="text-sm">{sub.icon}</span>
                                    )}
                                    <Typography
                                      color="inherit"
                                      className="font-medium capitalize"
                                    >
                                      {sub.name}
                                    </Typography>
                                  </Button>
                                )}
                              </NavLink>
                            </li>
                          ))}
                        </ul>
                      </Collapse>
                    </>
                  ) : (
                    // Normal single page route
                    <NavLink to={`/${layout}/${path}`}>
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
                          className="flex items-center gap-4 px-4 capitalize hover:bg-gray-100/10"
                          fullWidth
                          onClick={handleCloseOnMobile}
                        >
                          {icon}
                          <Typography
                            color="inherit"
                            className="font-medium capitalize"
                          >
                            {name}
                          </Typography>
                        </Button>
                      )}
                    </NavLink>
                  )}
                </li>
              ))}
            </ul>
          ))}
      </div>
    </aside>
  );
}

Sidenav.defaultProps = {
  brandImg: "/img/Logo.jpeg",
  brandName: "Vallalar Natural's Admin",
};

Sidenav.propTypes = {
  brandImg: PropTypes.string,
  brandName: PropTypes.string,
  routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/Sidenav.jsx";

export default Sidenav;
