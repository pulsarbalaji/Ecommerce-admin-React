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

export default function ViewContact({ open, handleOpenClose, contactId }) {
  const [contact, setContact] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchContact = async () => {
    setLoading(true);
    try {
      const res = await api.get(`contactus/${contactId}/`);
      setContact(res.data.data);
    } catch (err) {
      console.error("Error fetching contact:", err);
      alert("Failed to fetch contact details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (contactId) fetchContact();
  }, [contactId]);

  return (
    <Dialog
      open={open}
      size="md"
      handler={() => handleOpenClose(false)}
      className="overflow-visible"
    >
      <DialogHeader>View Contact Us 👁️</DialogHeader>
      <DialogBody divider>
        {loading ? (
          <div className="flex justify-center items-center gap-2 py-6">
            <Spinner color="blue" className="h-6 w-6" />
            Loading...
          </div>
        ) : contact ? (
          <div className="space-y-3">
            <p>
              <strong>Name:</strong> {contact.name}
            </p>
            <p>
              <strong>Email:</strong> {contact.email}
            </p>
            <p>
              <strong>Phone:</strong> {contact.phone}
            </p>
            <p>
              <strong>Message:</strong> {contact.message}
            </p>
          </div>
        ) : (
          <div className="text-center text-red-600 py-6">
            No contact found.
          </div>
        )}
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
