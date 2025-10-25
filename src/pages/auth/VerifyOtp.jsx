import React, { useState } from "react";
import {
    Card,
    Input,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/base_url";
import { toast } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const VerifyOtp = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { session_id, email } = location.state || {};
    const { login } = useAuth(); // ✅ use context login

    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!session_id) {
        navigate("/auth/sign-in");
    }

    const handleVerify = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await api.post("/verifyloginotp/", { session_id, otp });

            login({
                access: res.data.access,
                refresh: res.data.refresh,
                admin: res.data.admin,
            });

            toast.success("Login successful!");
            navigate("/dashboard/home");
        } catch (err) {
            setError(
                err.response?.data?.detail || "Invalid or expired OTP. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };


    const handleResend = async () => {
        setLoading(true);
        try {
            await api.post("/resendloginotp/", { email });
            toast.success("OTP resent to your WhatsApp!");
        } catch (err) {
            toast.error("Failed to resend OTP. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="flex flex-col lg:flex-row min-h-screen">
            <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20">
                <div className="text-center mb-10">
                    <Typography variant="h2" className="font-bold mb-2">
                        Verify OTP
                    </Typography>
                    <Typography variant="paragraph" color="blue-gray" className="text-lg font-normal">
                        Enter the 6-digit code sent to your WhatsApp number.
                    </Typography>
                </div>

                <Card className="w-full max-w-md p-8 shadow-lg relative rounded-2xl">
                    {loading && (
                        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-2xl">
                            <Spinner color="blue" className="w-10 h-10" />
                        </div>
                    )}

                    <form className="flex flex-col gap-6" onSubmit={handleVerify}>
                        {error && (
                            <Typography color="red" className="text-sm text-center">
                                {error}
                            </Typography>
                        )}

                        <Input
                            label="Enter OTP"
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            className="text-center text-lg tracking-widest"
                        />

                        <Button type="submit" className="mt-4 w-full" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>

                    <Typography
                        variant="small"
                        color="gray"
                        className="text-center mt-4 cursor-pointer hover:text-blue-600"
                        onClick={handleResend}
                    >
                        Didn’t receive OTP? Resend
                    </Typography>
                </Card>
            </div>

            <div
                className="hidden lg:block lg:flex-1"
                style={{
                    backgroundImage: "url('/img/cart.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            ></div>
        </section>
    );
};

export default VerifyOtp;
