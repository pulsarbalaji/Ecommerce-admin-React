import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authData } = useAuth();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Small delay to simulate loading
    setTimeout(() => setIsChecking(false), 100);
  }, []);

  if (isChecking) return null; // Prevent early redirect flicker
  if (!authData?.access) return <Navigate to="/auth/sign-in" replace />;
  return children;
};

export default ProtectedRoute;
