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
          className={`h-5 w-5 ${
            i <= rating ? "text-yellow-500" : "text-gray-300"
          }`}
        />
      );
    }
    return stars;
  };

  return (
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg max-h-[80vh] overflow-hidden">
        <DialogHeader className="justify-center sticky top-0 bg-white z-10 pb-2 border-b">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            View Variant
          </Typography>
        </DialogHeader>

        <DialogBody className="overflow-y-auto max-h-[60vh] pr-2">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : variant ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Variant Name:</strong> {variant.product_name}</p>
              </div>

              <div>
                <p><strong>Parent Product:</strong> {variant.parent_name || "—"}</p>
              </div>

              <div>
                <p><strong>Category:</strong> {variant.category_name || "N/A"}</p>
              </div>

              <div>
                <p><strong>Price:</strong> ₹{variant.price}</p>
              </div>

              <div>
                <p>
                  <strong>Quantity:</strong>{" "}
                  {variant.quantity} {variant.quantity_unit?.toUpperCase()}
                </p>
              </div>

              <div>
                <p><strong>Stock:</strong> {variant.stock_quantity}</p>
              </div>

              {/* ⭐ Rating */}
              <div className="flex flex-col">
                <p><strong>Rating:</strong></p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(Math.round(variant.average_rating || 0))}</div>
                  <span className="text-yellow-600 font-semibold">
                    {Number(variant.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="md:col-span-2">
                <p><strong>Description:</strong> {variant.product_description || "—"}</p>
              </div>

              {imageUrl && (
                <div className="md:col-span-2">
                  <p><strong>Variant Image:</strong></p>
                  <img
                    src={imageUrl}
                    alt="Variant"
                    className="w-full max-w-xs h-auto object-cover rounded-md border border-gray-300 mt-2"
                  />
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>

        <div className="flex justify-center mt-4">
          <Button color="secondary" variant="outlined" onClick={goBack}>
            Back
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}
