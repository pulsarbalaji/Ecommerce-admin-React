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
import { useAuth } from "@/context/AuthContext";


export const handleNumericInput = ({
  e,
  fieldName,
  handleChange,
  min = 1,
  max = 100,
  allowDecimal = false,
  preventZero = true,
}) => {
  let value = e.target.value;

  // 🧹 Remove leading zeros (e.g. 00010 -> 10)
  if (value.length > 1 && value.startsWith("0")) {
    value = value.replace(/^0+/, "");
  }

  // ❌ Prevent 0 if not allowed
  if (preventZero && value === "0") return;

  // ✅ Parse number safely
  const num = Number(value);

  // ❌ Ignore if out of range or invalid number
  if (value !== "" && (isNaN(num) || num < min || num > max)) return;

  // ❌ Disallow decimals if not allowed
  if (!allowDecimal && value.includes(".")) return;

  // ✅ Update parent form
  handleChange({ target: { name: fieldName, value } });
};

function StyledFileInput({
  label,
  value,
  onChange,
  required,
  error,
  helperText,
  accept = "image/jpeg,image/png,image/webp",
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(value?.name || "");
  const [preview, setPreview] = useState(null);
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    setFileName(value?.name || "");
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
  }, [value]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    onChange({ target: { name: "product_image", files: file ? [file] : null } });
  };

  const floated = focused || fileName;



  return (
    <div className="relative w-full">
      {/* Floating Label */}
      <label
        className={`absolute left-3 px-1 transition-all duration-200 bg-white text-gray-600 z-10
        ${floated ? "-top-2.5 text-xs" : "top-2.5 text-sm"}`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {/* Input box */}
      <div
        className={`border rounded-md px-3 py-2.5 flex items-center gap-2 bg-white cursor-pointer transition-all duration-200 ${focused
          ? "border-gray-800 shadow-sm"
          : error
            ? "border-red-500"
            : "border-gray-300"
          }`}
        onClick={() => inputRef.current?.click()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(true)}
        tabIndex={0}
      >
        {!fileName && <PhotoIcon className="h-5 w-5 text-blue-gray-400" />}
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="h-7 w-7 object-cover rounded"
          />
        )}
        <span
          className={`text-blue-gray-700 text-sm truncate flex-1 ${!fileName ? "text-blue-gray-400" : ""
            }`}
        >
          {fileName || "Choose image..."}
        </span>
        {fileName && (
          <button
            type="button"
            className="ml-auto rounded-full p-1 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              setFileName("");
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
              onChange({ target: { name: "product_image", files: null } });
            }}
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>
      {/* Hidden input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        required={required}
      />
      {/* Helper/Error text */}
      {error && (
        <Typography variant="small" color="red" className="mt-1">
          {helperText}
        </Typography>
      )}
    </div>
  );
}


export default function AddProduct({ open, handleOpenClose, refresh }) {

  const { authData } = useAuth();
  const admin = authData?.admin;

  const navigate = useNavigate();

  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    category: "",
    price: "",
    stock_quantity: "",
    quantity: "",
    quantity_unit: "",
    product_image: null,
  });

  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch categories
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

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.product_name.trim()) newErrors.product_name = "Product name is required.";
    if (!form.category) newErrors.category = "Category is required.";
    if (!form.price) newErrors.price = "Price is required.";
    else if (parseFloat(form.price) <= 0) newErrors.price = "Price must be greater than zero.";

    if (!form.stock_quantity) newErrors.stock_quantity = "Stock quantity is required.";
    else if (parseInt(form.stock_quantity) < 0)
      newErrors.stock_quantity = "Stock quantity cannot be negative.";

    if (!form.quantity) newErrors.quantity = "quantity is required.";
    else if (parseInt(form.quantity) < 0)
      newErrors.quantity = "quantity cannot be negative.";

    if (!form.quantity_unit) newErrors.quantity_unit = "Quantity Unit is required.";

    // Use exact same logic as your AddCategory for images
    if (!form.product_image) newErrors.product_image = "Product image is required.";
    else if (!["image/jpeg", "image/png", "image/webp"].includes(form.product_image.type))
      newErrors.product_image = "Only JPEG, PNG, or WEBP images are allowed.";
    else if (form.product_image.size > 2 * 1024 * 1024)
      newErrors.product_image = "Image must be less than 2MB";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      toast.error(firstError);
      return false;
    }
    return true;
  };

  // Handle input changes
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "product_image" ? (files ? files[0] : null) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined })); // clear field error on change
  };

  // Submit form
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
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("is_available", true);
      payload.append("created_by", admin.user_id);
      if (form.product_image) payload.append("product_image", form.product_image);

      await api.post("product/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
      setForm({
        product_name: "",
        product_description: "",
        category: "",
        price: "",
        stock_quantity: "",
        quantity: "",
        quantity_unit: "",
        product_image: null,
      });
      setErrors({});
    } catch (err) {
      console.error("Error adding product:", err);
      toast.error("Failed to add product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      handleOpenClose(false);
      setForm({
        product_name: "",
        product_description: "",
        category: "",
        price: "",
        quantity: "",
        quantity_unit: "",
        stock_quantity: "",
        product_image: null,
      });
      setErrors({});
      setIsCancelling(false);
    }, 400);
  };

  return (
    <Dialog open={open} handler={handleCancel} size="lg">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Add Product
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
              error={!!errors.product_name}
              required
            />
            {/* Category */}
            <div>
              <Select
                label={
                  <span>
                    Select Category <span className="text-red-500">*</span>
                  </span>
                }
                onChange={(val) => {
                  setForm((prev) => ({ ...prev, category: val }));
                  if (errors.category) setErrors((prev) => ({ ...prev, category: undefined }));
                }}

              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>

              {errors.category && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.category}
                </Typography>
              )}
            </div>


            {/* Product Image */}
            <StyledFileInput
              label="Product Image"
              value={form.product_image}
              onChange={handleChange}
              required
              error={!!errors.product_image}
              helperText={errors.product_image}
            />
            {/* Price */}
            <Input
              label="Price"
              name="price"
              type="number"
              min="1"
              max="10000"
              value={form.price}
              onChange={(e) =>
                handleNumericInput({
                  e,
                  fieldName: "price",
                  handleChange,
                  min: 1,
                  max: 10000,
                  allowDecimal: false,
                  preventZero: true,
                })
              }
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              error={!!errors.price}
              required
            />

            {/* --- Select Unit --- */}
            <Select
              label={
                <span>
                  Select Unit<span className="text-red-500">*</span>
                </span>
              }
              name="quantity_unit"
              value={form.quantity_unit}
              onChange={(val) => {
                setForm((prev) => ({
                  ...prev,
                  quantity_unit: val,
                  quantity: val === "piece" ? "1" : "", // ✅ fixed for 'piece'
                }));
              }}
              error={!!errors.quantity_unit}
              required
            >
              {["ml", "liter", "g", "kg", "piece", "pack"].map((unit) => (
                <Option key={unit} value={unit}>
                  {unit.toUpperCase()}
                </Option>
              ))}
            </Select>

            {/* --- Quantity Input (No Placeholder) --- */}
            <Input
              label={`Quantity${form.quantity_unit ? ` (${form.quantity_unit.toUpperCase()})` : ""
                }`}
              name="quantity"
              type="number"
              step={["liter", "kg"].includes(form.quantity_unit) ? "0.01" : "1"}
              min="0"
              value={form.quantity}
              onChange={(e) => {
                let limits = { min: 1, max: 1000, allowDecimal: false };

                switch (form.quantity_unit) {
                  case "ml":
                    limits = { min: 1, max: 999, allowDecimal: false };
                    break;
                  case "liter":
                    limits = { min: 1, max: 99.99, allowDecimal: true };
                    break;
                  case "g":
                    limits = { min: 1, max: 999, allowDecimal: false };
                    break;
                  case "kg":
                    limits = { min: 1, max: 99.99, allowDecimal: true };
                    break;
                  case "pack":
                    limits = { min: 1, max: 1000, allowDecimal: false };
                    break;
                  default:
                    limits = { min: 1, max: 1000 };
                }

                handleNumericInput({
                  e,
                  fieldName: "quantity",
                  handleChange,
                  ...limits,
                  preventZero: true,
                });
              }}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              error={!!errors.quantity}
              required
              disabled={!form.quantity_unit} // ✅ disable until unit selected
              readOnly={form.quantity_unit === "piece"} // ✅ fixed 1 for piece
              crossOrigin="" // prevents react warning in Material Tailwind Input
              className={`transition-all ${form.quantity_unit === "piece"
                ? "cursor-not-allowed bg-gray-50 text-gray-700"
                : ""
                }`}
            />


            <Input
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              min="0"
              max="100"
              value={form.stock_quantity}
              onChange={(e) =>
                handleNumericInput({
                  e,
                  fieldName: "stock_quantity",
                  handleChange,
                  min: 1,
                  max: 100,
                  allowDecimal: false,
                  preventZero: true,
                })
              }
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
              }}
              error={!!errors.stock_quantity}
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
                maxLength={3000}
              />
              <Typography
                variant="small"
                color="gray"
                className="text-right mt-1 text-xs"
              >
                {form.product_description.length}/3000
              </Typography>
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
