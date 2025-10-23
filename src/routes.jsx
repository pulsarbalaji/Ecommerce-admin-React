import {
  HomeIcon,
  UserCircleIcon,
  TableCellsIcon,
  InformationCircleIcon,
  ServerStackIcon,
  RectangleStackIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  TagIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";
import AdminUser from "./pages/admin/Admin";
import Category from "./pages/category/Category";
import Product from "./pages/product/Product";

const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      {
        icon: <UserGroupIcon  {...icon} />,
        name: "admin",
        path: "/AdminUser",
        element: <AdminUser />,
      },
      {
        icon: <Squares2X2Icon  {...icon} />,
        name: "category",
        path: "/category",
        element: <Category />,
      },
      {
        icon: <ShoppingBagIcon  {...icon} />,
        name: "Product",
        path: "/product",
        element: <Product />,
      },
      {
        icon: <TagIcon {...icon} />,
        name: "Offers",
        path: "/product",
        element: <Product />,
      },
      {
        icon: <UserCircleIcon {...icon} />,
        name: "profile",
        path: "/profile",
        element: <Profile />,
      },
      {
        icon: <TableCellsIcon {...icon} />,
        name: "tables",
        path: "/tables",
        element: <Tables />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "notifications",
        path: "/notifications",
        element: <Notifications />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
    ],
  },
];

export default routes;
