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

/* ✅ Numeric Input Handler (shared across all screens) */
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

  // ✅ Parse safely
  const num = Number(value);

  // ❌ Out of range or invalid
  if (value !== "" && (isNaN(num) || num < min || num > max)) return;

  // ❌ Disallow decimals if not allowed
  if (!allowDecimal && value.includes(".")) return;

  // ✅ Update parent
  handleChange({ target: { name: fieldName, value } });
};

/* ✅ Styled File Input with Preview */
function StyledFileInput({
  label,
  name,
  value,
  onChange,
  required,
  error,
  helperText,
  accept = "image/jpeg,image/png,image/webp",
  existingFileName = "",
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(value?.name || existingFileName || "");
  const [preview, setPreview] = useState(null);
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    if (value instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(value);
    } else {
      setPreview(null);
    }
    setFileName(value?.name || existingFileName || "");
  }, [value, existingFileName]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    onChange({ target: { name, files: file ? [file] : null } });
  };

  const floated = focused || fileName;

  return (
    <div className="relative w-full">
      <label
        className={`absolute left-3 px-1 transition-all duration-200 bg-white text-gray-600 z-10 ${
          floated ? "-top-2.5 text-xs" : "top-2.5 text-sm"
        }`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div
        className={`border rounded-md px-3 py-2.5 flex items-center gap-2 bg-white cursor-pointer transition-all duration-200 ${
          focused
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
          className={`text-blue-gray-700 text-sm truncate flex-1 ${
            !fileName ? "text-blue-gray-400" : ""
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
              onChange({ target: { name, files: null } });
            }}
          >
            <XMarkIcon className="h-4 w-4 text-red-500" />
          </button>
        )}
      </div>

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

/* ✅ Edit Variant Component */
export default function EditVariant({ open, handleOpenClose, variantId, refresh }) {
  const { authData } = useAuth();
  const admin = authData?.admin;

  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    parent_product: "",
    price: "",
    stock_quantity: "",
    quantity: "",
    quantity_unit: "",
    product_image: null,
    is_available: false,
  });

  const [products, setProducts] = useState([]);
  const [errors, setErrors] = useState({});
  const [existingImage, setExistingImage] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  

  /* ✅ Fetch variant + parent list */
  useEffect(() => {
    if (!open || !variantId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [variantRes, parentRes] = await Promise.all([
          api.get(`productvariant/${variantId}/`),
          api.get("mainproductlist/"),
        ]);
        const variant = variantRes.data.data;

        setForm({
          product_name: variant.product_name || "",
          product_description: variant.product_description || "",
          parent_product: String(variant.parent || ""),
          price: variant.price || "",
          quantity: variant.quantity || "",
          quantity_unit: variant.quantity_unit || "",
          stock_quantity: variant.stock_quantity || "",
          product_image: null,
          is_available: variant.is_available || false,
        });

        setExistingImage(variant.product_image || null);
        setExistingFileName(variant.product_image?.split("/").pop() || "");
        setProducts(parentRes.data.data || []);
      } catch {
        toast.error("Error loading variant details");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [variantId, open]);

  /* ✅ Handle changes */
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "product_image"
          ? files?.[0] || null
          : type === "checkbox"
          ? checked
          : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  /* ✅ Validate before submit */
  const validateForm = () => {
    const newErrors = {};
    if (!form.parent_product) newErrors.parent_product = "Parent product is required.";
    if (!form.product_name.trim())
      newErrors.product_name = "Variant name is required.";
    if (!form.price) newErrors.price = "Price is required.";
    else if (parseFloat(form.price) <= 0)
      newErrors.price = "Price must be greater than zero.";

    if (!form.stock_quantity)
      newErrors.stock_quantity = "Stock quantity is required.";
    else if (parseInt(form.stock_quantity) < 0)
      newErrors.stock_quantity = "Stock quantity cannot be negative.";

    if (!form.quantity) newErrors.quantity = "Quantity is required.";
    else if (parseFloat(form.quantity) < 0)
      newErrors.quantity = "Quantity cannot be negative.";

    if (!form.quantity_unit)
      newErrors.quantity_unit = "Quantity unit is required.";

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

  /* ✅ Submit */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("parent", form.parent_product);
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("price", form.price);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("is_available", form.is_available);
      payload.append("updated_by", admin.user_id);
      if (form.product_image)
        payload.append("product_image", form.product_image);

      await api.put(`productvariant/${variantId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Variant updated successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to update variant.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsCancelling(true);
    setTimeout(() => {
      handleOpenClose(false);
      setIsCancelling(false);
    }, 400);
  };

  const imageUrl =
    existingImage &&
    `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${existingImage.replace(/^\//, "")}`;

  return (
    <Dialog open={open} handler={handleCancel} size="lg">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Edit Variant Product
          </Typography>
        </DialogHeader>

        <DialogBody className="max-h-[65vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Variant Name */}
              <Input
                label="Variant Name"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                error={!!errors.product_name}
                required
              />

              {/* Parent Product */}
              <Select
                label={
                  <span>
                    Parent Product <span className="text-red-500">*</span>
                  </span>
                }
                value={String(form.parent_product)}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, parent_product: val }))
                }
              >
                {products.map((p) => (
                  <Option key={p.id} value={String(p.id)}>
                    {p.product_name}
                  </Option>
                ))}
              </Select>

              {/* Image */}
              <StyledFileInput
                label="Variant Image"
                name="product_image"
                value={form.product_image}
                onChange={handleChange}
                existingFileName={existingFileName}
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
                onKeyDown={(e) =>
                  ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                }
                error={!!errors.price}
                required
              />

              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                <Select
                  label="Quantity Unit *"
                  value={form.quantity_unit}
                  onChange={(v) =>
                    setForm((prev) => ({
                      ...prev,
                      quantity_unit: v,
                      quantity: v === "piece" ? "1" : "",
                    }))
                  }
                >
                  {["ml", "liter", "g", "kg", "piece", "pack"].map((u) => (
                    <Option key={u} value={u}>
                      {u.toUpperCase()}
                    </Option>
                  ))}
                </Select>

                <Input
                  label={`Quantity${
                    form.quantity_unit ? ` (${form.quantity_unit.toUpperCase()})` : ""
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
                    }

                    handleNumericInput({
                      e,
                      fieldName: "quantity",
                      handleChange,
                      ...limits,
                      preventZero: true,
                    });
                  }}
                  onKeyDown={(e) =>
                    ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()
                  }
                  error={!!errors.quantity}
                  required
                  disabled={!form.quantity_unit}
                  readOnly={form.quantity_unit === "piece"}
                  className={`transition-all ${
                    form.quantity_unit === "piece"
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
                <Typography variant="small" color="gray" className="text-right mt-1 text-xs">
                  {form.product_description.length}/3000
                </Typography>
              </div>

              {/* Existing Image Preview */}
              {imageUrl && !form.product_image && (
                <div className="md:col-span-2">
                  <p className="mb-2 font-medium">Current Image:</p>
                  <div className="w-72 h-48 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Variant"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
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
            onClick={handleSubmit}
            color="gray"
            disabled={isSubmitting || isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Variant"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
