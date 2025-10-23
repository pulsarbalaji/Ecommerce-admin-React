import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";

export default function ViewCustomer({ open, handleOpenClose, customerId }) {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = async () => {
    setLoading(true);
    try {
      const res = await api.get(`customerslist/${customerId}/`);
      setCustomer(res.data.data);
    } catch (err) {
      console.error("Error fetching customer:", err);
      setError("Failed to load customer details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) fetchCustomer();
  }, [customerId]);

  return (
    <Dialog open={open} size="md" handler={() => handleOpenClose(false)}>
      <DialogHeader>View Customer 👁️</DialogHeader>
      <DialogBody divider>
        {loading ? (
          <div className="flex justify-center items-center gap-2 py-6">
            <Spinner className="h-6 w-6" color="blue" />
            Loading...
          </div>
        ) : error ? (
          <div className="text-red-600 text-center py-6">{error}</div>
        ) : customer ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Full Name:</strong> {customer.full_name}
            </div>
            <div>
              <strong>Address:</strong> {customer.address}
            </div>
            <div>
              <strong>Date of Birth:</strong> {customer.dob}
            </div>
            <div>
              <strong>Gender:</strong> {customer.gender}
            </div>
            {customer.profile_image && (
              <div className="md:col-span-2">
                <strong>Profile Image:</strong>
                <div className="mt-2">
                  <img
                    src={customer.profile_image}
                    alt="Profile"
                    className="w-32 h-32 rounded-md object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </DialogBody>
      <DialogFooter>
        <Button
          variant="outlined"
          color="blue-gray"
          onClick={() => handleOpenClose(false)}
        >
          Back
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
