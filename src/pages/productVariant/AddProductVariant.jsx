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

/* ✅ Styled File Input (same as AddProduct) */
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
                            onChange({ target: { name: "product_image", files: null } });
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

/* ✅ Add Product Variant Component */
export default function AddProductVariant({ open, handleOpenClose, refresh }) {
    const { authData } = useAuth();
    const admin = authData?.admin;

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

    /* ✅ Fetch main products for dropdown */
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

    /* ✅ Validation */
    const validateForm = () => {
        const newErrors = {};
        if (!form.parent) newErrors.parent = "Main product is required.";
        if (!form.product_name.trim()) newErrors.product_name = "Variant name is required.";
        if (!form.price || parseFloat(form.price) <= 0)
            newErrors.price = "Price must be greater than zero.";
        if (!form.stock_quantity) newErrors.stock_quantity = "Stock quantity is required.";

        if (!form.quantity) newErrors.quantity = "Quantity is required.";
        else if (parseFloat(form.quantity) < 0)
            newErrors.quantity = "Quantity cannot be negative.";

        if (!form.quantity_unit) newErrors.quantity_unit = "Quantity unit is required.";
        if (!form.product_image) newErrors.product_image = "Variant image is required.";

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) {
            toast.error(Object.values(newErrors)[0]);
            return false;
        }
        return true;
    };

    /* ✅ Handle input changes */
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: name === "product_image" ? (files ? files[0] : null) : value,
        }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    /* ✅ Submit handler */
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
        } catch (err) {
            console.error("Error adding variant:", err);
            toast.error("Failed to add variant.");
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <Select
                                label={
                                    <span>
                                        Select Main Product <span className="text-red-500">*</span>
                                    </span>
                                }
                                onChange={(val) => setForm((prev) => ({ ...prev, parent: val }))}
                                required
                            >
                                {mainProducts.map((prod) => (
                                    <Option key={prod.id} value={String(prod.id)}>
                                        {prod.product_name}
                                    </Option>
                                ))}
                            </Select>
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
                            required
                        />

                        {/* Image */}
                        <StyledFileInput
                            label="Variant Image"
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
                            min="0"
                            max="10000"
                            value={form.price}
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value === "" || (Number(value) >= 0 && Number(value) <= 10000)) {
                                    handleChange(e);
                                }
                            }}
                            onKeyDown={(e) => ["e", "E", "+", "-"].includes(e.key) && e.preventDefault()}
                            required
                        />

                        {/* Quantity + Unit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:col-span-2">
                            <Select
                                label={
                                    <span>
                                        Select Unit <span className="text-red-500">*</span>
                                    </span>
                                }
                                name="quantity_unit"
                                value={form.quantity_unit}
                                onChange={(val) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        quantity_unit: val,
                                        quantity: val === "piece" ? "1" : "",
                                    }))
                                }
                                required
                            >
                                {["ml", "liter", "g", "kg", "piece", "pack"].map((unit) => (
                                    <Option key={unit} value={unit}>
                                        {unit.toUpperCase()}
                                    </Option>
                                ))}
                            </Select>

                            {/* Quantity */}
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

                            {/* Quantity Unit */}

                        </div>

                        <Input
                            label="Stock Quantity"
                            name="stock_quantity"
                            type="number"
                            min="0"
                            max="1000"
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
