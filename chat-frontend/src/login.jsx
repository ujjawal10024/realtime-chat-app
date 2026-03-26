import { useState } from "react";
import API from "./api";

export default function Login({ setToken, setShowLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await API.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user._id);

      setToken(res.data.token);
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login</h2>

      <input
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button onClick={login}>Login</button>

      {/* 🔥 FIXED BUTTON */}
      <p
        onClick={() => setShowLogin(false)}
        style={{ cursor: "pointer", marginTop: "10px", color: "blue" }}
      >
        Create Account
      </p>
    </div>
  );
}