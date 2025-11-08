import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Button,
  Spinner,
  Typography,
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
    if (open && contactId) fetchContact();
  }, [open, contactId]);

  return (
    <Dialog
      open={open}
      size="md"
      handler={() => handleOpenClose(false)}
      className="bg-white p-0 rounded-2xl shadow-lg max-h-[85vh] overflow-hidden"
    >
      {/* Sticky Header */}
      <DialogHeader className="justify-center sticky top-0 bg-white z-10 border-b pb-2">
        <Typography variant="h5" color="blue-gray" className="font-semibold">
          View Contact 👁️
        </Typography>
      </DialogHeader>

      {/* Scrollable Body */}
      <DialogBody className="overflow-y-auto max-h-[65vh] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {loading ? (
          <div className="flex justify-center items-center gap-2 py-6">
            <Spinner color="blue" className="h-6 w-6" />
            Loading...
          </div>
        ) : contact ? (
          <div className="space-y-4 text-gray-800">
            <div>
              <p>
                <strong>Name:</strong> {contact.name || "—"}
              </p>
            </div>
            <div>
              <p>
                <strong>Email:</strong> {contact.email || "—"}
              </p>
            </div>
            <div>
              <p>
                <strong>Phone:</strong> {contact.phone || "—"}
              </p>
            </div>

            {/* 📝 Scrollable Message Section */}
            <div>
              <p className="font-medium mb-2">Message:</p>
              <div
                className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                {contact.message || "No message provided."}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center text-red-600 py-6">No contact found.</div>
        )}
      </DialogBody>

      {/* Sticky Footer */}
      <DialogFooter className="justify-center sticky bottom-0 bg-white py-3 border-t">
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
