import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Button,
  Select,
  Option,
  Spinner,
  Typography,
  Input,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function OrderUpdate({ orderId, open, handleOpenClose, refresh }) {
  const id = orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [courierNumber, setCourierNumber] = useState("");

  const statusOptions = [
    { value: "order_confirmed", label: "Order Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
  ];
const getAvailableStatusOptions = () => {
  if (!order) return [];

  const current = {
    value: order.status,
    label:
      order.status === "order_confirmed"
        ? "Order Confirmed"
        : order.status === "shipped"
        ? "Shipped"
        : "Delivered",
    disabled: true,
  };

  let next = [];

  if (order.status === "order_confirmed") {
    next = [{ value: "shipped", label: "Shipped" }];
  } else if (order.status === "shipped") {
    next = [{ value: "delivered", label: "Delivered" }];
  } else if (order.status === "delivered") {
    next = []; // completed
  }

  return [current, ...next];
};


  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`orderdetails/${id}/`);
      const data = res.data.data;

      setOrder(data);

      // ⭐ If courier number exists, fill input field automatically
      if (data.courier_number) {
        setCourierNumber(data.courier_number);
      } else {
        setCourierNumber("");
      }
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order.");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async () => {
    if (!order) return;

    // --- Validation for courier number if shipped ---
    if (order.status === "shipped" && !courierNumber.trim()) {
      toast.error("Courier number is required when status is Shipped");
      return;
    }

    setUpdating(true);
    try {
      const payload = { order_status: order.status };
      if (order.status === "shipped") {
        payload.courier_number = courierNumber;
      }

      await api.put(`order-status/${id}/`, payload);

      toast.success("Order status updated successfully");
      if (refresh) refresh();
      handleOpenClose(false);
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error(
        err.response?.data?.message || "Failed to update status"
      );
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (open && id) fetchOrder();
  }, [open, id]);

  return (
    <Dialog size="md" open={open} handler={handleOpenClose}>
      <DialogHeader className="flex justify-center">
        <Typography variant="h5" className="font-semibold">
          Update Order Status
        </Typography>
      </DialogHeader>

      <DialogBody divider className="overflow-y-auto max-h-[80vh]">
        {loading ? (
          <div className="text-center py-6 flex justify-center items-center gap-2">
            <Spinner color="blue" className="h-6 w-6" /> Loading...
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
            <div className="w-full flex justify-center mt-4">
              <div className="w-64">
            <Select
  label="Order Status"
  value={order.status}
  onChange={(value) => {
    setOrder({ ...order, status: value });
    if (value !== "shipped") setCourierNumber("");
  }}
  menuProps={{
    className: "z-[9999] max-h-36 overflow-y-auto",
    placement: "bottom-start",
  }}
  containerProps={{
    className: "relative z-[9999]",
  }}
>
  {getAvailableStatusOptions().map((s) => (
    <Option key={s.value} value={s.value} disabled={s.disabled}>
      {s.label}
    </Option>
  ))}
</Select>


              </div>
            </div>

            {/* Courier Number Field — show only when shipped */}
            {order.status === "shipped" && (
              <div className="flex justify-center mt-4">
                <div className="w-64">
                  <Input
                    label="Courier Number"
                    value={courierNumber}
                    onChange={(e) => setCourierNumber(e.target.value)}
                    required
                    maxLength="20"
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outlined"
                color="red"
                onClick={() => handleOpenClose(false)}
              >
                Cancel
              </Button>
              <Button
                color="gray"
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
