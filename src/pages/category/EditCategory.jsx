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
} from "@material-tailwind/react";
import { PhotoIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

/* 🔹 StyledFileInput (same style as AddCategory) */
function StyledFileInput({
  label,
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
    onChange({ target: { name: "category_image", files: file ? [file] : null } });
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
              onChange({ target: { name: "category_image", files: null } });
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

/* 🔹 EditCategory component */
export default function EditCategory({ open, handleOpenClose, categoryId, refresh }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    category_name: "",
    description: "",
    category_image: null,
  });
  const [existingImage, setExistingImage] = useState(null);
  const [existingFileName, setExistingFileName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!open || !categoryId) return;
    setIsLoading(true);

    api
      .get(`categories/${categoryId}/`)
      .then((res) => {
        const data = res.data.data;
        setForm({
          category_name: data.category_name,
          description: data.description,
          category_image: null,
        });
        setExistingImage(data.category_image);
        setExistingFileName(data.category_image?.split("/").pop() || "");
      })
      .catch(() => toast.error("Error loading category"))
      .finally(() => setIsLoading(false));
  }, [categoryId, open]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "description" && value.length > 3000) {
      toast.error("Description cannot exceed 3000 characters.");
      return;
    }
    if (name === "category_image") {
      setForm((prev) => ({ ...prev, category_image: files?.[0] || null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("category_name", form.category_name);
      payload.append("description", form.description);
      if (form.category_image) payload.append("category_image", form.category_image);

      const res = await api.put(`categories/${categoryId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success(res.data?.message || "Category updated successfully!");
      refresh?.();
      handleOpenClose(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        "Failed to update category.";
      if (typeof errorMessage === "string") toast.error(errorMessage);
      else if (typeof errorMessage === "object") {
        const firstError = Object.values(errorMessage)[0];
        toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
      } else toast.error("Something went wrong.");
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
    `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${existingImage.replace(/^\//, "")}`;

  return (
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            Edit Category ✏️
          </Typography>
        </DialogHeader>

        <DialogBody>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-1">
                <Input
                  label="Category Name"
                  name="category_name"
                  value={form.category_name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-1">
                <StyledFileInput
                  label="Category Image"
                  value={form.category_image}
                  onChange={handleChange}
                  required
                  existingFileName={existingFileName}
                  error={
                    form.category_image &&
                    !["image/jpeg", "image/png", "image/webp"].includes(form.category_image.type)
                  }
                  helperText="Only JPEG, PNG, or WEBP images allowed"
                />
              </div>

              <div className="md:col-span-2">
                <Textarea
                  label="Description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  maxLength={3000}
                />
                <Typography
                  variant="small"
                  color="gray"
                  className="text-right mt-1 text-xs"
                >
                  {form.description.length}/3000
                </Typography>
              </div>

        {imageUrl && !form.category_image && (
  <div className="md:col-span-2">
    <p className="mb-2 font-medium">Current Image:</p>
    <div className="w-72 h-48 border border-gray-300 rounded-md flex items-center justify-center bg-gray-50 overflow-hidden">
      <img
        src={imageUrl}
        alt="Category"
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
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Category"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
