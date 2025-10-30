import React, { useEffect, useState } from "react";
import { Card, Typography, Input, Button } from "@material-tailwind/react";
import toast from "react-hot-toast";
import api from "@/utils/base_url";

export default function CourierSetting() {
    const [courierCharge, setCourierCharge] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCourierCharge = async () => {
        try {
            const res = await api.get("settings/courier-charge/");
            setCourierCharge(res.data.courier_charge);
        } catch (err) {
            toast.error("Failed to load courier charge");
        }
    };

    useEffect(() => {
        fetchCourierCharge();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!courierCharge) {
            toast.error("Please enter courier charge");
            setLoading(false);
            return;
        }

        try {
            await api.put("settings/courier-charge/", { courier_charge: courierCharge });
            toast.success("Courier charge updated ✅");
        } catch (err) {
            toast.error("Failed to update courier charge");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-[80vh]">
            <Card className="w-full max-w-lg p-8 rounded-2xl shadow-lg">
                <Typography variant="h5" className="text-center font-semibold mb-6">
                    Courier Charge Settings
                </Typography>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Courier Charge"
                        type="number"
                        value={courierCharge}
                        min={0}
                        max={500}
                        onChange={(e) => {
                            let v = e.target.value;

                            // Allow only digits & decimal
                            if (!/^\d*\.?\d*$/.test(v)) return;

                            // Allow empty field
                            if (v === "") {
                                setCourierCharge("");
                                return;
                            }

                            const num = parseFloat(v);

                            // Allow only 0–500 range
                            if (num >= 0 && num <= 500) {
                                setCourierCharge(v);
                            }
                        }}
                        required
                    />


                    <Button type="submit" color="gray" fullWidth disabled={loading}>
                        {loading ? "Updating..." : "Update Courier Charge"}
                    </Button>
                </form>
            </Card>
        </div>
    );
}
