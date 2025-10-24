import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
  Spinner,
  IconButton,
} from "@material-tailwind/react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "@/utils/base_url";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";

const ResetPassword = () => {
  const { uid, token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pw) => {
    const minLength = 6;
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&-])[A-Za-z\d@$!%*?&-]{6,}$/;
    if (pw.length < minLength) {
      return "Password must be at least 6 characters long.";
    }
    if (!regex.test(pw)) {
      return "Password must contain 1 uppercase, 1 lowercase, 1 number, and 1 special character.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate password
    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Confirm password match
    if (password !== confirm) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await api.post("set-password/", {
        uid,
        token,
        new_password: password,
      });
      toast.success("Password reset successful!");
      navigate("/auth/sign-in");
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-50">
      <Card className="p-8 w-full max-w-md shadow-lg rounded-2xl">
        <Typography variant="h4" color="blue-gray" className="text-center mb-6">
          Reset Password 🔐
        </Typography>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative w-full">

          <Input
            label="New Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!error}
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
          <Input
            label="Confirm Password"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            error={!!error}
          />
          {error && (
            <Typography variant="small" color="red" className="mt-1">
              {error}
            </Typography>
          )}

          <Button
            type="submit"
            color="gray"
            fullWidth
            disabled={loading}
            className="flex justify-center items-center"
          >
            {loading ? <Spinner color="white" size="sm" /> : "Reset Password"}
          </Button>
        </form>

        <Typography variant="small" color="blue-gray" className="mt-6 text-center">
          Back to{" "}
          <Link to="/auth/sign-in" className="text-gray-700 font-semibold">
            Sign in
          </Link>
        </Typography>
      </Card>
    </div>
  );
};

export default ResetPassword;
