import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth } from "@/layouts";
import ProtectedRoute from "./ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import VerifyOtp from "./pages/auth/VerifyOtp";
import ScrollToTop from "./widgets/layout/ScrollToTop";

function App() {
  const { authData } = useAuth();
  const isAuthenticated = !!authData?.access;

  return (
    <>
      <ScrollToTop/>
    <Routes>
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/auth/*" element={<Auth />} />
      <Route path="/auth/verify-otp" element={<VerifyOtp />} />

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard/home" replace />
          ) : (
            <Navigate to="/auth/sign-in" replace />
          )
        }
      />
    
    </Routes>
    </>
  );
}

export default App;
