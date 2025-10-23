import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../src/context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { authData } = useAuth();

  // Check access token
  const isAuthenticated = !!authData?.access;

  if (!isAuthenticated) {
    return <Navigate to="/auth/sign-in" replace />;
  }

  return children;
};

export default ProtectedRoute;
