import React, { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  Navbar,
  Typography,
  IconButton,
  Breadcrumbs,
  Menu,
  MenuHandler,
  MenuList,
  MenuItem,
  Avatar,
} from "@material-tailwind/react";
import {
  BellIcon,
  Bars3Icon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import api from "@/utils/base_url";
import ProfileModal from "./ProfileModal";

export function DashboardNavbar() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { openSidenav } = controller;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [layout, page] = pathname.split("/").filter((el) => el !== "");

  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = sessionStorage.getItem("refresh");
      if (refreshToken) await api.post("/logout/", { refresh: refreshToken });

      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "/auth/sign-in";
    } catch (err) {
      console.error("Logout failed:", err);
      window.location.href = "/auth/sign-in";
    }
  };

  return (
    <>
      <Navbar
        color="white"
        className="sticky top-4 z-40 py-3 px-4 rounded-xl shadow-md shadow-blue-gray-100 w-full"
        blurred
      >
        {/* ✅ Responsive flex container */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-3 md:gap-6">
          {/* Left Section (Breadcrumbs + Title) */}
          <div className="w-full md:w-auto">
            <Breadcrumbs className="bg-transparent p-0 text-sm">
              <Link to={`/${layout}`}>
                <Typography
                  variant="small"
                  color="blue-gray"
                  className="font-normal opacity-50 hover:text-blue-500 hover:opacity-100 transition-all"
                >
                  {layout}
                </Typography>
              </Link>
              <Typography
                variant="small"
                color="blue-gray"
                className="font-normal truncate"
              >
                {page}
              </Typography>
            </Breadcrumbs>

            <Typography
              variant="h6"
              color="blue-gray"
              className="capitalize truncate mt-1"
            >
              {page}
            </Typography>
          </div>

          {/* Right Section (Icons + Menu) */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle (Mobile Only) */}
            <IconButton
              variant="text"
              color="blue-gray"
              className="grid md:hidden"
              onClick={() => setOpenSidenav(dispatch, !openSidenav)}
            >
              <Bars3Icon strokeWidth={3} className="h-6 w-6 text-blue-gray-500" />
            </IconButton>

            {/* Notifications */}
            {/* <IconButton variant="text" color="blue-gray" className="hidden sm:grid">
              <BellIcon className="h-5 w-5 text-blue-gray-500" />
            </IconButton> */}

            {/* Profile Menu */}
            <Menu placement="bottom-end">
              <MenuHandler>
                <Avatar
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                  size="sm"
                  className="cursor-pointer border border-blue-gray-100"
                />
              </MenuHandler>
              <MenuList className="w-max border-0 shadow-lg p-1">
                <MenuItem
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2"
                >
                  <UserCircleIcon className="h-5 w-5 text-blue-gray-500" />
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="font-normal"
                  >
                    Profile
                  </Typography>
                </MenuItem>

                <MenuItem
                  onClick={handleLogout}
                  className="flex items-center gap-2 hover:bg-red-50"
                >
                  <ArrowRightOnRectangleIcon className="h-5 w-5 text-red-500" />
                  <Typography
                    variant="small"
                    color="red"
                    className="font-normal"
                  >
                    Logout
                  </Typography>
                </MenuItem>
              </MenuList>
            </Menu>
          </div>
        </div>
      </Navbar>

      {/* Profile Modal */}
      <ProfileModal open={profileOpen} handleClose={() => setProfileOpen(false)} />
    </>
  );
}

export default DashboardNavbar;
