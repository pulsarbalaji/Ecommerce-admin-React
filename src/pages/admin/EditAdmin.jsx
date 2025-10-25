import React, { useEffect, useState } from "react";
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
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function EditAdmin({ open, handleOpenClose, userId }) {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({ show: false, text: "", color: "green" });

  const roles = ["Admin"];

  // Fetch user data when modal opens
  useEffect(() => {
    if (!open || !userId) return;
    setIsLoading(true);
    api
      .get(`adminsdetails/${userId}/`)
      .then((res) => setForm(res.data.data))
      .catch(() => showSnackbar("Error loading user.", "red"))
      .finally(() => setIsLoading(false));
  }, [userId, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const showSnackbar = (message, color = "green") => {
    setSnackbar({ show: true, text: message, color });
    setTimeout(() => setSnackbar({ show: false, text: "", color }), 3000);
  };



const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);

  if (!form.full_name || !form.email || !form.role) {
    toast.error("Please fill all required fields.");
    setIsSubmitting(false);
    return;
  }

  try {
    const res = await api.put(`adminsdetails/${userId}/`, form);

    toast.success(res.data?.message || "User updated successfully!");
    setTimeout(() => handleOpenClose(false), 1500);
  } catch (err) {
    console.error("Error updating user:", err);

    // ✅ Extract backend error message
    const errorMessage =
      err.response?.data?.message ||
      err.response?.data?.errors ||
      "Failed to update user.";

    if (typeof errorMessage === "string") {
      toast.error(errorMessage);
    } else if (typeof errorMessage === "object") {
      const firstError = Object.values(errorMessage)[0];
      toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
    } else {
      toast.error("Something went wrong. Please try again.");
    }
  } finally {
    setIsSubmitting(false);
  }
};


  const handleCancel = () => handleOpenClose(false);

  return (
    <>
      <Dialog open={open} handler={handleOpenClose} size="md">
        <Card className="p-6 rounded-2xl shadow-lg">
          <DialogHeader className="flex justify-center font-semibold text-lg">
            Edit User 
          </DialogHeader>
          <DialogBody>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Spinner size="lg" color="blue" />
              </div>
            ) : (
              <form
                id="editUserForm"
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <Input
                  label="Full Name"
                  name="full_name"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  fullWidth
                />
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
                  label="Phone Number"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  fullWidth
                />
                <Select
                  label="Role"
                  name="role"
                  value={form.role}
                  onChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
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
            )}
          </DialogBody>
          <DialogFooter className="flex justify-center gap-4">
            <Button
              variant="outlined"
              color="blue-gray"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="editUserForm"
              color="gray"
              disabled={isSubmitting || isLoading}
              className="flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Updating..." : "Update User"}
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
          {snackbar.text}
        </div>
      )}
    </>
  );
}
