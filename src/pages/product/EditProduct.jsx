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

/* 🔹 Styled File Input with Preview (same as Category) */
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

/* 🔹 Edit Product Component */
export default function EditProduct({ open, handleOpenClose, productId, refresh }) {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    category: "",
    price: "",
    stock_quantity: "",
    quantity: "",
    quantity_unit: "",
    product_image: null,
    is_available: false,
  });
  const [existingImage, setExistingImage] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!open || !productId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productRes, categoryRes] = await Promise.all([
          api.get(`product/${productId}/`),
          api.get("categories/"),
        ]);

        const productData = productRes.data.data;
        setForm({
          product_name: productData.product_name,
          product_description: productData.product_description,
          category: String(productData.category),
          price: productData.price,
          quantity: productData.quantity,
          quantity_unit: productData.quantity_unit,
          stock_quantity: productData.stock_quantity,
          product_image: null,
          is_available: productData.is_available || false,
        });
        setExistingImage(productData.product_image);
        setExistingFileName(productData.product_image?.split("/").pop() || "");
        setCategories(categoryRes.data.data);
      } catch (err) {
        toast.error("Error loading product details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [productId, open]);

  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;

    // Prevent negative values for specific numeric fields
    const numericFields = ["price", "stock_quantity", "quantity"];
    if (numericFields.includes(name)) {
      const numValue = Number(value);
      if (numValue < 0) return; // Block negative input
    }

    if (name === "product_image") {
      setForm((prev) => ({ ...prev, product_image: files?.[0] || null }));
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("product_name", form.product_name);
      payload.append("product_description", form.product_description);
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("quantity", form.quantity);
      payload.append("quantity_unit", form.quantity_unit);
      payload.append("stock_quantity", form.stock_quantity);
      payload.append("is_available", form.is_available);
      if (form.product_image)
        payload.append("product_image", form.product_image);

      const res = await api.put(`product/${productId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Product updated successfully!");
      refresh?.();
      handleOpenClose(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating product");
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

  const imageUrl =
    existingImage &&
    `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${existingImage.replace(
      /^\//,
      ""
    )}`;

  return (
    <Dialog open={open} handler={handleOpenClose} size="lg">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Edit Product
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
                label="Product Name"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <Select
                label={
                  <span>
                    Select Category <span className="text-red-500">*</span>
                  </span>
                }
                value={String(form.category)}
                onChange={(val) =>
                  setForm((prev) => ({ ...prev, category: val }))
                }
                required
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={String(cat.id)}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>
              <StyledFileInput
                label="Product Image"
                name="product_image"
                value={form.product_image}
                onChange={handleChange}
                required
                existingFileName={existingFileName}
                error={
                  form.product_image &&
                  !["image/jpeg", "image/png", "image/webp"].includes(
                    form.product_image.type
                  )
                }
                helperText="Only JPEG, PNG, or WEBP images allowed"
              />

              <Input
                label="Price"
                name="price"
                type="number"
                min="0"
                value={form.price}
                onChange={handleChange}
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Quantity"
                  name="quantity"
                  type="number"
                  min="0"
                  onInput={(e) => e.target.value = Math.max(0, e.target.value)}
                  value={form.quantity}
                  onChange={handleChange}
                  required
                />


                <Select
                  label="Quantity Unit *"
                  value={form.quantity_unit}
                  onChange={(v) => setForm((p) => ({ ...p, quantity_unit: v }))}
                >
                  {["ml", "liter", "g", "kg", "piece", "pack"].map((u) => (
                    <Option key={u} value={u}>{u.toUpperCase()}</Option>
                  ))}
                </Select>

              </div>
              <Input
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                min="0"
                max="100"
                value={form.stock_quantity}
                onChange={handleChange}
                required
              />

              <div className="flex items-center justify-start  gap-3">
                <Switch
                  id="is_available"
                  name="is_available"
                  checked={form.is_available}
                  onChange={handleChange}
                />
                <label
                  htmlFor="is_available"
                  className="text-sm font-medium text-gray-700"
                >
                  Available
                </label>
              </div>

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

              {imageUrl && !form.product_image && (
                <div className="md:col-span-2">
                  <p className="mb-2 font-medium">Current Image:</p>
                  <div className="w-72 h-48 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Product"
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
            type="submit"
            onClick={handleSubmit}
            color="gray"
            disabled={isSubmitting || isLoading}
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <Spinner size="sm" color="white" />
            ) : (
              "Update Product"
            )}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
