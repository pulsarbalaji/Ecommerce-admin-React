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

// --- Reusable File Input ---
function StyledFileInput({
  label,
  name,
  value,
  onChange,
  required,
  accept = "image/*",
  error,
  helperText,
}) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(value?.name || "");

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    onChange({ target: { name, files: file ? [file] : null } });
  };

  return (
    <div className="relative w-full">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="absolute inset-0 opacity-0 cursor-pointer"
        onChange={handleInputChange}
        required={required}
      />
      <div
        className={`border rounded-md w-full px-3 py-2 flex items-center gap-2 bg-white ${
          error ? "border-red-500" : "border-gray-300"
        }`}
        onClick={() => inputRef.current?.click()}
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
              onChange({ target: { name, files: null } });
            }}
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

// --- Main Edit Product Modal ---
export default function EditProduct({ open, handleOpenClose, productId, refresh }) {
  const [form, setForm] = useState({
    product_name: "",
    product_description: "",
    category: "",
    price: "",
    stock_quantity: "",
    product_image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch product
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
          category: productData.category,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          product_image: null,
        });
        setExistingImage(productData.product_image);
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
    const { name, value, files } = e.target;
    if (name === "product_image") {
      setForm((prev) => ({
        ...prev,
        product_image: files?.length ? files[0] : null,
      }));
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
      payload.append("product_description", form.product_description || "");
      payload.append("category", form.category);
      payload.append("price", form.price);
      payload.append("stock_quantity", form.stock_quantity);
      if (form.product_image) payload.append("product_image", form.product_image);

      await api.put(`product/${productId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product updated successfully!");
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

  const backendBaseUrl = import.meta.env.VITE_API_URL;
  const imageUrl =
    existingImage &&
    (existingImage.startsWith("http")
      ? existingImage
      : `${backendBaseUrl}${existingImage}`);

  return (
    <Dialog open={open} handler={handleOpenClose} size="lg">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Edit Product ✏️
          </Typography>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Product Name"
                name="product_name"
                value={form.product_name}
                onChange={handleChange}
                required
              />

              <Select
                label="Select Category"
                value={form.category}
                onChange={(val) => setForm((prev) => ({ ...prev, category: val }))}
                required
              >
                {categories.map((cat) => (
                  <Option key={cat.id} value={cat.id}>
                    {cat.category_name}
                  </Option>
                ))}
              </Select>

              <Input
                label="Price"
                name="price"
                type="number"
                value={form.price}
                onChange={handleChange}
                required
              />

              <Input
                label="Stock Quantity"
                name="stock_quantity"
                type="number"
                value={form.stock_quantity}
                onChange={handleChange}
                required
              />

              <StyledFileInput
                label="Product Image"
                name="product_image"
                value={form.product_image}
                onChange={handleChange}
              />

              <Textarea
                label="Description"
                name="product_description"
                value={form.product_description}
                onChange={handleChange}
                rows={6}
                className="md:col-span-2"
              />

              {imageUrl && !form.product_image && (
                <div className="md:col-span-2">
                  <p className="mb-2 font-medium">Current Image:</p>
                  <img
                    src={imageUrl}
                    alt="Product"
                    className="w-72 h-48 object-cover rounded-md border border-gray-300"
                  />
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
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Product"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
