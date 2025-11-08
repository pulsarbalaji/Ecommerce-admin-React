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

export default function ViewProduct({ open, handleOpenClose, productId }) {
  const [product, setProduct] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!open || !productId) return;

    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await api.get(`product/${productId}/`);
        const data = res.data.data;
        setProduct(data);

        if (data.category) {
          try {
            const categoryRes = await api.get(`categories/${data.category}/`);
            setCategoryName(categoryRes.data.data.category_name);
          } catch {
            setCategoryName("N/A");
          }
        }

        if (data.product_image) {
          setImageUrl(
            `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${data.product_image.replace(
              /^\//,
              ""
            )}`
          );
        }
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product details.");
        toast.error("Error loading product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId, open]);

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
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg max-h-[80vh] overflow-hidden">
        <DialogHeader className="justify-center sticky top-0 bg-white z-10 pb-2 border-b">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            View Product
          </Typography>
        </DialogHeader>

        <DialogBody className="overflow-y-auto max-h-[60vh] pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : product ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p><strong>Product Name:</strong> {product.product_name}</p>
              </div>

              <div>
                <p><strong>Category:</strong> {categoryName || "N/A"}</p>
              </div>

              <div>
                <p><strong>Price:</strong> ₹{product.price}</p>
              </div>

              <div>
                <p>
                  <strong>Quantity:</strong>{" "}
                  {product.quantity} {product.quantity_unit?.toUpperCase()}
                </p>
              </div>

              <div>
                <p><strong>Stock:</strong> {product.stock_quantity}</p>
              </div>

              {/* ⭐ Rating UI */}
              <div className="flex flex-col">
                <p><strong>Rating:</strong></p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex">{renderStars(Math.round(product.average_rating || 0))}</div>
                  <span className="text-yellow-600 font-semibold">
                    {Number(product.average_rating || 0).toFixed(1)}
                  </span>
                </div>
              </div>

              {/* 📝 Scrollable Description */}
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div
                  className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
                >
                  {product.product_description || "No description available."}
                </div>
              </div>

              <div>
                <p><strong>Created By:</strong> {product.created_by_name || "—"}</p>
              </div>

              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Product Image:</p>
                  <div className="w-72 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </DialogBody>

        <div className="flex justify-center mt-4">
          <Button color="blue-gray" variant="outlined" onClick={goBack}>
            Back
          </Button>
        </div>
      </Card>
    </Dialog>
  );
}
