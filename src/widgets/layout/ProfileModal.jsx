import React from "react";
import { Card, CardBody, Button, Typography } from "@material-tailwind/react";
import { useAuth } from "@/context/AuthContext";

export default function ProfileModal({ open, handleClose }) {
  const { authData } = useAuth();
  const admin = authData?.admin;

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <Card className="w-full max-w-md">
        <CardBody className="space-y-4">
          <Typography variant="h5" className="text-center font-bold">
            Profile Details
          </Typography>

          {admin ? (
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {admin.full_name || "-"}
              </p>
              <p>
                <strong>Email:</strong> {admin.email || "-"}
              </p>
              <p>
                <strong>Phone:</strong> {admin.phone || "-"}
              </p>
              <p>
                <strong>Role:</strong> {admin.role || "-"}
              </p>
            </div>
          ) : (
            <Typography variant="small" color="red">
              No admin data found.
            </Typography>
          )}

          <div className="flex justify-center mt-4">
            <Button
              variant="outlined"
              color="blue-gray"
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
