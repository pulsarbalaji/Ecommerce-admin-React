import React, { useEffect, useState } from "react";
import api from "@/utils/base_url";
import {
  Card, CardHeader, CardBody,
  Typography, Avatar, Progress,
} from "@material-tailwind/react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, Legend,
} from "recharts";
import Skeleton from "react-loading-skeleton";
import { CheckCircleIcon, ClockIcon } from "@heroicons/react/24/solid";

const Home = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
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
        {Object.entries(stats).map(([key, value]) => (
          <Card key={key} className="p-4 text-center border shadow-sm">
            <Typography className="text-gray-500 capitalize text-sm">
              {key.replace(/_/g, " ")}
            </Typography>
            <Typography variant="h5" className="font-bold mt-1">
              {value}
            </Typography>
          </Card>
        ))}
      </div>

      {/* --- Sales Chart --- */}
      <Card className="p-6 border shadow-sm">
        <Typography variant="h6" className="mb-4">Sales (Last 7 Days)</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={sales_chart}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="sales" stroke="#16a34a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* --- Top Products --- */}
      <Card className="p-6 border shadow-sm">
        <Typography variant="h6" className="mb-4">Top Products</Typography>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={top_products}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product_name" />
            <YAxis />
            <Tooltip />
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
                {["Order No", "Customer", "Email", "Amount", "Status", "Date"].map(h => (
                  <th key={h} className="px-4 py-2 font-medium text-gray-600">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recent_orders.map(o => (
                <tr key={o.order_number} className="hover:bg-gray-50">
                  <td className="px-4 py-2">{o.order_number}</td>
                  <td className="px-4 py-2">{o.customer_name}</td>
                  <td className="px-4 py-2">{o.customer_email}</td>
                  <td className="px-4 py-2">₹{o.total_amount}</td>
                  <td className="px-4 py-2 capitalize">
                    {o.order_status === "success" ? (
                      <span className="text-green-600 font-medium">Success</span>
                    ) : o.order_status === "pending" ? (
                      <span className="text-yellow-600 font-medium">Pending</span>
                    ) : (
                      <span className="text-red-600 font-medium">Cancelled</span>
                    )}
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
        <Card className="p-6 border shadow-sm">
          <Typography variant="h6" className="mb-3">Low Stock Products</Typography>
          <ul className="space-y-2 text-sm">
            {low_stock_products.length ? (
              low_stock_products.map(p => (
                <li key={p.id}>
                  <span className="font-medium">{p.product_name}</span> — {p.stock_quantity} left
                </li>
              ))
            ) : (
              <Typography color="gray">All products sufficiently stocked.</Typography>
            )}
          </ul>
        </Card>

        <Card className="p-6 border shadow-sm">
          <Typography variant="h6" className="mb-3">New Customers</Typography>
          <ul className="space-y-2 text-sm">
            {new_customers.length ? (
              new_customers.map(c => (
                <li key={c.id}>
                  <span className="font-medium">{c.full_name}</span> ({c.email})
                </li>
              ))
            ) : (
              <Typography color="gray">No new signups this week.</Typography>
            )}
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Home;
