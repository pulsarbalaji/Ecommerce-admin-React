import React, { useEffect, useState } from "react";
import api from "@/utils/base_url";
import {
  Card,
  CardHeader,
  CardBody,
  Typography,
  Progress,
} from "@material-tailwind/react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import {
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  UsersIcon,
  ShoppingBagIcon,
  CurrencyRupeeIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from "@heroicons/react/24/solid";

const currencyFormatter = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(value)
  );

const formatStatus = (status) => {
  if (!status) return "";

  return status
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
const statusColor = (status) => {
  switch (status) {
    case "pending":
      return "text-yellow-600";
    case "order_confirmed":
      return "text-blue-600";
    case "shipped":
      return "text-purple-600";
    case "delivered":
      return "text-green-600";
    case "cancelled":
      return "text-red-600";
    case "returned":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

const statIcons = {
  total_sales: <CurrencyRupeeIcon className="w-6 h-6 text-white" />,
  total_orders: <ShoppingBagIcon className="w-6 h-6 text-white" />,
  total_customers: <UsersIcon className="w-6 h-6 text-white" />,
  total_products: <ShoppingBagIcon className="w-6 h-6 text-white" />,
  pending_orders: <ClockIcon className="w-6 h-6 text-white" />,
  cancelled_orders: <XCircleIcon className="w-6 h-6 text-white" />,
};

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get("/Dashboard/");
        if (res.data.status) setData(res.data.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 grid gap-6">
        <Skeleton height={50} count={6} />
      </div>
    );
  }

  const {
    stats,
    sales_chart,
    top_products,
    recent_orders,
    low_stock_products,
    new_customers,
  } = data;

  return (
    <div className="mt-12 space-y-10">
      {/* --- Stats Cards --- */}
      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-6">
        {Object.entries(stats).map(([key, value]) => {
          // Simple trend arrow logic
          const trendUp = Math.random() > 0.5;
          return (
            <Card
              key={key}
              className="p-4 flex items-center gap-4 shadow-sm border"
            >
              <div className="bg-blue-500 rounded-full w-10 h-10 flex items-center justify-center">
                {statIcons[key]}
              </div>

              <div className="flex-1">
                <Typography className="text-gray-500 capitalize text-sm">
                  {key.replace(/_/g, " ")}
                </Typography>
                <div className="flex items-center gap-2">
                  <Typography variant="h5" className="font-bold mt-1">
                    {key.includes("sales") ? currencyFormatter(value) : value}
                  </Typography>
                  {trendUp ? (
                    <ArrowUpIcon className="w-4 h-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="w-4 h-4 text-red-500" />
                  )}
                </div>
                {key === "pending_orders" && (
                  <Progress
                    value={(stats.pending_orders / stats.total_orders) * 100}
                    className="mt-2 h-2"
                    color="blue"
                  />
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* --- Sales Chart --- */}
      <Card className="p-6 border shadow-sm">
        <Typography variant="h6" className="mb-4">
          Sales (Last 7 Days)
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sales_chart}
           margin={{ top: 10, right: 20, left: 40, bottom: 10 }}>
            <XAxis dataKey="date" />
            <YAxis
              tickFormatter={(value) => currencyFormatter(value)}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? currencyFormatter(value) : value
              }
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#16a34a"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* --- Top Products --- */}
      <Card className="p-6 border shadow-sm">
        <Typography variant="h6" className="mb-4">
          Top Products
        </Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={top_products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_name" />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? currencyFormatter(value) : value
              }
            />
            <Legend />
            <Bar dataKey="total_sold" fill="#3b82f6" name="Sold Qty" />
            <Bar dataKey="total_revenue" fill="#16a34a" name="Revenue" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* --- Recent Orders Table --- */}
      <Card className="border shadow-sm">
        <CardHeader floated={false} shadow={false} className="px-6 py-4">
          <Typography variant="h6">Recent Orders</Typography>
        </CardHeader>
        <CardBody className="overflow-x-auto">
          <table className="w-full table-auto text-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                {[
                  "Order No",
                  "Customer",
                  "Email",
                  "Amount",
                  "Status",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2 font-medium text-gray-600"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent_orders.map((o) => (
                <tr key={o.order_number} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{o.order_number}</td>
                  <td className="px-4 py-2">{o.customer_name}</td>
                  <td className="px-4 py-2">{o.customer_email}</td>
                  <td className="px-4 py-2">
                    {currencyFormatter(o.total_amount)}
                  </td>
                  <td className={`px-4 py-2 font-medium ${statusColor(o.order_status)}`}>
                    {formatStatus(o.order_status)}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(o.ordered_at).toLocaleString()}
                  </td>

                  <td className="px-4 py-2">
                    {new Date(o.ordered_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>

      {/* --- Low Stock & New Customers --- */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* Low Stock Products */}
        <Card className="p-6 border shadow-sm bg-gradient-to-br from-red-50 to-red-100">
          <Typography variant="h6" className="mb-4 font-semibold text-red-700">
            Low Stock Products
          </Typography>
          <ul className="space-y-3">
            {low_stock_products.length ? low_stock_products.map((p) => {
              let badgeColor = "bg-green-200 text-green-800";
              if (p.stock_quantity <= 2) badgeColor = "bg-red-500 text-white";
              else if (p.stock_quantity <= 5) badgeColor = "bg-orange-300 text-orange-900";

              return (
                <li key={p.id} className="flex justify-between items-center">
                  <div>
                    <Typography variant="small" className="font-semibold text-gray-700">
                      {p.product_name}
                    </Typography>
                    <Typography variant="tiny" className="text-gray-500">
                      {p.category_name}
                    </Typography>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${badgeColor}`}>
                    {p.stock_quantity} left
                  </span>
                </li>
              );
            }) : (
              <Typography variant="small" className="text-gray-500">
                All products sufficiently stocked.
              </Typography>
            )}
          </ul>
        </Card>

        {/* New Customers */}
        <Card className="p-6 border shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <Typography variant="h6" className="mb-4 font-semibold text-blue-700">
            New Customers (Last 7 Days)
          </Typography>
          <ul className="space-y-3">
            {new_customers.length ? new_customers.map((c) => {
              // Generate initials
              const initials = c.full_name.split(" ").map(n => n[0]).join("").toUpperCase();
              return (
                <li key={c.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-400 text-white flex items-center justify-center font-bold">
                      {initials}
                    </div>
                    <div>
                      <Typography variant="small" className="font-medium text-gray-700">
                        {c.full_name}
                      </Typography>
                      <Typography variant="tiny" className="text-gray-500">
                        {c.email}
                      </Typography>
                    </div>
                  </div>
                  <Typography variant="tiny" className="text-gray-400">
                    {new Date(c.created_at).toLocaleDateString()}
                  </Typography>
                </li>
              );
            }) : (
              <Typography variant="small" className="text-gray-500">
                No new signups this week.
              </Typography>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
