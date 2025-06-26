import React from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useState } from "react";

const api = axios.create({ baseURL: "http://localhost:8000" });
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const fetchUser = async (id) => {
    const { data } = await api.get(`/users/${id}`);
    setUser(data);
  };

  const login = async (username, password) => {
    const form = new URLSearchParams();
    form.append("username", username);
    form.append("password", password);

    const { data } = await api.post("/token", form, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    localStorage.setItem("token", data.access_token);
    const decoded = jwtDecode(data.access_token);
    await fetchUser(decoded.sub);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  // авто-логин при refresh
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        fetchUser(decoded.sub);
      } catch {
        localStorage.removeItem("token");
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
