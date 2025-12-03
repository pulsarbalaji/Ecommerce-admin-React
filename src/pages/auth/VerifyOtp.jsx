import React, { useState, useEffect, useRef } from "react";
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
  const { session_id, email, password } = location.state || {};
  const { login } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [isResending, setIsResending] = useState(false);

  const otpInputRef = useRef(null);

  // redirect if session missing
  useEffect(() => {
    if (!session_id) navigate("/auth/sign-in");
  }, [session_id, navigate]);

  // focus input when loaded
  useEffect(() => {
    if (otpInputRef.current) otpInputRef.current.focus();
  }, []);

  // countdown effect
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // verify OTP
  const handleVerify = async (otpValue = otp) => {
    if (otpValue.length < 6) return; // skip incomplete OTP
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/verifyloginotp/", { session_id, otp: otpValue });

      login({
        access: res.data.access,
        refresh: res.data.refresh,
        admin: res.data.admin,
      });

      toast.success("Login successful!");
      navigate("/dashboard/home");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Invalid or expired OTP. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // resend OTP
  const handleResend = async () => {
    if (resendTimer > 0) return;

    setIsResending(true);
    try {
      const response = await api.post("/adminlogin/", { email, password });
      const data = response.data;

      if (data?.session_id) {
        navigate("/auth/verify-otp", {
          state: { session_id: data.session_id, email, password },
        });
        toast.success("OTP resent to your WhatsApp!");
        setResendTimer(60);
        setOtp("");
      }
    } catch {
      toast.error("Failed to resend OTP. Try again.");
    } finally {
      setIsResending(false);
    }
  };

  // only numeric input, auto submit on 6 digits
  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // keep only digits
    setOtp(value);
    if (value.length === 6) {
      handleVerify(value);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row min-h-screen">
      {/* Left Section */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20">
        <div className="text-center mb-10 animate-fadeIn">
          <Typography variant="h2" className="font-bold mb-2">
            Verify OTP
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter the 6-digit code sent to your WhatsApp number.
          </Typography>
        </div>

        <Card className="w-full max-w-md p-8 shadow-lg relative rounded-2xl transition-all duration-300">
          {(loading || isResending) && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-2xl">
              <Spinner color="blue" className="w-10 h-10" />
            </div>
          )}

          <form className="flex flex-col gap-6" onSubmit={(e) => e.preventDefault()}>
            {error && (
              <Typography color="red" className="text-sm text-center">
                {error}
              </Typography>
            )}

            <Input
              label="Enter OTP"
              inputRef={otpInputRef}
              type="text"
              maxLength={6}
              value={otp}
              onChange={handleOtpChange}
              required
              className="text-center text-2xl tracking-[0.4em] font-semibold"
              autoFocus
            />

            <Button
              type="button"
              onClick={() => handleVerify(otp)}
              className="mt-4 w-full"
              disabled={loading || otp.length < 6}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </Button>
          </form>

          {/* Resend Section */}
          <div className="text-center mt-4">
            {resendTimer > 0 ? (
              <Typography variant="small" color="gray">
                You can resend OTP in{" "}
                <span className="font-semibold text-blue-600">
                  {resendTimer}s
                </span>
              </Typography>
            ) : (
              <Typography
                variant="small"
                color="gray"
                className="cursor-pointer hover:text-blue-600 transition-all duration-200"
                onClick={handleResend}
              >
                Didn’t receive OTP? <span className="text-blue-600 font-medium">Resend</span>
              </Typography>
            )}
          </div>
        </Card>
      </div>

      {/* Right Section */}
      {/* <div
        className="hidden lg:block lg:flex-1"
        style={{
          backgroundImage: "url('/img/cart.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      ></div> */}
    </section>
  );
};

export default VerifyOtp;
