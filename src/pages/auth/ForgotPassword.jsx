import React, { useState } from "react";
import {
    Card,
    Input,
    Button,
    Typography,
    Spinner,
} from "@material-tailwind/react";
import { Link } from "react-router-dom";
import api from "@/utils/base_url";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(""); // <-- Add error state

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(""); // Reset error

        try {
            const response = await api.post("forgot-password/", { email });

            if (response.data.status) {
                setSuccess(true);
            } else {
                setError(response.data.message || "Something went wrong");
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Server error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-50">
            <Card className="p-8 w-full max-w-md shadow-lg rounded-2xl">
                <Typography variant="h4" color="blue-gray" className="text-center mb-6">
                    Forgot Password 🔒
                </Typography>

                {success ? (
                    <Typography color="green" className="text-center">
                        Please check your email for reset instructions.
                    </Typography>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <Input
                                label="Email Address"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                error={!!error} // <-- highlight input if error
                            />
                            {error && (
                                <Typography variant="small" color="red" className="mt-1">
                                    {error}
                                </Typography>
                            )}
                        </div>

                        <Button
                            type="submit"
                            color="gray"
                            fullWidth
                            disabled={loading}
                            className="flex justify-center items-center"
                        >
                            {loading ? <Spinner color="white" size="sm" /> : "Send Reset Link"}
                        </Button>
                    </form>
                )}

                <Typography
                    variant="small"
                    color="blue-gray"
                    className="mt-6 text-center"
                >
                    Remember your password?{" "}
                    <Link to="/auth/sign-in" className="text-gray-700 font-semibold">
                        Sign in
                    </Link>
                </Typography>
            </Card>
        </div>
    );
};

export default ForgotPassword;
