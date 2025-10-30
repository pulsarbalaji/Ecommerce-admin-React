import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogBody,
  DialogHeader,
  Button,
  Spinner,
  Chip,
  Typography,
} from "@material-tailwind/react";
import api from "@/utils/base_url";

export default function ViewOrder({ orderId, open, handleOpenClose }) {
  const id = orderId;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const orderStatusColor = {
    pending: "amber",
    order_confirmed: "blue",
    shipped: "blue",
    delivered: "green",
    cancelled: "red",
    returned: "yellow",
  };
  const formatStatus = (status) => {
    if (!status) return "";

    return status
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };


  const paymentStatusColor = {
    pending: "amber",
    success: "green",
    failed: "red",
    refunded: "blue",
  };

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const res = await api.get(`orderdetails/${id}/`);
      setOrder(res.data.data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError("Failed to load order details.");
    } finally {
      setLoading(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;
    setDownloading(true);
    try {
      const res = await api.get(`orderspdf/${order.id}/`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Invoice_${order.order_number}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to download invoice:", err);
      alert("Failed to download invoice. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const subtotal = useMemo(() => {
    return order
      ? order.items.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      )
      : 0;
  }, [order]);

  const totalTax = useMemo(() => {
    return order
      ? order.items.reduce(
        (sum, item) => sum + parseFloat(item.tax) * item.quantity,
        0
      )
      : 0;
  }, [order]);

  const shippingCharge = useMemo(
    () => (order ? parseFloat(order.shipping_cost) : 0),
    [order]
  );

  const totalAmount = useMemo(
    () => (order ? parseFloat(order.total_amount) : 0),
    [order]
  );

  useEffect(() => {
    if (open && id) fetchOrder();
  }, [open, id]);

  return (
    <Dialog
      size="xl"
      open={open}
      handler={handleOpenClose}
      className="bg-white p-0"
    >
      <DialogHeader className="justify-center">
        <Typography variant="h5" color="blue-gray" className="font-semibold">
          View Product 👁️
        </Typography>
      </DialogHeader>
      <DialogBody divider>
        {loading ? (
          <div className="text-center py-6 flex justify-center items-center gap-2">
            <Spinner color="blue" className="h-6 w-6" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-600">{error}</div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Order Number:</strong> {order.order_number}
              </div>
              <div className="flex items-center gap-2">
                <strong>Order Status:</strong>
                <Chip
                  color={orderStatusColor[order.status]}
                  value={formatStatus(order.status)}
                  size="sm"
                  className="font-medium"
                />

              </div>

              <div>
                <strong>Payment Method:</strong> {order.payment_method.toUpperCase()}
              </div>
              <div className="flex items-center gap-2">
                <strong>Payment Status:</strong>
                <Chip
                  color={paymentStatusColor[order.payment_status]}
                  value={order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  size="sm"
                  className="font-medium"
                />
              </div>
              <div>
                <strong>Customer Name:</strong> {order.customer_name}
              </div>
              <div>
                <strong>Ordered At:</strong> {new Date(order.ordered_at).toLocaleString()}
              </div>
              <div>
                <strong>Preferred Courier:</strong> {order.preferred_courier_service}
              </div>
              <div>
                <strong>Delivered At:</strong>{" "}
                {order.delivered_at
                  ? new Date(order.delivered_at).toLocaleString()
                  : "-"}
              </div>
            </div>

            {/* Shipping & Billing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <strong>Shipping Address:</strong> {order.shipping_address}
              </div>
              <div>
                <strong>Billing Address:</strong> {order.billing_address}
              </div>
            </div>

            {/* Items Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 border">Product Name</th>
                    <th className="px-4 py-2 border">Quantity</th>
                    <th className="px-4 py-2 border">Price</th>
                    <th className="px-4 py-2 border">Tax</th>
                    <th className="px-4 py-2 border">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.product}>
                      <td className="px-4 py-2 border">{item.product_name}</td>
                      <td className="px-4 py-2 border">{item.quantity}</td>
                      <td className="px-4 py-2 border">₹{item.price}</td>
                      <td className="px-4 py-2 border">₹{item.tax}</td>
                      <td className="px-4 py-2 border">₹{item.total}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <th colSpan="4" className="px-4 py-2 text-right border">
                      Subtotal:
                    </th>
                    <th className="px-4 py-2 border">₹{subtotal.toFixed(2)}</th>
                  </tr>
                  <tr>
                    <th colSpan="4" className="px-4 py-2 text-right border">
                      Tax:
                    </th>
                    <th className="px-4 py-2 border">₹{totalTax.toFixed(2)}</th>
                  </tr>
                  <tr>
                    <th colSpan="4" className="px-4 py-2 text-right border">
                      Shipping:
                    </th>
                    <th className="px-4 py-2 border">₹{shippingCharge.toFixed(2)}</th>
                  </tr>
                  <tr>
                    <th colSpan="4" className="px-4 py-2 text-right border">
                      Total Amount:
                    </th>
                    <th className="px-4 py-2 border">₹{totalAmount.toFixed(2)}</th>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Buttons */}
            <div className="flex justify-center gap-4 mt-6">
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => handleOpenClose(false)}
              >
                Close
              </Button>
              <Button
                color="gray"
                onClick={downloadInvoice}
                disabled={downloading}
              >
                {downloading ? "Downloading..." : "Download Invoice"}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogBody>
    </Dialog>
  );
}
