import React, { useEffect, useState } from "react";
import { Card, Typography, Input, Button, Spinner } from "@material-tailwind/react";
import toast from "react-hot-toast";
import api from "@/utils/base_url";

export default function SettingsPage() {
  const [gst, setGst] = useState("");
  const [courierCharge, setCourierCharge] = useState("");
  const [loading, setLoading] = useState({ gst: false, courier: false });

  // ✅ Fetch both settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [gstRes, courierRes] = await Promise.all([
          api.get("settings/gst/"),
          api.get("settings/courier-charge/"),
        ]);

        setGst(gstRes.data?.gst_percentage ?? "");
        setCourierCharge(courierRes.data?.courier_charge ?? "");
      } catch (err) {
        toast.error("Failed to load settings ⚠️");
      }
    };
    fetchSettings();
  }, []);

  // ✅ Update GST
  const handleGstSubmit = async () => {
    if (!gst) return toast.error("Please enter GST value");

    setLoading((prev) => ({ ...prev, gst: true }));
    try {
      await api.put("settings/gst/", { gst_percentage: gst });
      toast.success("GST updated successfully ");
    } catch {
      toast.error("Failed to update GST");
    } finally {
      setLoading((prev) => ({ ...prev, gst: false }));
    }
  };

  // ✅ Update Courier Charge
  const handleCourierSubmit = async () => {
    if (!courierCharge) return toast.error("Please enter courier charge");

    setLoading((prev) => ({ ...prev, courier: true }));
    try {
      await api.put("settings/courier-charge/", { courier_charge: courierCharge });
      toast.success("Courier charge updated successfully");
    } catch {
      toast.error("Failed to update courier charge");
    } finally {
      setLoading((prev) => ({ ...prev, courier: false }));
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-3xl p-8 rounded-2xl shadow-lg">
        <Typography variant="h5" className="text-center font-semibold mb-8">
          Master Data Settings
        </Typography>

        <div className="grid grid-cols-1 gap-6">
          {/* --- GST Row --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Typography variant="h6" className="text-gray-800 font-medium">
              GST Setting
            </Typography>
            <Input
              label="GST Percentage (%)"
              type="number"
              value={gst}
              min={0}
              max={99}
              onChange={(e) => {
                let v = e.target.value;
                if (!/^\d*\.?\d*$/.test(v)) return;
                if (v === "") setGst("");
                else {
                  const num = parseFloat(v);
                  if (num >= 0 && num <= 99) setGst(v);
                }
              }}
              required
            />
            <Button
              color="gray"
              onClick={handleGstSubmit}
              disabled={loading.gst}
              className="flex justify-center items-center"
            >
              {loading.gst ? <Spinner color="white" size="sm" /> : "Update GST"}
            </Button>
          </div>

          {/* --- Courier Charge Row --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
            <Typography variant="h6" className="text-gray-800 font-medium">
              Courier Charge Settings
            </Typography>
            <Input
              label="Courier Charge"
              type="number"
              value={courierCharge}
              min={0}
              max={500}
              onChange={(e) => {
                let v = e.target.value;
                if (!/^\d*\.?\d*$/.test(v)) return;
                if (v === "") setCourierCharge("");
                else {
                  const num = parseFloat(v);
                  if (num >= 0 && num <= 500) setCourierCharge(v);
                }
              }}
              required
            />
            <Button
              color="gray"
              onClick={handleCourierSubmit}
              disabled={loading.courier}
              className="flex justify-center items-center"
            >
              {loading.courier ? <Spinner color="white" size="sm" /> : "Update Courier"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
