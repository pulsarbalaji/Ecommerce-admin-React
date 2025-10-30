import React, { useState, useRef, useEffect } from "react";
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
import api from "@/utils/base_url";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

// Styled file input with proper file name display and clearing
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
        onChange({ target: { name: "category_image", files: file ? [file] : null } });
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
                            onChange({ target: { name: "category_image", files: null } });
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





export default function AddCategory({ open, handleOpenClose, refresh }) {
    const { authData } = useAuth();
      const admin = authData?.admin;

    const [form, setForm] = useState({
        category_name: "",
        description: "",
        category_image: null,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);

    const resetForm = () => {
        setForm({
            category_name: "",
            description: "",
            category_image: null,
        });
    };

    // Automatically reset when modal closes
    useEffect(() => {
        if (!open) {
            resetForm();
            setIsSubmitting(false);
            setIsCancelling(false);
        }
    }, [open]);

    // Handle input changes
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "description" && value.length > 3000) {
            toast.error("Description cannot exceed 3000 characters.");
            return;
        }
        if (name === "category_image") {
            setForm((prev) => ({ ...prev, category_image: files && files.length ? files[0] : null }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
    };

    // Validation
    const validateForm = () => {
        if (!form.category_name) {
            toast.error("Category name is required");
            return false;
        }
        if (!form.category_image) {
            toast.error("Category image is required");
            return false;
        }
        if (
            form.category_image &&
            !["image/jpeg", "image/png", "image/webp"].includes(form.category_image.type)
        ) {
            toast.error("Only JPEG, PNG or WEBP images are allowed");
            return false;
        }
        if (form.category_image && form.category_image.size > 2 * 1024 * 1024) {
            toast.error("Image must be less than 2MB");
            return false;
        }
        return true;
    };

    // Submit form
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            const payload = new FormData();
            payload.append("category_name", form.category_name);
            payload.append("description", form.description);
            payload.append("created_by", admin.user_id);
            if (form.category_image)
                payload.append("category_image", form.category_image);

            const res = await api.post("categories/", payload, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            // ✅ Success
            toast.success(res.data?.message || "Category added successfully!");
            setTimeout(() => {
                handleOpenClose(false);
                refresh?.();
            }, 1000);
            setForm({ category_name: "", description: "", category_image: null });
        } catch (err) {
            console.error("Error adding category:", err);

            // ✅ Get detailed backend error message
            const errorMessage =
                err.response?.data?.message ||
                err.response?.data?.errors ||
                "Failed to add category.";

            // If backend sends {status:false,message:"Category already exists"}
            if (typeof errorMessage === "string") {
                toast.error(errorMessage);
            } else if (typeof errorMessage === "object") {
                // Handle serializer validation errors
                const firstError = Object.values(errorMessage)[0];
                toast.error(Array.isArray(firstError) ? firstError[0] : firstError);
            } else {
                toast.error("Something went wrong. Please try again.");
            }
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
                        Add Category
                    </Typography>
                </DialogHeader>

                <DialogBody>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category Name */}
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

                        {/* Category Image */}
                        <div className="md:col-span-1">
                            <StyledFileInput
                                label="Category Image"
                                value={form.category_image}
                                onChange={handleChange}
                                required
                                error={
                                    form.category_image &&
                                    !["image/jpeg", "image/png", "image/webp"].includes(form.category_image.type)
                                }
                                helperText="Only JPEG, PNG, or WEBP images allowed"
                            />
                        </div>

                        {/* Description - spans both columns */}
                        <div className="md:col-span-2">
                            <Textarea
                                label="Description"
                                name="description"
                                value={form.description}
                                onChange={handleChange}
                                rows={4}
                                maxLength={3000}
                                fullWidth
                            />
                            <Typography
                                variant="small"
                                color="gray"
                                className="text-right mt-1 text-xs"
                            >
                                {form.description.length}/3000
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
                        type="submit"
                        onClick={handleSubmit}
                        color="gray"
                        disabled={isSubmitting || isCancelling}
                        className="flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? <Spinner size="sm" color="white" /> : "Add Category"}
                    </Button>
                </DialogFooter>
            </Card>
        </Dialog>
    );
}
