import React, { createContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    access: null,
    refresh: null,
    admin: null,
  });

  // ✅ Load from sessionStorage on app start
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

  // ✅ Login function (store in state + session)
  const login = (data) => {
    sessionStorage.setItem("access", data.access);
    sessionStorage.setItem("refresh", data.refresh);
    sessionStorage.setItem("admin", JSON.stringify(data.admin));
    setAuthData(data);
  };

  // ✅ Logout function
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

export default AuthContext;
