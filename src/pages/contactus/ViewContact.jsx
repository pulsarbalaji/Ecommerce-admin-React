import React, { useEffect, useState } from "react";
import {
  Card,
  CardBody,
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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-lg">
        <CardBody>
          <h2 className="text-xl font-semibold text-center mb-6">
            View Contact Us 👁️
          </h2>

          {loading ? (
            <div className="flex justify-center items-center py-6 gap-2">
              <Spinner color="blue" className="h-6 w-6" />
              Loading...
            </div>
          ) : contact ? (
            <div className="space-y-3">
              <p><strong>Name:</strong> {contact.name}</p>
              <p><strong>Email:</strong> {contact.email}</p>
              <p><strong>Phone:</strong> {contact.phone}</p>
              <p><strong>Message:</strong> {contact.message}</p>
            </div>
          ) : (
            <div className="text-center text-red-600 py-6">
              No contact found.
            </div>
          )}

          <div className="flex justify-center mt-6">
            <Button
              variant="outlined"
              color="blue-gray"
              onClick={() => handleOpenClose(false)}
            >
              Back
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
