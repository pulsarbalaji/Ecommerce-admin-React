import React, { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authData, setAuthData] = useState({
    access: null,
    refresh: null,
    admin: null,
  });

  useEffect(() => {
    const storedAccess =
      sessionStorage.getItem("access") || localStorage.getItem("access");
    const storedRefresh =
      sessionStorage.getItem("refresh") || localStorage.getItem("refresh");
    const storedAdmin =
      sessionStorage.getItem("admin") || localStorage.getItem("admin");

    if (storedAccess && storedRefresh && storedAdmin) {
      setAuthData({
        access: storedAccess,
        refresh: storedRefresh,
        admin: JSON.parse(storedAdmin),
      });
    }
  }, []);

  // ✅ Login function (stores to correct place)
  const login = (data, remember = false) => {
    const storage = remember ? localStorage : sessionStorage;

    storage.setItem("access", data.access);
    storage.setItem("refresh", data.refresh);
    storage.setItem("admin", JSON.stringify(data.admin));

    setAuthData(data);
  };

  // ✅ Logout function (clears all)
  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setAuthData({ access: null, refresh: null, admin: null });
  };

  return (
    <AuthContext.Provider value={{ authData, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Custom Hook (for easy import)
export const useAuth = () => useContext(AuthContext);

export default AuthContext;
