import { useState, useEffect } from "react";
import Login from "./login";
import Register from "./register";
import Chat from "./Chat";
import "./index.css";

function App() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [showLogin, setShowLogin] = useState(true);

  // 🔥 CHECK REFERRAL LINK
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");

    if (ref) {
      setShowLogin(false); // 👉 FORCE REGISTER PAGE
    }
  }, []);

  if (!token) {
    return showLogin ? (
      <Login setToken={setToken} setShowLogin={setShowLogin} />
    ) : (
      <Register setShowLogin={setShowLogin} />
    );
  }

  return <Chat />;
}

export default App;