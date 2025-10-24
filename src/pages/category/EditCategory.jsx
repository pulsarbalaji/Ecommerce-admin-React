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

// StyledFileInput same as AddCategory
function StyledFileInput({ label, value, onChange, required, error, helperText, accept = "image/jpeg,image/png,image/webp" }) {
  const inputRef = useRef(null);
  const [focused, setFocused] = useState(true);
  const [fileName, setFileName] = useState(value?.name || "");

  useEffect(() => {
    setFileName(value?.name || "");
  }, [value]);

  const handleInputChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setFileName(file ? file.name : "");
    onChange({ target: { name: "category_image", files: file ? [file] : null } });
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
        <span className="text-blue-gray-700 text-sm truncate">{fileName || `Choose ${label.toLowerCase()}...`}</span>
        {fileName && (
          <button
            type="button"
            className="ml-auto rounded-full p-1 hover:bg-red-100"
            onClick={(e) => {
              e.stopPropagation();
              setFileName("");
              if (inputRef.current) inputRef.current.value = "";
              onChange({ target: { name: "category_image", files: null } });
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

export default function EditCategory({ open, handleOpenClose, categoryId, refresh }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    category_name: "",
    description: "",
    category_image: null,
  });

  const [existingImage, setExistingImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  // Fetch category data
  useEffect(() => {
    if (!open || !categoryId) return;

    setIsLoading(true);
    api
      .get(`categories/${categoryId}/`)
      .then((res) => {
        setForm({
          category_name: res.data.data.category_name,
          description: res.data.data.description,
          category_image: null,
        });
        setExistingImage(res.data.data.category_image);
      })
      .catch(() => toast.error("Error loading category"))
      .finally(() => setIsLoading(false));
  }, [categoryId, open]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "category_image") {
      setForm((prev) => ({ ...prev, category_image: files && files.length ? files[0] : null }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const imageUrl = existingImage
    ? `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${existingImage.replace(/^\//, "")}`
    : null;

  // Submit update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      payload.append("category_name", form.category_name);
      payload.append("description", form.description);
      if (form.category_image) payload.append("category_image", form.category_image);

      await api.put(`categories/${categoryId}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Category updated successfully!");
      refresh?.();
      handleOpenClose(false);
    } catch (err) {
      console.error(err);
      toast.error("Error updating category");
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
                  fullWidth
                />
              </div>

              <div className="md:col-span-1">
                <StyledFileInput
                  label="Category Image"
                  value={form.category_image}
                  onChange={handleChange}
                  required={false}
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
                  rows={6}
                  fullWidth
                />
              </div>

              {imageUrl && !form.category_image && (
                <div className="md:col-span-2">
                  <p className="mb-2 font-medium">Current Image:</p>
                  <img
                    src={imageUrl}
                    alt="Category"
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
            className="flex items-center justify-center gap-2"
          >
            {isSubmitting ? <Spinner size="sm" color="white" /> : "Update Category"}
          </Button>
        </DialogFooter>
      </Card>
    </Dialog>
  );
}
