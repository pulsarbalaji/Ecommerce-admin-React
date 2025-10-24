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
    is_active: true,
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch categories & offer data
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
          offer_name: offerData.offer_name,
          offer_percentage: offerData.offer_percentage,
          category: offerData.category,
          product: offerData.product,
          is_active: offerData.is_active,
        });

        // Fetch products for offer’s category
        if (offerData.category) {
          const prodRes = await api.get(`offers/category/${offerData.category}/`);
          setProducts(prodRes.data?.data || []);
        }
      } catch (err) {
        toast.error("Error loading offer details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, offerId]);

  // Handle category change to fetch products
  const handleCategoryChange = async (val) => {
    setForm((prev) => ({ ...prev, category: val, product: "" }));
    if (!val) return;
    try {
      const res = await api.get(`offers/category/${val}/`);
      setProducts(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!form.offer_name) return toast.error("Offer name is required");
    if (!form.offer_percentage) return toast.error("Offer percentage is required");
    if (isNaN(form.offer_percentage)) return toast.error("Offer percentage must be a number");
    if (!form.category) return toast.error("Category is required");
    if (!form.product) return toast.error("Product is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = { ...form };
      await api.put(`offers/${offerId}/`, payload);
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
            Edit Offer ✏️
          </Typography>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : (
            <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
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

              {/* Category */}
              <Select
                label="Select Category"
                value={form.category}
                onChange={handleCategoryChange}
                required
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>

              {/* Product */}
              <Select
                label="Select Product"
                value={form.product}
                onChange={(val) => handleChange("product", val)}
                disabled={!form.category}
                required
              >
                {products.map((prod) => (
                  <Option key={prod.id} value={prod.id}>
                    {prod.product_name}
                  </Option>
                ))}
              </Select>

              {/* Active Switch */}
              <div className="md:col-span-2 flex items-center gap-2">
                <Switch
                  checked={form.is_active}
                  onChange={(e) => handleChange("is_active", e.target.checked)}
                />
                <label className="text-sm font-medium text-gray-700">Active</label>
              </div>
            </form>
          )}
        </DialogBody>

        <DialogFooter className="flex justify-center gap-4">
          <Button
            variant="outlined"
            color="secondary"
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
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Offer"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
