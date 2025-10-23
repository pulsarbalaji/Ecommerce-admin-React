import React, { useEffect, useState } from "react";
import DataTable from "react-data-table-component";
import {
  IconButton,
  Card,
  Spinner,
  Chip,
} from "@material-tailwind/react";
import { EyeIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import ViewOrder from "./ViewOrder"; // your modal
import OrderUpdate from "./OrderUpdate"; // your modal

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewOrderId, setViewOrderId] = useState(null);

  const [updateOpen, setUpdateOpen] = useState(false);
  const [updateOrderId, setUpdateOrderId] = useState(null);

  // Map status to colors
  const orderStatusColor = {
    pending: "yellow",
    processing: "blue",
    shipped: "blue",
    delivered: "green",
    cancelled: "red",
    returned: "red",
  };

  const paymentStatusColor = {
    pending: "yellow",
    success: "green",
    failed: "red",
    refunded: "blue",
  };

  // Fetch orders with pagination
  const fetchOrders = async (pageNumber = page, pageSize = itemsPerPage) => {
    setLoading(true);
    try {
      const res = await api.get("orderdetails/", {
        params: {
          page: pageNumber,
          page_size: pageSize,
        },
      });
      setOrders(res.data.results || [])      
      setTotalOrders(res.data.count || 0);
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, itemsPerPage]);

  // Actions
  const viewOrder = (order) => {
    setViewOrderId(order.id);
    console.log("id is",order.id);
    
    setViewOpen(true);
  };

  const updateStatus = (order) => {
    setUpdateOrderId(order.id);
    setUpdateOpen(true);
  };

  const columns = [
    {
      name: "Order Number",
      selector: (row) => row.order_number,
      sortable: true,
    },
    {
      name: "Status",
      cell: (row) => (
        <Chip
          color={orderStatusColor[row.status] || "gray"}
          value={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="sm"
        />
      ),
    },
    {
      name: "Payment Status",
      cell: (row) => (
        <Chip
          color={paymentStatusColor[row.payment_status] || "gray"}
          value={row.payment_status.charAt(0).toUpperCase() + row.payment_status.slice(1)}
          size="sm"
        />
      ),
    },
    {
      name: "Total Amount (₹)",
      selector: (row) => row.total_amount,
      sortable: true,
      cell: (row) => <span className="font-medium">₹{row.total_amount}</span>,
    },
    {
      name: "Actions",
      cell: (row) => (
        <div className="flex gap-2">
          <IconButton
            size="sm"
            variant="text"
            color="gray"
            onClick={() => viewOrder(row)}
          >
            <EyeIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            size="sm"
            variant="text"
            color="blue"
            onClick={() => updateStatus(row)}
          >
            <ArrowPathIcon className="h-5 w-5" />
          </IconButton>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-blue-gray-800">Orders List</h3>
      </div>

      <Card className="shadow-lg">
        {loading ? (
          <div className="flex justify-center py-10">
            <Spinner className="h-8 w-8" color="blue" />
            <span className="ml-2 text-blue-gray-400">Loading orders...</span>
          </div>
        ) : (
          <DataTable
            columns={columns}
            data={orders}
            pagination
            paginationServer
            paginationTotalRows={totalOrders}
            paginationDefaultPage={page}
            onChangePage={(p) => setPage(p)}
            onChangeRowsPerPage={(size) => {
              setItemsPerPage(size);
              setPage(1);
            }}
            highlightOnHover
            responsive
            noHeader
          />
        )}
      </Card>

      {/* View Order Modal */}
      {viewOpen && (
        <ViewOrder
          open={viewOpen}
          handleOpenClose={setViewOpen}
          orderId={viewOrderId}
        />
      )}

      {/* Update Status Modal */}
      {updateOpen && (
        <OrderUpdate
          open={updateOpen}
          handleOpenClose={setUpdateOpen}
          orderId={updateOrderId}
          refresh={fetchOrders}
        />
      )}
    </div>
  );
}
