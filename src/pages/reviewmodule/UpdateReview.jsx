import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogHeader,
    DialogBody,
    Button,
    Select,
    Option,
    Spinner,
    Typography,
} from "@material-tailwind/react";
import api from "@/utils/base_url";
import toast from "react-hot-toast";

export default function UpdateReviewStatus({ reviewId, open, handleOpenClose, refresh }) {
    const [review, setReview] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const statusOptions = [
        { value: "approve", label: "Approved" },
        { value: "reject", label: "Rejected" },
    ];

    const fetchReview = async () => {
        setLoading(true);

        try {
            const res = await api.get(`admin-feedback/${reviewId}/`);
            setReview(res.data.data);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load review");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async () => {
        if (!review || !review.action) {
            toast.error("Please select Approved / Rejected");
            return;
        }

        setUpdating(true);
        try {
            await api.post(`admin-approval/${reviewId}/`, {
                action: review.action,
            });

            toast.success("Review status updated");
            if (refresh) refresh();
            handleOpenClose(false);
        } catch (err) {
            console.error(err);
            toast.error("Failed to update review");
        } finally {
            setUpdating(false);
        }
    };

    useEffect(() => {
        if (open && reviewId) fetchReview();
    }, [open, reviewId]);

    return (
        <Dialog size="md" open={open} handler={handleOpenClose}>
            <DialogHeader className="flex justify-center">
                <Typography variant="h5" className="font-semibold">
                    Update Review Status
                </Typography>
            </DialogHeader>

            <DialogBody divider className="max-h-[70vh] overflow-y-auto">
                {loading ? (
                    <div className="flex justify-center py-10">
                        <Spinner color="blue" />
                    </div>
                ) : review ? (
                    <div className="space-y-5">

                        {/* Review Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <strong>Product:</strong> {review.product_name}
                            </div>
                            <div>
                                <strong>Reviewer:</strong> {review.user_name}
                            </div>
                            <div>
                                <strong>Rating:</strong> {review.rating} ⭐
                            </div>
                            <div>
                                <strong>Status:</strong>{" "}
                                {review.is_approved ? "Approved" : "Pending"}
                            </div>
                        </div>

                        {/* Comment */}
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

                        {/* Select Approve / Reject */}
                        <div className="flex justify-center">
                            <div className="w-64">
                                <Select
                                    label="Select Action"
                                    value={review.action}
                                    onChange={(val) => setReview({ ...review, action: val })}
                                >
                                    {statusOptions.map((s) => (
                                        <Option key={s.value} value={s.value}>
                                            {s.label}
                                        </Option>
                                    ))}
                                </Select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-center gap-3">
                            <Button
                                variant="outlined"
                                color="red"
                                onClick={() => handleOpenClose(false)}
                            >
                                Cancel
                            </Button>

                            <Button
                                color="gray"
                                onClick={updateStatus}
                                disabled={updating}
                                loading={updating}
                            >
                                Update
                            </Button>
                        </div>
                    </div>
                ) : null}
            </DialogBody>
        </Dialog>
    );
}
