import React, { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  Typography,
  Input,
  Button,
  Select,
  Option,
  Snackbar,
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import api from "@/utils/base_url";

export default function AddAdmin({ open, handleOpenClose }) {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, message: "", color: "green" });

  const roles = ["Admin", "Manager", "Staff"];
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showSnackbar = (message, color = "green") => {
    setSnackbar({ show: true, message, color });
    setTimeout(() => setSnackbar({ show: false, message: "", color }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic client-side validation
    if (!form.email || !form.fullName || !form.phone || !form.role) {
      showSnackbar("Please fill all required fields.", "red");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.post("adminsdetails/", {
        email: form.email,
        full_name: form.fullName,
        phone: form.phone,
        role: form.role,
      });

      showSnackbar("User added successfully!", "green");

      // Close dialog after a short delay
      setTimeout(() => {
        handleOpenClose(false);
        navigate("/dashboard/AdminUser");
      }, 1500);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Failed to add user. Please try again.";
      showSnackbar(errorMessage, "red");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      handleOpenClose(false);
      setIsCancelling(false);
    }, 500);
  };

  return (
    <>
      <Dialog open={open} handler={handleOpenClose} size="md">
        <Card className="p-6 rounded-2xl shadow-lg">
          <DialogHeader className="flex justify-center">
            <Typography variant="h5" color="gray" className="font-semibold">
              Add Admin User 👤
            </Typography>
          </DialogHeader>

          <DialogBody>
            <form
              id="addUserForm"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Input
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <Input
                label="Full Name"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                fullWidth
              />
              <Input
                label="Phone Number"
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                fullWidth
              />
              <Select
                label="Select Role"
                name="role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e })}
                required
                fullWidth
              >
                {roles.map((role) => (
                  <Option key={role} value={role}>
                    {role}
                  </Option>
                ))}
              </Select>
            </form>
          </DialogBody>

          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outlined"
              color="blue-gray"
              onClick={handleCancel}
              disabled={isCancelling || isSubmitting}
            >
              {isCancelling ? "Cancelling..." : "Cancel"}
            </Button>
            <Button
              type="submit"
              form="addUserForm"
              color="gray"
              disabled={isSubmitting || isCancelling}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Adding..." : "Add User"}
            </Button>
          </DialogFooter>
        </Card>
      </Dialog>

      {/* Snackbar notification */}
      {snackbar.show && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-md px-4 py-2 text-white shadow-lg ${
            snackbar.color === "green" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {snackbar.message}
        </div>
      )}
    </>
  );
}
