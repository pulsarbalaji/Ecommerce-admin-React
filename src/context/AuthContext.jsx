import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    access: null,
    refresh: null,
    admin: null,
  });

  // ✅ Always load from sessionStorage only
  useEffect(() => {
    const storedAccess = sessionStorage.getItem("access");
    const storedRefresh = sessionStorage.getItem("refresh");
    const storedAdmin = sessionStorage.getItem("admin");

    if (storedAccess && storedRefresh && storedAdmin) {
      setAuthData({
        access: storedAccess,
        refresh: storedRefresh,
        admin: JSON.parse(storedAdmin),
      });
    }
  }, []);

  // ✅ Mandatory sessionStorage
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

// ✅ Custom hook
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
