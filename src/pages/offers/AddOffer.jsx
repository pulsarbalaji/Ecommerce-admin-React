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
import { useNavigate } from "react-router-dom";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function AddOffer({ open, handleOpenClose, refresh }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category: "",
    product: "",
    offer_name: "",
    offer_percentage: "",
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const resetForm = () => {
    setForm({
      category: "",
      product: "",
      offer_name: "",
      offer_percentage: "",
      is_active: true,
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
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("categories/");
        setCategories(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products when category changes
  useEffect(() => {
    if (!form.category) return;
    const fetchProducts = async () => {
      try {
        const res = await api.get(`offers/category/${form.category}/`);
        setProducts(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching products:", err);
      }
    };
    fetchProducts();
  }, [form.category]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.category) return toast.error("Category is required");
    if (!form.product) return toast.error("Product is required");
    if (!form.offer_name) return toast.error("Offer name is required");
    if (!form.offer_percentage) return toast.error("Offer percentage is required");
    if (isNaN(form.offer_percentage)) return toast.error("Offer percentage must be a number");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await api.post("offers/", form);
      toast.success("Offer added successfully!");
      handleOpenClose(false);
      refresh?.();
      setForm({
        category: "",
        product: "",
        offer_name: "",
        offer_percentage: "",
        is_active: true,
      });
    } catch (err) {
      console.error("Error adding offer:", err);
      toast.error(err.response?.data?.detail || "Failed to add offer");
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
          <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
            {/* Category */}
            <div>
              <Select
                label="Select Category"
                value={form.category}
                onChange={(val) => handleChange("category", val)}
                required
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Product */}
            <div>
              <Select
                label="Select Product"
                value={form.product}
                onChange={(val) => handleChange("product", val)}
                required
                disabled={!form.category}
              >
                {products.map((prod) => (
                  <Option key={prod.id} value={prod.id}>
                    {prod.product_name}
                  </Option>
                ))}
              </Select>
            </div>

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
              value={form.offer_percentage}
              onChange={(e) => handleChange("offer_percentage", e.target.value)}
              required
            />

            {/* Active Switch */}
            <div className="md:col-span-2 flex items-center gap-2">
              <Switch
                id="is_active"
                checked={form.is_active}
                onChange={(e) => handleChange("is_active", e.target.checked)}
              />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                Active
              </label>
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
