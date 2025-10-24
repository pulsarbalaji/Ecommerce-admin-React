import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Checkbox,
  IconButton,
  Spinner,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import AuthContext from "../../context/AuthContext";
import api from "../../utils/base_url";

export function SignIn() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    remember: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login, authData } = useContext(AuthContext);

  // ✅ Redirect if already logged in
  useEffect(() => {
    if (authData?.access) {
      navigate("/dashboard/home");
    }
  }, [authData, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/adminlogin/", {
        email: form.email,
        password: form.password,
      });

      const data = response.data;

      // ✅ Pass "remember" flag to context
      login(
        {
          access: data.access,
          refresh: data.refresh,
          admin: data.admin,
        },
        form.remember
      );

      navigate("/dashboard/home");
    } catch (err) {
      console.error("Login Error:", err);
      const backendError =
      err.response?.data?.detail ||
      err.response?.data?.non_field_errors?.[0] || // catch DRF-style list
      err.response?.data?.error ||
      "Invalid email or password. Please try again.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col lg:flex-row min-h-screen">
      {/* ===== Left Form Section ===== */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-20">
        <div className="text-center mb-10">
          <Typography variant="h2" className="font-bold mb-2">
            Welcome Admin
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Enter your email and password to sign in.
          </Typography>
        </div>

        <Card className="w-full max-w-md p-8 shadow-lg relative rounded-2xl">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10 rounded-2xl">
              <Spinner color="blue" className="w-10 h-10" />
            </div>
          )}

          <form className="flex flex-col gap-8" onSubmit={handleLogin}>
            {error && (
              <Typography color="red" className="text-sm text-center">
                {error}
              </Typography>
            )}

            {/* Email (floating label) */}
            <Input
              label="Email Address"
              size="lg"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              disabled={loading}
              required
              className="w-full border border-gray-300 focus:border-blue-600 shadow-sm focus:shadow-md rounded-lg transition duration-300 ease-in-out"
            />

            {/* Password (floating label + eye icon) */}
            <div className="relative w-full">
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                size="lg"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                disabled={loading}
                required
                className="w-full border border-gray-300 focus:border-blue-600 shadow-sm focus:shadow-md rounded-lg pr-10 transition duration-300 ease-in-out"
              />
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setShowPassword(!showPassword)}
                className="!absolute !right-3 !top-1/2 !-translate-y-1/2 text-gray-500 hover:text-black"
                type="button"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </IconButton>
            </div>

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between -mt-2">
              <Checkbox
                label="Remember Me"
                name="remember"
                checked={form.remember}
                onChange={handleInputChange}
                disabled={loading}
              />
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button className="mt-2 w-full" type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Sign In"}
            </Button>
          </form>
        </Card>
      </div>

      {/* ===== Right Image Section ===== */}
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
}

export default SignIn;
