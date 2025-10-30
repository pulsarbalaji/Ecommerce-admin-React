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
} from "@material-tailwind/react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "@/utils/base_url";

export default function AddAdmin({ open, handleOpenClose ,refresh}) {
  const [form, setForm] = useState({
    email: "",
    fullName: "",
    phone: "",
    role: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const navigate = useNavigate();

  const roles = ["Admin"];
  const resetForm = () => {
    setForm({
      email: "",
      fullName: "",
      phone: "",
      role: "Admin",
    });
  };

  // Automatically reset when modal closes
  useEffect(() => {
    if (!open) {
      resetForm();
      setIsSubmitting(false);
      setIsCancelling(false);
    }
  }, [open]);
  // ✅ Validate email format
  const isValidEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // ✅ Allow only numbers & max 10 digits
  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // remove non-digits
    if (value.length <= 10) {
      setForm((prev) => ({ ...prev, phone: value }));
    }
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ✅ Client-side validation
    if (!form.email || !form.fullName || !form.phone) {
      toast.error("Please fill all required fields.");
      setIsSubmitting(false);
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (form.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
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

      if (response.status === 201 || response.status === 200) {
        toast.success("Admin added successfully. Password setup email sent");
        setTimeout(() => {
          handleOpenClose(false);
          refresh?.();
        }, 1000);
      } else {
        toast.error("Unexpected server response. Please try again.");
      }
    } catch (err) {
      console.error("AddAdmin Error:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to add user. Please try again.";
      toast.error(errorMessage);
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
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="flex justify-center">
          <Typography variant="h5" color="gray" className="font-semibold">
            Add Admin User 
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
            />
            <Input
              label="Full Name"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handlePhoneChange}
              required
            />
            <Select
              label="Select Role"
              name="role"
              value={form.role}
              onChange={(val) => setForm({ ...form, role: val })}
              required
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
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
