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
import { StarIcon } from "@heroicons/react/24/solid";

export default function ViewReview({ open, handleOpenClose, reviewId }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!open || !reviewId) return;

        const fetchReview = async () => {
            setLoading(true);
            try {
                const res = await api.get(`admin-feedback/${reviewId}/`);
                setReview(res.data.data);
            } catch (err) {
                console.error("Error loading review", err);
            } finally {
                setLoading(false);
            }
        };

        fetchReview();
    }, [open, reviewId]);

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <StarIcon
                key={i}
                className={`h-5 w-5 ${i < rating ? "text-yellow-500" : "text-gray-300"}`}
            />
        ));
    };

    return (
        <Dialog open={open} handler={handleOpenClose} size="md">
            <Card className="p-6 rounded-2xl shadow-lg">

                <DialogHeader className="justify-center">
                    <Typography variant="h5" className="font-semibold">
                        Review Details
                    </Typography>
                </DialogHeader>

                {/* Scroll Body */}
                <DialogBody className="overflow-y-auto max-h-[65vh] pr-2">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <Spinner color="blue" />
                        </div>
                    ) : review ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-800">

                            {/* Product */}
                            <div>
                                <p className="font-semibold text-sm text-gray-700">Product</p>
                                <p className="mt-1">{review.product_name}</p>
                            </div>

                            {/* Reviewer */}
                            <div>
                                <p className="font-semibold text-sm text-gray-700">Reviewer</p>
                                <p className="mt-1">{review.user_name}</p>
                            </div>

                            {/* Rating */}
                            <div>
                                <p className="font-semibold text-sm text-gray-700">Rating</p>
                                <div className="flex items-center gap-2 mt-1">
                                    {renderStars(review.rating)}
                                    <span className="text-yellow-700 font-semibold">
                                        {review.rating}
                                    </span>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="font-semibold text-sm text-gray-700">Status</p>
                                <p className="mt-1">
                                    {review.is_approved ? (
                                        <span className="text-green-600 font-medium">Approved</span>
                                    ) : (
                                        <span className="text-orange-600 font-medium">Pending</span>
                                    )}
                                </p>
                            </div>

                            {/* Comment - Full width */}
                            <div className="md:col-span-2">
                                <p className="font-medium mb-2">Comment:</p>
                                <div
                                    className="border border-gray-200 rounded-lg bg-gray-50 p-3 text-gray-800 text-sm 
    leading-relaxed whitespace-pre-wrap 
    max-h-56 overflow-y-auto 
    scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
                                    style={{ wordBreak: "break-word" }}
                                >
                                    {review.comment || "No comment available"}
                                </div>

                            </div>

                            {/* Date - Full width */}
                            <div className="md:col-span-2">
                                <p className="font-semibold text-sm text-gray-700">Date</p>
                                <p className="mt-1">
                                    {new Date(review.created_at).toLocaleString()}
                                </p>
                            </div>
                        </div>
                    ) : null}
                </DialogBody>

                <div className="flex justify-center mt-4">
                    <Button variant="outlined" color="blue-gray" onClick={() => handleOpenClose(false)}>
                        Close
                    </Button>
                </div>
            </Card>
        </Dialog>
    );
}
