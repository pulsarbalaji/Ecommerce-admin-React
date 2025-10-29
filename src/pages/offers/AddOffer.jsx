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

export default function AddOffer({ open, handleOpenClose, refresh }) {
  const [form, setForm] = useState({
    category: "",
    product: "",
    offer_name: "",
    offer_percentage: "",
    start_date: "",
    end_date: "",
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
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

  const resetForm = () => {
    setForm({
      category: "",
      product: "",
      offer_name: "",
      offer_percentage: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setProducts([]);
  };

  useEffect(() => {
    if (!open) {
      resetForm();
      setIsSubmitting(false);
      setIsCancelling(false);
    }
  }, [open]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("categories/");
        setCategories(res.data?.data || []);
      } catch (err) {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // Fetch products by category
  useEffect(() => {
    if (!form.category) {
      setProducts([]);
      setForm((prev) => ({ ...prev, product: "" }));
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await api.get(`offers/category/${form.category}/`);
        const productsData = res.data?.data || [];
        if (!productsData.length) {
          toast.error("No products found for this category.");
          setProducts([]);
          setForm((prev) => ({ ...prev, product: "" }));
        } else {
          setProducts(productsData);
          setForm((prev) => ({ ...prev, product: "" }));
        }
      } catch {
        toast.error("Failed to fetch products");
        setProducts([]);
      }
    };

    fetchProducts();
  }, [form.category]);

  const validateForm = () => {
    if (!form.category) return toast.error("Category is required");
    if (!form.product) return toast.error("Product is required");
    if (!form.offer_name) return toast.error("Offer name is required");
    if (!form.offer_percentage) return toast.error("Offer percentage is required");
    if (isNaN(form.offer_percentage)) return toast.error("Offer percentage must be a number");
    if (!form.start_date) return toast.error("Start date is required");
    if (!form.end_date) return toast.error("End date is required");
    if (new Date(form.start_date) > new Date(form.end_date))
      return toast.error("Start date cannot be after end date");
    if (isDateInFuture(form.start_date) && form.is_active)
      return toast.error("Active offer cannot have a future start date");
    return true;
  };

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
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      let payload = [];

      if (Array.isArray(form.product)) {
        payload = form.product.map((prodId) => ({
          product: prodId,
          category: Number(form.category),
          offer_name: form.offer_name,
          offer_percentage: Number(form.offer_percentage),
          start_date: form.start_date,
          end_date: form.end_date,
        }));
      } else {
        payload = [
          {
            product: Number(form.product),
            category: Number(form.category),
            offer_name: form.offer_name,
            offer_percentage: Number(form.offer_percentage),
            start_date: form.start_date,
            end_date: form.end_date,
          },
        ];
      }

      await api.post("offers/", payload);
      toast.success("Offer(s) added successfully!");
      handleOpenClose(false);
      refresh?.();
      resetForm();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to add offer(s)");
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
            Add Offer 🎁
          </Typography>
        </DialogHeader>

        <DialogBody>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* ✅ Category */}
            <Select
              label="Select Category *"
              selected={
                categories.find((cat) => String(cat.id) === String(form.category))
                  ?.category_name || "Select Category"
              }
              onChange={(val) => {
                setForm((prev) => ({ ...prev, category: val, product: "" }));
              }}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={String(cat.id)}>
                  {cat.category_name}
                </Option>
              ))}
            </Select>
            {/* ✅ Product */}
            <Select
              key={form.category} // re-render when category changes
              label="Select Product *"
              value={
                Array.isArray(form.product)
                  ? "all"
                  : form.product || ""
              }
              onChange={(val) => {
                if (val === "all") {
                  const allIds = products.map((p) => String(p.id));
                  setForm((prev) => ({ ...prev, product: allIds }));
                } else {
                  setForm((prev) => ({ ...prev, product: val }));
                }
              }}
              disabled={!form.category || !products.length}
              selected={(element) => {
                // ✅ Custom label display
                if (Array.isArray(form.product)) {
                  return "All Products";
                }
                const selectedProduct = products.find(
                  (p) => String(p.id) === String(form.product)
                );
                return selectedProduct ? selectedProduct.product_name : element;
              }}
            >
              <Option value="all">Select All Products</Option>
              {products.map((prod) => (
                <Option key={prod.id} value={String(prod.id)}>
                  {prod.product_name}
                </Option>
              ))}
            </Select>



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
              onChange={(e) => handleChange("offer_percentage", e.target.value)}
              required
            />

            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
              min={minStartDate}
            />

            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              required
              min={form.start_date || minStartDate}
            />

            <div className="md:col-span-2 flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <div className="flex items-center gap-2">
                <Switch
                  id="is_active"
                  checked={form.is_active}
                  onChange={(e) =>
                    handleChange("is_active", e.target.checked)
                  }
                  disabled={isDateInFuture(form.start_date)}
                />
                <label
                  htmlFor="is_active"
                  className="text-sm font-medium text-gray-700"
                >
                  Active
                </label>
              </div>

              {isDateInFuture(form.start_date) && (
                <Typography
                  variant="small"
                  color="orange"
                  className="mt-2 sm:mt-0 sm:ml-4 text-xs"
                >
                  ⚠️ This offer starts on{" "}
                  <span className="font-semibold">{form.start_date}</span> and
                  will automatically activate on that date.
                </Typography>
              )}
            </div>
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
            onClick={handleSubmit}
            color="gray"
            disabled={isSubmitting || isCancelling}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Add Offer"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
