import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Card,
  Typography,
  Spinner,
  Button,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";
import { StarIcon } from "@heroicons/react/24/solid";

export default function ViewVariant({ open, handleOpenClose, variantId }) {
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!open || !variantId) return;

    const fetchVariant = async () => {
      setLoading(true);
      try {
        const res = await api.get(`productvariant/${variantId}/`);
        const data = res.data.data;
        setVariant(data);

        if (data.product_image) {
          setImageUrl(
            `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${data.product_image.replace(
              /^\//,
              ""
            )}`
          );
        }
      } catch (err) {
        console.error("Error fetching variant:", err);
        setError("Failed to load variant details.");
        toast.error("Error loading variant");
      } finally {
        setLoading(false);
      }
    };

    fetchVariant();
  }, [variantId, open]);

  const goBack = () => handleOpenClose(false);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${i <= rating ? "text-yellow-500" : "text-gray-300"}`}
        />
      );
    }
    return stars;
  };

  return (
    <Dialog
      open={open}
      handler={handleOpenClose}
      size="md"
      className="max-h-[85vh] overflow-hidden"
    >
      <Card className="p-6 rounded-2xl shadow-lg">
        {/* Sticky Header */}
        <DialogHeader className="justify-center sticky top-0 bg-white z-10 border-b pb-2">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            View Variant 
          </Typography>
        </DialogHeader>

        {/* Scrollable Body */}
        <DialogBody className="overflow-y-auto max-h-[65vh] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : variant ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">
              <div>
                <p>
                  <strong>Variant Name:</strong> {variant.product_name || "—"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Parent Product:</strong> {variant.parent_name || "—"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Category:</strong> {variant.category_name || "N/A"}
                </p>
              </div>

              <div>
                <p>
                  <strong>Price:</strong> ₹{variant.price}
                </p>
              </div>

              <div>
                <p>
                  <strong>Quantity:</strong>{" "}
                  {variant.quantity} {variant.quantity_unit?.toUpperCase() || ""}
                </p>
              </div>

              <div>
                <p>
                  <strong>Stock:</strong> {variant.stock_quantity}
                </p>
              </div>

              {/* ⭐ Rating */}
              <div className="flex flex-col">
                <p>
                  <strong>Rating:</strong>
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">
                    {renderStars(Math.round(variant.average_rating || 0))}
                  </div>
                  <span className="text-yellow-600 font-semibold">
                    {Number(variant.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 📝 Description */}
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div
                  className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
                >
                  {variant.product_description || "No description available."}
                </div>
              </div>

              {/* 🖼 Variant Image */}
              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Variant Image:</p>
                  <div className="w-72 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Variant"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>

        {/* Footer Button */}
        <div className="flex justify-center sticky bottom-0 bg-white pt-4 border-t mt--1">
          <Button color="blue-gray" variant="outlined" onClick={goBack}>
            Back
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}
