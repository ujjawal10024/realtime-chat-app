import { useState, useEffect } from "react";
import API from "./api";

export default function Register({ setShowLogin }) {
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: "male",
    referralCode: "",
  });

  // ✅ REFERRAL AUTO-FILL (NO ROUTER NEEDED)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setForm((prev) => ({ ...prev, referralCode: ref }));
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const register = async () => {
    try {
      await API.post("/auth/register", form);
      alert("Registered successfully 🚀");
      setShowLogin(true);
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Register</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="username" placeholder="Username" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />

      {/* 🔒 PASSWORD FIX */}
      <input
        type="password"
        name="password"
        placeholder="Password"
        onChange={handleChange}
      />

      <select name="gender" onChange={handleChange}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>

      <input
        name="referralCode"
        placeholder="Referral Code"
        value={form.referralCode}
        onChange={handleChange}
      />

      <button onClick={register}>Register</button>

      <p
        onClick={() => setShowLogin(true)}
        style={{ cursor: "pointer", marginTop: "10px" }}
      >
        Already have account? Login
      </p>
    </div>
  );
}