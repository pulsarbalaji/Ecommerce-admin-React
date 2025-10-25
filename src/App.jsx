import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import VerifyOtp from "./pages/auth/VerifyOtp";

function App() {
  const { authData } = useAuth();
  const isAuthenticated = !!authData?.access;

  return (
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="*" element={<Navigate to="/dashboard/home" replace />} />
      <Route path="/auth/verify-otp" element={<VerifyOtp />} />
    </Routes>
  );
}

export default App;
