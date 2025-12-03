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


export default function AddOffer({ open, handleOpenClose, refresh }) {
  const [form, setForm] = useState({
    category: "",
    product: "",
    offer_name: "",
    offer_percentage: "",
    start_date: "",
    end_date: "",
  });

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // ✅ Utility functions
  const formatDate = (date) => new Date(date).toISOString().split("T")[0];
  const today = formatDate(new Date()); // current date in YYYY-MM-DD

  const isDateInFuture = (date) => {
    if (!date) return false;
    return new Date(date) > new Date();
  };

  const resetForm = () => {
    setForm({
      category: "",
      product: "",
      offer_name: "",
      offer_percentage: "",
      start_date: "",
      end_date: "",
    });
    setProducts([]);
  };

  // ✅ Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
      setIsSubmitting(false);
      setIsCancelling(false);
    }
  }, [open]);

  // ✅ Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get("categories/");
        setCategories(res.data?.data || []);
      } catch {
        toast.error("Failed to load categories");
      }
    };
    fetchCategories();
  }, []);

  // ✅ Fetch products when category changes
  useEffect(() => {
    if (!form.category) {
      setProducts([]);
      setForm((prev) => ({ ...prev, product: "" }));
      return;
    }

    const fetchProducts = async () => {
      try {
        const res = await api.get(`offers/category/${form.category}/`);
        const { status, message, data } = res.data || {};

        if (status === false || !data?.length) {
          toast.error(message || "No products found for this category.");
          setProducts([]);
          setForm((prev) => ({ ...prev, product: "" }));
          return;
        }

        // ✅ Success
        setProducts(data);
        setForm((prev) => ({ ...prev, product: "" }));
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to fetch products");
        setProducts([]);
        setForm((prev) => ({ ...prev, product: "" }));
      }
    };

    fetchProducts();
  }, [form.category]);

  // ✅ Validation
  const validateForm = () => {
    if (!form.category) return toast.error("Category is required");
    if (!form.product) return toast.error("Product is required");
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

  // ✅ Handle field changes
  const handleChange = (field, value) => {
    if (field === "start_date") {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        end_date:
          prev.end_date && new Date(value) > new Date(prev.end_date)
            ? ""
            : prev.end_date,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // ✅ Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const isActive =
        formatDate(new Date(form.start_date)) === today ? true : false;

      let payload = [];

      if (Array.isArray(form.product)) {
        payload = form.product.map((prodId) => ({
          product: Number(prodId),
          category: Number(form.category),
          offer_name: form.offer_name,
          offer_percentage: Number(form.offer_percentage),
          start_date: form.start_date,
          end_date: form.end_date,
          is_active: isActive, // ✅ Auto set active/inactive
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
            is_active: isActive, // ✅ Auto set active/inactive
          },
        ];
      }

      await api.post("offers/", payload);
      toast.success("Offer(s) added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
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
            Add Offer
          </Typography>
        </DialogHeader>

        <DialogBody>
          <form
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            onSubmit={handleSubmit}
          >
            {/* Category */}
            <Select
              label={
                <span>
                  Select Category <span className="text-red-500">*</span>
                </span>
              }
              selected={
                categories.find((cat) => String(cat.id) === String(form.category))
                  ?.category_name || "Select Category"
              }
              onChange={(val) => {
                setForm((prev) => ({ ...prev, category: val, product: "",dropdownOpen: false, }));
              }}
              menuProps={{
                className:
                  "max-h-52 overflow-y-auto z-[9999] rounded-md shadow-md bg-white", // scrollable dropdown
              }}
            >
              {categories.map((cat) => (
                <Option key={cat.id} value={String(cat.id)}>
                  {cat.category_name}
                </Option>
              ))}
            </Select>

            {/* Product (Multi-Select with Checkboxes, same UI size) */}
            <div className="relative w-full bottom-2.5">
              
              <div
                onClick={() => {
                  if (!form.category || !products.length) return;
                  setForm((prev) => ({ ...prev, dropdownOpen: !prev.dropdownOpen }));
                }}
                className={`mt-2 border rounded-md px-3 py-2.5 bg-white flex justify-between items-center cursor-pointer
      ${!form.category || !products.length
                    ? "bg-gray-100 cursor-not-allowed border-gray-200"
                    : form.dropdownOpen
                      ? "border-gray-900"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
              >
                <span className="text-blue-gray-800 text-sm truncate">
                  {form.product.length === 0
                    ? "Select Product"
                    : form.product.length === products.length
                      ? "All Products Selected"
                      : `${form.product.length} Product${form.product.length > 1 ? "s" : ""} Selected`}
                </span>

                {/* Dropdown arrow */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-5 w-5 text-gray-700 transform transition-transform duration-200 ${form.dropdownOpen ? "rotate-180" : ""
                    }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Panel */}
              {form.dropdownOpen && (
                <div
                  className="absolute mt-1 w-full max-h-60 overflow-y-auto bg-white border border-blue-gray-100 rounded-md shadow-md z-[9999] animate-fadeIn"
                >
                  {/* Select All */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (form.product.length === products.length) {
                        setForm((prev) => ({ ...prev, product: [] }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          product: products.map((p) => String(p.id)),
                        }));
                      }
                    }}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-blue-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={form.product.length === products.length && products.length > 0}
                      readOnly
                    />
                    <span className="text-sm font-medium text-blue-gray-800">Select All Products</span>
                  </div>

                  <div className="border-t border-gray-100" />

                  {/* Product List */}
                  {products.map((prod) => (
                    <div
                      key={prod.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((prev) => {
                          const exists = prev.product.includes(String(prod.id));
                          const updated = exists
                            ? prev.product.filter((id) => id !== String(prod.id))
                            : [...prev.product, String(prod.id)];
                          return { ...prev, product: updated };
                        });
                      }}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-blue-gray-50 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={form.product.includes(String(prod.id))}
                        readOnly
                      />
                      <span className="text-sm text-blue-gray-800">{prod.product_name}</span>
                    </div>
                  ))}

                  {/* Done Button */}
                  <div className="sticky bottom-0 bg-white border-t py-2 flex justify-center">
                    <Button
                      size="sm"
                      color="gray"
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm((prev) => ({ ...prev, dropdownOpen: false }));
                      }}
                      className="text-sm shadow-sm"
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>


            {/* Offer name & percentage */}
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
              max="100"
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

            {/* Dates */}
            <Input
              label="Start Date"
              type="date"
              value={form.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
              min={today} // Disable past
            />

            <Input
              label="End Date"
              type="date"
              value={form.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              required
              min={form.start_date || today}
            />
          </form>
        </DialogBody>

        <DialogFooter className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Future date info */}
          {isDateInFuture(form.start_date) && (
            <Typography
              variant="small"
              color="green"
              className="text-xs text-center sm:text-left"
            >
              ⚠️ This offer starts on{" "}
              <span className="font-semibold">{form.start_date}</span> and will
              automatically activate on that date.
            </Typography>
          )}

          <div className="flex justify-center gap-4">
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
          </div>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
