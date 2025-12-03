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
import api from "@/utils/base_url";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

/* ✅ Shared Numeric Validation Helper */
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

  // 🧹 Remove leading zeros (e.g. 00010 → 10)
  if (value.length > 1 && value.startsWith("0")) {
    value = value.replace(/^0+/, "");
  }

  // ❌ Prevent 0 if not allowed
  if (preventZero && value === "0") return;

  // ✅ Parse number safely
  const num = Number(value);

  // ❌ Ignore invalid or out-of-range numbers
  if (value !== "" && (isNaN(num) || num < min || num > max)) return;

  // ❌ Disallow decimals if not allowed
  if (!allowDecimal && value.includes(".")) return;

  // ✅ Update parent form
  handleChange({ target: { name: fieldName, value } });
};

/* ✅ Reusable Image Input */
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
      {/* Floating label */}
      <label
        className={`absolute left-3 px-1 transition-all duration-200 bg-white text-gray-600 z-10 ${floated ? "-top-2.5 text-xs" : "top-2.5 text-sm"
          }`}
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
          <img src={preview} alt="preview" className="h-7 w-7 object-cover rounded" />
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

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleInputChange}
        required={required}
      />

      {error && (
        <Typography variant="small" color="red" className="mt-1">
          {helperText}
        </Typography>
      )}
    </div>
  );
}

/* ✅ Add Product Variant */
export default function AddProductVariant({ open, handleOpenClose, refresh }) {
  const { authData } = useAuth();
  const admin = authData?.admin;

  const [availableUnits, setAvailableUnits] = useState([
    "ml",
    "liter",
    "g",
    "kg",
    "piece",
    "pack",
  ]);

  const [form, setForm] = useState({
    parent: "",
    product_name: "",
    product_description: "",
    price: "",
    stock_quantity: "",
    quantity: "",
    quantity_unit: "",
    product_image: null,
  });

  const [mainProducts, setMainProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [errors, setErrors] = useState({});

  /* ✅ Fetch main products */
  useEffect(() => {
    const fetchMainProducts = async () => {
      try {
        const res = await api.get("mainproductlist/");
        setMainProducts(res.data?.data || []);
      } catch (err) {
        console.error("Error fetching main products:", err);
      }
    };
    fetchMainProducts();
  }, []);

  /* ✅ Validation (same as AddProduct) */
  const validateForm = () => {
    const newErrors = {};

    if (!form.parent) newErrors.parent = "Main product is required.";
    if (!form.product_name.trim()) newErrors.product_name = "Variant name is required.";
    if (!form.price) newErrors.price = "Price is required.";
    else if (parseFloat(form.price) <= 0)
      newErrors.price = "Price must be greater than zero.";

    if (!form.stock_quantity) newErrors.stock_quantity = "Stock quantity is required.";
    else if (parseInt(form.stock_quantity) < 0)
      newErrors.stock_quantity = "Stock quantity cannot be negative.";

    if (!form.quantity) newErrors.quantity = "Quantity is required.";
    else if (parseFloat(form.quantity) < 0)
      newErrors.quantity = "Quantity cannot be negative.";

    if (!form.quantity_unit) newErrors.quantity_unit = "Quantity Unit is required.";

    // ✅ Image is optional now (handled by backend)
    if (
      form.product_image &&
      !["image/jpeg", "image/png", "image/webp"].includes(form.product_image.type)
    )
      newErrors.product_image = "Only JPEG, PNG, or WEBP images are allowed.";
    else if (form.product_image && form.product_image.size > 2 * 1024 * 1024)
      newErrors.product_image = "Image must be less than 2MB.";


    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0]);
      return false;
    }
    return true;
  };

  /* ✅ Handle change */
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "product_image" ? (files ? files[0] : null) : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ✅ Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("parent", form.parent);
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("price", form.price);
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("is_available", true);
      payload.append("created_by", admin?.user_id);
      if (form.product_image) payload.append("product_image", form.product_image);

      await api.post("productvariant/", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Variant product added successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);

      setForm({
        parent: "",
        product_name: "",
        product_description: "",
        price: "",
        stock_quantity: "",
        quantity: "",
        quantity_unit: "",
        product_image: null,
      });
      setErrors({});
    } catch (err) {
      console.error("Error adding variant:", err);
      toast.error("Failed to add variant.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ✅ Cancel */
  const handleCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      handleOpenClose(false);
      setForm({
        parent: "",
        product_name: "",
        product_description: "",
        price: "",
        stock_quantity: "",
        quantity: "",
        quantity_unit: "",
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
            Add Product Variant
          </Typography>
        </DialogHeader>

        <DialogBody>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Parent Product */}
            <div>
              {mainProducts.length === 0 ? (
                <div className="flex justify-center py-3">
                  <Spinner size="sm" color="gray" />
                </div>
              ) : (
                <Select
                  key={form.parent || "select-parent"} // ✅ Forces rerender on change
                  label={
                    <span>
                      Select Main Product <span className="text-red-500">*</span>
                    </span>
                  }
                  value={form.parent ? String(form.parent) : ""} // ✅ Force string always
                  onChange={(val) => {
                    const selected = mainProducts.find((p) => String(p.id) === String(val));
                    const parentUnit = selected?.quantity_unit;

                    // Determine allowed units based on parent
                    let allowedUnits = [];
                    switch (parentUnit) {
                      case "ml":
                      case "liter":
                        allowedUnits = ["ml", "liter"];
                        break;
                      case "g":
                      case "kg":
                        allowedUnits = ["g", "kg"];
                        break;
                      case "piece":
                        allowedUnits = ["piece"];
                        break;
                      case "pack":
                        allowedUnits = ["pack"];
                        break;
                      default:
                        allowedUnits = ["ml", "liter", "g", "kg", "piece", "pack"];
                    }

                    setAvailableUnits(allowedUnits);
                    setForm((prev) => ({
                      ...prev,
                      parent: String(val),
                      quantity_unit: parentUnit || "",
                      quantity: parentUnit === "piece" ? "1" : "",
                    }));
                  }}
                  required
                  className="capitalize"
                >
                  {mainProducts.map((prod) => (
                    <Option
                      key={prod.id}
                      value={String(prod.id)}
                      selected={String(prod.id) === String(form.parent)} // ✅ Helps display
                    >
                      {prod.product_name}
                    </Option>
                  ))}
                </Select>
              )}

              {errors.parent && (
                <Typography variant="small" color="red" className="mt-1">
                  {errors.parent}
                </Typography>
              )}
            </div>


            {/* Variant Name */}
            <Input
              label="Variant Name"
              name="product_name"
              value={form.product_name}
              onChange={handleChange}
              error={!!errors.product_name}
              required
            />

            {/* Variant Image */}
            <StyledFileInput
              label="Variant Image"
              value={form.product_image}
              onChange={handleChange}
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
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
              error={!!errors.price}
              required
            />

            {/* Quantity + Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2 mt-4">
              {/* --- Select Unit --- */}
              <Select
                key={form.parent + "-unit"} // ✅ Forces re-render when parent changes
                label={
                  <span>
                    Select Unit<span className="text-red-500">*</span>
                  </span>
                }
                name="quantity_unit"
                value={form.quantity_unit}
                onChange={(val) =>
                  setForm((prev) => ({
                    ...prev,
                    quantity_unit: val,
                    quantity: val === "piece" ? "1" : prev.quantity,
                  }))
                }
                error={!!errors.quantity_unit}
                required
              >
                {availableUnits.map((unit) => (
                  <Option key={unit} value={unit}>
                    {unit.toUpperCase()}
                  </Option>
                ))}
              </Select>

              {/* --- Quantity --- */}
              <Input
                label={`Quantity${form.quantity_unit ? ` (${form.quantity_unit.toUpperCase()})` : ""
                  }`}
                name="quantity"
                type="number"
                step={["liter", "kg"].includes(form.quantity_unit) ? "0.01" : "1"}
                min="1"
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
                    case "piece":
                      limits = { min: 1, max: 1, allowDecimal: false }; // fixed at 1
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
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                error={!!errors.quantity}
                required
                disabled={!form.quantity_unit}
                readOnly={form.quantity_unit === "piece"} // ✅ only piece is locked
                className={`transition-all ${form.quantity_unit === "piece"
                  ? "cursor-not-allowed bg-gray-50 text-gray-700"
                  : ""
                  }`}
              />
            </div>


            {/* Stock Quantity */}
            <Input
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              min="1"
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
              onKeyDown={(e) =>
                ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
              }
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
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Add Variant"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
