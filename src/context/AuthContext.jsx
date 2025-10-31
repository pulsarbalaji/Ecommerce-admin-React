import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // ✅ Load from sessionStorage immediately (no async delay)
  const storedAccess = sessionStorage.getItem("access");
  const storedRefresh = sessionStorage.getItem("refresh");
  const storedAdmin = sessionStorage.getItem("admin");

  const [authData, setAuthData] = useState({
    access: storedAccess,
    refresh: storedRefresh,
    admin: storedAdmin ? JSON.parse(storedAdmin) : null,
  });

  const login = (data) => {
    sessionStorage.setItem("access", data.access);
    sessionStorage.setItem("refresh", data.refresh);
    sessionStorage.setItem("admin", JSON.stringify(data.admin));
    setAuthData(data);
  };

  const logout = () => {
    sessionStorage.clear();
    setAuthData({ access: null, refresh: null, admin: null });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
