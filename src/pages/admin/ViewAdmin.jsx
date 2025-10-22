import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  Typography,
  Button,
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";

export default function ViewAdmin({ open, handleOpenClose, userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => handleOpenClose(false); // Close modal

  useEffect(() => {
    if (!open || !userId) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const response = await api.get(`adminsdetails/${userId}/`);
        setUser(response.data.data);
      } catch (err) {
        console.error("Error loading user:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [open, userId]);

  return (
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader  className="flex justify-center">
          <Typography variant="h5" className="font-semibold">
            View User 👁️
          </Typography>
        </DialogHeader>

        <DialogBody>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
              <span className="ml-2 text-blue-gray-400">Loading user...</span>
            </div>
          ) : user ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Full Name:
                </Typography>
                <Typography variant="small">{user.full_name}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Email:
                </Typography>
                <Typography variant="small">{user.email}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Phone:
                </Typography>
                <Typography variant="small">{user.phone}</Typography>
              </div>
              <div>
                <Typography variant="small" color="blue-gray" className="font-semibold">
                  Role:
                </Typography>
                <Typography variant="small">{user.role}</Typography>
              </div>
            </div>
          ) : (
            <Typography color="red" className="text-center py-10">
              User not found.
            </Typography>
          )}
        </DialogBody>

        <DialogFooter className="justify-center">
          <Button color="blue-gray" variant="outlined" onClick={goBack}>
            Close
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
