import React, { useEffect, useState } from "react";
import { Card, Typography, Input, Button } from "@material-tailwind/react";
import toast from "react-hot-toast";
import api from "@/utils/base_url";

export default function GSTSetting() {
    const [gst, setGst] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchGST = async () => {
        try {
            const res = await api.get("settings/gst/");
            setGst(res.data.gst_percentage);
        } catch (err) {
            toast.error("Failed to load GST value");
        }
    };

    useEffect(() => {
        fetchGST();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!gst) {
            toast.error("Please enter GST value");
            setLoading(false);
            return;
        }

        try {
            await api.put("settings/gst/", { gst_percentage: gst });
            toast.success("GST updated successfully ✅");
        } catch (err) {
            toast.error("Failed to update GST");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-lg p-8 rounded-2xl shadow-lg">
                <Typography variant="h5" className="text-center font-semibold mb-6">
                    GST Settings
                </Typography>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="GST Percentage (%)"
                        type="number"
                        value={gst}
                        min={0}
                        max={99}
                        onChange={(e) => {
                            let v = e.target.value;

                            // Remove invalid characters
                            if (!/^\d*\.?\d*$/.test(v)) return;

                            // Ensure range 0–99
                            if (v === "") {
                                setGst("");
                            } else {
                                const num = parseFloat(v);
                                if (num >= 0 && num <= 99) {
                                    setGst(v);
                                }
                            }
                        }}
                        required
                    />

                    <Button type="submit" color="gray" fullWidth disabled={loading}>
                        {loading ? "Updating..." : "Update GST"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
