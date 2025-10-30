import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  Input,
  Select,
  Option,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function EditOffer({ open, handleOpenClose, offerId, refresh }) {
  const { authData } = useAuth();
  const admin = authData?.admin;
  const [form, setForm] = useState({
    offer_name: "",
    offer_percentage: "",
    category: "",
    product: "",
    start_date: "",
    end_date: "",
    category_name: "",
    product_name: "",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];
  const today = formatDate(new Date());

  const isDateInFuture = (date) => {
    if (!date) return false;
    return new Date(date) > new Date(today);
  };

  // --- Fetch categories and offer details
  useEffect(() => {
    if (!open || !offerId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesRes, offerRes] = await Promise.all([
          api.get("categories/"),
          api.get(`offers/${offerId}/`),
        ]);

        setCategories(categoriesRes.data?.data || []);
        const offerData = offerRes.data?.data;

        setForm({
          offer_name: offerData.offer_name || "",
          offer_percentage: offerData.offer_percentage || "",
          category: String(offerData.category) || "",
          product: String(offerData.product) || "",
          start_date: offerData.start_date || "",
          end_date: offerData.end_date || "",
          category_name: offerData.category_name || "",
          product_name: offerData.product_name || "",
        });

        // For display
        const productName = offerData.product_name || "Unknown Product";
        setProducts([{ id: offerData.product, product_name: productName }]);
      } catch (err) {
        console.error(err);
        toast.error("Error loading offer details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, offerId]);

  // --- Handle input changes
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "start_date" &&
        prev.end_date &&
        new Date(value) > new Date(prev.end_date)
        ? { end_date: "" }
        : {}),
    }));
  };

  // --- Validation
  const validateForm = () => {
    if (!form.offer_name) return toast.error("Offer name is required");
    if (!form.offer_percentage) return toast.error("Offer percentage is required");
    if (isNaN(form.offer_percentage))
      return toast.error("Offer percentage must be a number");
    if (!form.start_date) return toast.error("Start date is required");
    if (!form.end_date) return toast.error("End date is required");
    if (new Date(form.start_date) > new Date(form.end_date))
      return toast.error("Start date cannot be after end date");
    return true;
  };

  // --- Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const startDate = formatDate(form.start_date);
      const isActive = startDate === today; // ✅ Auto active if start_date = today

      await api.put(`offers/${offerId}/`, {
        ...form,
        category: Number(form.category),
        product: Number(form.product),
        is_active: isActive,
        updated_by: admin.user_id
      });

      toast.success(
        `Offer updated successfully! ${isActive
          ? "It’s now active 🎉"
          : "It will activate automatically on the start date ⏰"
        }`
      );

      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Error updating offer");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Cancel
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
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Edit Offer
          </Typography>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : (
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
              onSubmit={handleSubmit}
            >
              <Input
                label="Offer Name"
                value={form.offer_name}
                onChange={(e) => handleChange("offer_name", e.target.value)}
                required
              />

              <Input
                label="Offer Percentage (%)"
                type="number"
                min="1"
                max="99"
                value={form.offer_percentage}
                onChange={(e) => {
                  const val = e.target.value;
                  if (/^\d{0,2}$/.test(val)) {
                    handleChange("offer_percentage", val);
                  }
                }}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-", "."].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                required
              />

              <Input
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
                min={today}
              />

              <Input
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
                min={form.start_date || today}
              />

              <Select label="Category" value={form.category_name} disabled>
                {categories.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>

              <Select label="Product" value={form.product_name} disabled>
                {products.map((prod) => (
                  <Option key={prod.id} value={String(prod.id)}>
                    {prod.product_name}
                  </Option>
                ))}
              </Select>

              <div className="md:col-span-2 flex flex-col sm:flex-row justify-center sm:gap-2">
                {form.start_date && form.end_date && (
                  <>
                    {isDateInFuture(form.start_date) ? (
                      <Typography
                        variant="small"
                        color="green"
                        className="mt-2 sm:mt-0 sm:ml-4 text-xs"
                      >
                        ⚠️ This offer starts on{" "}
                        <span className="font-semibold">{form.start_date}</span> and
                        will automatically activate on that date.
                      </Typography>
                    ) : new Date(form.end_date) < new Date() ? (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-2 sm:mt-0 sm:ml-4 text-xs"
                      >
                        ⚠️ This offer has expired on{" "}
                        <span className="font-semibold">{form.end_date}</span>.
                      </Typography>
                    ) : null}
                  </>
                )}
              </div>
            </form>
          )}
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
            onClick={handleSubmit}
            color="gray"
            disabled={isSubmitting || isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Offer"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
