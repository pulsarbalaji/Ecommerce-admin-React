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
import { useNavigate } from "react-router-dom";
import api from "@/utils/base_url";

export default function ViewCategory({ open, handleOpenClose, categoryId }) {
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    if (!open || !categoryId) return;

    const fetchCategory = async () => {
      setLoading(true);
      try {
        const res = await api.get(`categories/${categoryId}/`);
        setCategory(res.data.data);
        if (res.data.data.category_image) {
          setImageUrl(
            `${api.defaults.baseURL.replace(/\/api\/?$/, "")}/${res.data.data.category_image.replace(
              /^\//,
              ""
            )}`
          );
        }
      } catch (err) {
        console.error("Error fetching category:", err);
        setError("Failed to load category details.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategory();
  }, [categoryId, open]);

  const goBack = () => handleOpenClose(false);

  return (
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            View Category 
          </Typography>
        </DialogHeader>

        <DialogBody className="max-h-[70vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : category ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p>
                  <strong>Category Name:</strong>{" "}
                  <span className="text-gray-700">{category.category_name}</span>
                </p>
              </div>

              <div>
                <p>
                  <strong>Created By:</strong>{" "}
                  <span className="text-gray-700">{category.created_by_name}</span>
                </p>
              </div>

              {/* Description Section */}
              <div className="md:col-span-2">
                <p className="font-medium mb-2">Description:</p>
                <div
                  className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300"
                >
                  {category.description || "No description available."}
                </div>
              </div>

              {/* Image Section */}
              {imageUrl && (
                <div className="md:col-span-2 flex flex-col items-center mt-4">
                  <p className="mb-2 font-medium">Category Image:</p>
                  <div className="w-72 h-48 border border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                    <img
                      src={imageUrl}
                      alt="Category"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-center mt-6">
            <Button color="blue-gray" variant="outlined" onClick={goBack}>
              Back
            </Button>
          </div>
        </DialogBody>
      </Card>
    </Dialog>
  );
}
