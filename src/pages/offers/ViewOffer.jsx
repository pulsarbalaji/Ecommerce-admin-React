import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Card,
  Typography,
  Spinner,
  Button,
  Chip,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function ViewOffer({ open, handleOpenClose, offerId }) {
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !offerId) return;

    const fetchOffer = async () => {
      setLoading(true);
      try {
        const res = await api.get(`offers/${offerId}/`);
        setOffer(res.data.data);
      } catch (err) {
        console.error("Error fetching offer:", err);
        setError("Failed to load offer details.");
        toast.error("Error loading offer");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId, open]);

  const goBack = () => handleOpenClose(false);

  return (
    <Dialog open={open} handler={handleOpenClose} size="md">
      <Card className="p-6 rounded-2xl shadow-lg">
        <DialogHeader className="justify-center">
          <Typography variant="h5" color="blue-gray" className="font-semibold">
            View Offer 
          </Typography>
        </DialogHeader>

        <DialogBody>
          {loading ? (
            <div className="flex justify-center py-10">
              <Spinner size="lg" color="blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-4">{error}</div>
          ) : offer ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <strong>Offer Name:</strong> {offer.offer_name}
                </p>
              </div>
              <div>
                <p>
                  <strong>Category:</strong> {offer.category_name || "—"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Product:</strong> {offer.product_name || "—"}
                </p>
              </div>
              <div>
                <p>
                  <strong>Offer Percentage:</strong> {offer.offer_percentage}%
                </p>
              </div>
              {offer.start_date && (
                <div>
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(offer.start_date).toLocaleString()}
                  </p>
                </div>
              )}
              {offer.end_date && (
                <div>
                  <p>
                    <strong>End Date:</strong>{" "}
                    {new Date(offer.end_date).toLocaleString()}
                  </p>
                </div>
              )}
              <div>
                <p className="flex items-center">
                  <strong>Status:</strong>
                  <Chip
                    color={offer.is_active ? "green" : "red"}
                    value={offer.is_active ? "Active" : "Inactive"}
                    className="ml-2 text-white text-sm"
                  />
                </p>
              </div>
              {offer.created_at && (
                <div>
                  <p>
                    <strong>Created On:</strong>{" "}
                    {new Date(offer.created_at).toLocaleString()}
                  </p>
                </div>
              )}
              {offer.offer_image && (
                <div className="md:col-span-2">
                  <p>
                    <strong>Offer Image:</strong>
                  </p>
                  <img
                    src={`${api.defaults.baseURL.replace(/\/api\/?$/, "")}${offer.offer_image}`}
                    alt="Offer"
                    className="w-full max-w-xs h-auto object-contain rounded-md border border-gray-300 mt-2"
                  />
                </div>
              )}
            </div>
          ) : null}

          <div className="flex justify-center mt-6">
            <Button color="secondary" variant="outlined" onClick={goBack}>
              Back
            </Button>
          </div>
        </DialogBody>
      </Card>
    </Dialog>
  );
}
