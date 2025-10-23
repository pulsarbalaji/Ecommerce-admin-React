import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Button,
  Select,
  Option,
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";

export default function OrderUpdate({ orderId, open, handleOpenClose, refresh }) {
  const id = orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "processing", label: "Processing" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
    { value: "returned", label: "Returned" },
  ];

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`orderdetails/${id}/`);
      setOrder(res.data.data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!order) return;
    setUpdating(true);
    try {
      await api.put(`order-status/${id}/`, { order_status: order.status });
      alert("Order status updated successfully");
      if (refresh) refresh(); // refresh orders list
      handleOpenClose(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (open && id) fetchOrder();
  }, [open, id]);

  return (
    <Dialog size="md" open={open} handler={handleOpenClose}>
      <DialogHeader>Update Order Status 🔄</DialogHeader>
      <DialogBody divider>
        {loading ? (
          <div className="text-center py-6 flex justify-center items-center gap-2">
            <Spinner color="blue" className="h-6 w-6" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-600">{error}</div>
        ) : order ? (
          <div className="space-y-4">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Order Number:</strong> {order.order_number}
              </div>
              <div>
                <strong>Customer:</strong> {order.customer_name}
              </div>
              <div>
                <strong>Payment Method:</strong> {order.payment_method}
              </div>
              <div>
                <strong>Payment Status:</strong> {order.payment_status}
              </div>
              <div>
                <strong>Total:</strong> ₹{order.total_amount}
              </div>
            </div>

            {/* Status Select */}
            <Select
              label="Order Status"
              value={order.status}
              onChange={(value) => setOrder({ ...order, status: value })}
            >
              {statusOptions.map((s) => (
                <Option key={s.value} value={s.value}>
                  {s.label}
                </Option>
              ))}
            </Select>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              <Button
                variant="outlined"
                color="blue-gray"
                onClick={() => handleOpenClose(false)}
              >
                Cancel
              </Button>
              <Button
                color="blue"
                onClick={updateStatus}
                disabled={updating}
                loading={updating}
              >
                Update Status
              </Button>
            </div>
          </div>
        ) : null}
      </DialogBody>
    </Dialog>
  );
}
