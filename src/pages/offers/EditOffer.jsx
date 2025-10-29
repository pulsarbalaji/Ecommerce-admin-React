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
  Switch,
  Button,
  Typography,
  Spinner,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function EditOffer({ open, handleOpenClose, offerId, refresh }) {
  const [form, setForm] = useState({
    offer_name: "",
    offer_percentage: "",
    category: "",
    product: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const formatDate = (date) => new Date(date).toISOString().split("T")[0];
  const today = new Date();
  const minStartDate = formatDate(
    new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
  );

  const isDateInFuture = (date) => {
    if (!date) return false;
    const now = formatDate(new Date());
    return new Date(date) > new Date(now);
  };

  // 🧩 Fetch categories + offer details (no dynamic product/category reload)
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
  category: String(offerData.category), // Keep ID for backend
  product: String(offerData.product),   // Keep ID for backend
  start_date: offerData.start_date || "",
  end_date: offerData.end_date || "",
  is_active: offerData.is_active,
  category_name: offerData.category_name || "", // Add for display
  product_name: offerData.product_name || "",   // Add for display
});

        // Directly load the product name for display (not selectable)
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

  // 🧩 Handle input changes
  const handleChange = (field, value) => {
    if (field === "start_date") {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        is_active: isDateInFuture(value) ? false : prev.is_active,
        end_date:
          prev.end_date && new Date(value) > new Date(prev.end_date)
            ? ""
            : prev.end_date,
      }));
      return;
    }

    if (field === "is_active") {
      if (isDateInFuture(form.start_date)) {
        toast.error("Active offer cannot have a future start date.");
        return;
      }
      setForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // 🧩 Validation
  const validateForm = () => {
    if (!form.offer_name) return toast.error("Offer name is required");
    if (!form.offer_percentage) return toast.error("Offer percentage is required");
    if (isNaN(form.offer_percentage))
      return toast.error("Offer percentage must be a number");
    if (!form.start_date) return toast.error("Start date is required");
    if (!form.end_date) return toast.error("End date is required");
    if (new Date(form.start_date) > new Date(form.end_date))
      return toast.error("Start date cannot be after end date");
    if (isDateInFuture(form.start_date) && form.is_active)
      return toast.error("Active offer cannot have a future start date.");
    return true;
  };

  // 🧩 Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.put(`offers/${offerId}/`, {
        ...form,
        category: Number(form.category),
        product: Number(form.product),
      });
      toast.success("Offer updated successfully!");
      refresh?.();
      handleOpenClose(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || "Error updating offer");
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
              {/* Offer Name */}
              <Input
                label="Offer Name"
                value={form.offer_name}
                onChange={(e) => handleChange("offer_name", e.target.value)}
                required
              />

              {/* Offer Percentage */}
              <Input
                label="Offer Percentage (%)"
                type="number"
                min="1"
                max="99"
                value={form.offer_percentage}
                onChange={(e) => handleChange("offer_percentage", e.target.value)}
                required
              />

              {/* Start Date */}
              <Input
                label="Start Date"
                type="date"
                value={form.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
                min={minStartDate}
              />

              {/* End Date */}
              <Input
                label="End Date"
                type="date"
                value={form.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
                required
                min={form.start_date || minStartDate}
              />

              {/* Category (disabled) */}
              <Select
                label="Category"
                value={form.category_name}
                disabled
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>

              {/* Product (disabled) */}
              <Select
                label="Product"
                value={form.product_name}
                disabled
              >
                {products.map((prod) => (
                  <Option key={prod.id} value={String(prod.id)}>
                    {prod.product_name}
                  </Option>
                ))}
              </Select>

              {/* Active Switch */}
              <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
                <div className="flex items-center gap-2">
                  <Switch
                    id="is_active"
                    checked={form.is_active}
                    onChange={(e) => handleChange("is_active", e.target.checked)}
                    disabled={
                      isDateInFuture(form.start_date) || new Date(form.end_date) < new Date()
                    }
                  />
                  <label
                    htmlFor="is_active"
                    className="text-sm font-medium text-gray-700"
                  >
                    Active
                  </label>
                </div>

                {form.start_date && form.end_date && (
                  <>
                    {isDateInFuture(form.start_date) ? (
                      <Typography
                        variant="small"
                        color="orange"
                        className="mt-2 sm:mt-0 sm:ml-4 text-xs"
                      >
                        ⚠️ This offer starts on{" "}
                        <span className="font-semibold">{form.start_date}</span> and will
                        automatically activate on that date.
                      </Typography>
                    ) : new Date(form.end_date) < new Date() ? (
                      <Typography
                        variant="small"
                        color="red"
                        className="mt-2 sm:mt-0 sm:ml-4 text-xs"
                      >
                        ⚠️ This offer has expired on{" "}
                        <span className="font-semibold">{form.end_date}</span>. You cannot
                        activate it.
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
