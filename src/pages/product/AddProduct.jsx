import React, { useEffect, useState, useRef } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Card,
  Typography,
  Input,
  Textarea,
  Button,
  Spinner,
  Select,
  Option,
} from "@material-tailwind/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

// ✅ Styled file input reused from your AddCategory
function StyledFileInput({ label, value, onChange, required, error, helperText, accept = "image/*" }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(true);
  const [fileName, setFileName] = useState(value?.name || "");

  useEffect(() => {
    setFileName(value?.name || "");
  }, [value]);

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFileName(file ? file.name : "");
    onChange({ target: { name: "product_image", files: file ? [file] : null } });
  };

  const floated = !!fileName || focused;

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer peer"
        onChange={handleInputChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(true)}
        required={required}
      />
      <label
        className={`absolute left-3 transition-all duration-200 select-none pointer-events-none text-gray-500
        ${floated ? "text-xs -top-3.5 bg-white px-1" : "top-3"}
        peer-focus:text-blue-gray-600 peer-focus:-top-3.5 peer-focus:text-xs`}
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        className={`border rounded-md w-full px-3 py-2 flex items-center gap-2 cursor-pointer
        ${error ? "border-red-500" : "border-gray-300"} bg-white`}
        onClick={() => inputRef.current?.click()}
        tabIndex={-1}
      >
        <PhotoIcon className="h-6 w-6 text-blue-gray-400" />
        <span className="text-blue-gray-700 text-sm truncate">
          {fileName || `Choose ${label.toLowerCase()}...`}
        </span>
        {fileName && (
          <button
            type="button"
            className="ml-auto rounded-full p-1 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              setFileName("");
              if (inputRef.current) inputRef.current.value = "";
              onChange({ target: { name: "product_image", files: null } });
            }}
            tabIndex={-1}
            aria-label="Remove selected image"
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
      {error && (
        <Typography variant="small" color="red" className="mt-1">
          {helperText}
        </Typography>
      )}
    </div>
  );
}

export default function AddProduct({ open, handleOpenClose, refresh }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    category: "",
    price: "",
    stock_quantity: "",
    product_image: null,
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // ✅ Fetch categories from backend
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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "product_image") {
      setForm((prev) => ({ ...prev, product_image: files && files.length ? files[0] : null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!form.product_name) return toast.error("Product name is required");
    if (!form.category) return toast.error("Category is required");
    if (!form.price) return toast.error("Price is required");
    if (!form.stock_quantity) return toast.error("Stock quantity is required");
    if (!form.product_image) return toast.error("Product image is required");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("is_available", true);
      if (form.product_image) payload.append("product_image", form.product_image);

      await api.post("product/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      handleOpenClose(false);
      refresh?.();
      setForm({
        product_name: "",
        product_description: "",
        category: "",
        price: "",
        stock_quantity: "",
        product_image: null,
      });
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product");
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
    <Dialog open={open} handler={handleOpenClose} size="lg">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Add Product 🛍️
          </Typography>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Product Name */}
            <Input
              label="Product Name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              required
              fullWidth
            />

            {/* Category */}
            <div className="w-full">
              <Select
                label="Select Category"
                value={form.category}
                onChange={(val) => setForm((p) => ({ ...p, category: val }))}
                required
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
            </div>

            {/* Product Image */}
            <StyledFileInput
              label="Product Image"
              value={form.product_image}
              onChange={handleChange}
              required
              error={
                form.product_image &&
                !["image/jpeg", "image/png", "image/webp"].includes(form.product_image.type)
              }
              helperText="Only JPEG, PNG, or WEBP images allowed"
            />

            {/* Price */}
            <Input
              label="Price"
              name="price"
              type="number"
              value={form.price}
              onChange={handleChange}
              required
            />

            {/* Stock Quantity */}
            <Input
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              value={form.stock_quantity}
              onChange={handleChange}
              required
            />

            {/* Description */}
            <div className="md:col-span-2">
              <Textarea
                label="Description"
                name="product_description"
                value={form.product_description}
                onChange={handleChange}
                rows={4}
              />
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
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Add Product"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
