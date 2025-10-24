import {
  HomeIcon,
  ServerStackIcon,
  UserGroupIcon,
  Squares2X2Icon,
  ShoppingBagIcon,
  TagIcon,
  ShoppingCartIcon,
  PhoneIcon,
  UsersIcon,
} from "@heroicons/react/24/solid";
import Home from "./pages/dashboard/Home";

import { SignIn } from "@/pages/auth";
import AdminUser from "./pages/admin/Admin";
import Category from "./pages/category/Category";
import Product from "./pages/product/Product";
import Offer from "./pages/offers/Offer";
import Orders from "./pages/orders/Order";
import ContactUs from "./pages/contactus/ContactUs";
import Customers from "./pages/customer/Customer";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

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
        path: "/offer",
        element: <Offer />,
      },
      {
        icon: <ShoppingCartIcon {...icon} />,
        name: "Orders",
        path: "/orders",
        element: <Orders />,
      },
      {
        icon: <UsersIcon {...icon} />,
        name: "Customer Details",
        path: "/customer_details",
        element: <Customers />,
      },
      {
        icon: <PhoneIcon {...icon} />,
        name: "Contact Us Details",
        path: "/contact_us",
        element: <ContactUs />,
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
      name: "forgot password",
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      name: "reset password",
      path: "/reset-password/:uid/:token",
      element: <ResetPassword />,
    },
    ],
  },
];

export default routes;
