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
  Switch,
} from "@material-tailwind/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import api from "@/utils/base_url";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

/* 🔹 Styled File Input Component */
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
        className={`absolute left-3 px-1 transition-all duration-200 bg-white text-gray-600 z-10
        ${floated ? "-top-2.5 text-xs" : "top-2.5 text-sm"}`}
      >
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>

      <div
        className={`border rounded-md px-3 py-2.5 flex items-center gap-2 bg-white cursor-pointer transition-all duration-200 ${focused ? "border-gray-800 shadow-sm" : error ? "border-red-500" : "border-gray-300"
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

/* 🔹 Edit Variant Component */
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
  const [existingImage, setExistingImage] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  /* ✅ Fetch variant + main products */
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
          parent_product: String(variant.parent),
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
      } catch (err) {
        toast.error("Error loading variant details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [variantId, open]);

  /* ✅ Handle field changes */
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    if (name === "product_image") {
      setForm((prev) => ({ ...prev, product_image: files?.[0] || null }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  /* ✅ Submit handler */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null) payload.append(k === "parent_product" ? "parent" : k, v);
      });
      payload.append("updated_by", admin.user_id);

      await api.put(`productvariant/${variantId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Variant updated successfully!");
      setTimeout(() => {
        handleOpenClose(false);
        refresh?.();
      }, 1000);
    } catch (err) {
      toast.error("Failed to update variant");
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
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <Input
                label="Variant Name"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <Select
                label="Parent Product *"
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

              <StyledFileInput
                label="Variant Image"
                name="product_image"
                value={form.product_image}
                onChange={handleChange}
                existingFileName={existingFileName}
              />

              <Input
                label="Price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                required
              />

              {/* Quantity & Unit (same logic as EditProduct) */}
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
                  label={`Quantity${form.quantity_unit ? ` (${form.quantity_unit.toUpperCase()})` : ""}`}
                  name="quantity"
                  type="number"
                  step={["liter", "kg"].includes(form.quantity_unit) ? "0.01" : "1"}
                  min="0"
                  value={form.quantity}
                  onChange={(e) => {
                    const val = e.target.value;
                    let isValid = true;
                    switch (form.quantity_unit) {
                      case "ml":
                        isValid = val === "" || (Number(val) >= 0 && Number(val) <= 999);
                        break;
                      case "liter":
                        isValid = val === "" || (Number(val) >= 0 && Number(val) <= 99.99);
                        break;
                      case "g":
                        isValid = val === "" || (Number(val) >= 0 && Number(val) <= 999);
                        break;
                      case "kg":
                        isValid = val === "" || (Number(val) >= 0 && Number(val) <= 99.99);
                        break;
                      case "pack":
                        isValid = val === "" || (Number(val) >= 0 && Number(val) <= 1000);
                        break;
                      default:
                        isValid = true;
                    }
                    if (isValid) handleChange(e);
                  }}
                  onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                  required
                  disabled={!form.quantity_unit}
                  readOnly={form.quantity_unit === "piece"}
                  className={`transition-all ${form.quantity_unit === "piece"
                      ? "cursor-not-allowed bg-gray-50 text-gray-700"
                      : ""
                    }`}
                />
              </div>

              <Input
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={form.stock_quantity}
                onChange={handleChange}
                required
              />


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
