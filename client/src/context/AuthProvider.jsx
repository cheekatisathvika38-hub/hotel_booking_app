import { useEffect, useState } from "react";
import api from "../api/axios.js";
import AuthContext from "./AuthContext.js";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // True only while we verify a token saved from an earlier visit
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("token")));

  // On first load: if a token exists, ask the server who it belongs to
  useEffect(() => {
    if (!localStorage.getItem("token")) return;

    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => localStorage.removeItem("token")) // invalid or expired
      .finally(() => setLoading(false));
  }, []);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    setUser(data.user);
  };

  const register = async (name, email, password) => {
    const res = await api.post("/auth/register", { name, email, password });
    saveSession(res.data);
  };

  const login = async (email, password) => {
    const res = await api.post("/auth/login", { email, password });
    saveSession(res.data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;