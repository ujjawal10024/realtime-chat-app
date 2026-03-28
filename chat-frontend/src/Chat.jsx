import { useEffect, useState } from "react";
import API from "./api";
import socket from "./socket";

export default function Chat() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [query, setQuery] = useState("");
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") || "dark"
  );
  const [myCode, setMyCode] = useState("");
  const [copied, setCopied] = useState(false);

  const userId = localStorage.getItem("userId");

  // 🔗 REFERRAL LINK
  const referralLink = `${import.meta.env.VITE_BASE_URL}/register?ref=${myCode}`;

  // 🔌 SOCKET
  useEffect(() => {
    socket.connect();
    socket.emit("join_room", userId);

    const handler = (data) => {
      if (!data || !data.content) return;

      if (
        data.sender === selectedUser?._id ||
        data.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.on("receive_message", handler);

    return () => {
      socket.off("receive_message", handler);
    };
  }, [selectedUser]);

  // 🔥 GET MY REFERRAL CODE
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const res = await API.get("/auth/me");
        setMyCode(res.data.referralCode);
      } catch (err) {
        console.log("Referral fetch error:", err);
      }
    };

    fetchMe();
  }, []);

  // 👥 FETCH FRIENDS
  useEffect(() => {
    const fetchFriends = async () => {
      const res = await API.get("/auth/friends");
      setUsers(res.data);
    };
    fetchFriends();
  }, []);

  // 📜 LOAD MESSAGES
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      const res = await API.get(`/messages/${selectedUser._id}`);
      setMessages(res.data.messages || res.data);
    };

    loadMessages();
  }, [selectedUser]);

  // 📤 SEND MESSAGE
  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    try {
      const res = await API.post("/messages/send", {
        receiverId: selectedUser._id,
        message,
      });

      const newMsg = res.data.message || res.data;

      if (!newMsg || !newMsg.content) return;

      setMessages((prev) => [...prev, newMsg]);

      socket.emit("send_message", {
        sender: userId,
        receiverId: selectedUser._id,
        content: newMsg.content,
      });

      setMessage("");
    } catch (err) {
      console.log("Send error:", err);
    }
  };

  // ➕ ADD FRIEND
  const handleAddFriend = async () => {
    if (!query.trim()) return;

    await API.post("/auth/add-friend", { query });
    setQuery("");

    const res = await API.get("/auth/friends");
    setUsers(res.data);
  };

  // 📋 COPY LINK
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 🔽 AUTO SCROLL
  useEffect(() => {
    const box = document.querySelector(".chat-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <div className={`app ${theme}`}>

      {/* 🔥 REFERRAL BOX */}
      <div style={{ padding: "10px", borderBottom: "1px solid gray" }}>
        <p style={{ fontSize: "12px" }}>
          Code: <b>{myCode || "Loading..."}</b>
        </p>

        <p style={{ fontSize: "10px", wordBreak: "break-all" }}>
          {referralLink}
        </p>

        <button onClick={copyLink}>
          {copied ? "Copied ✅" : "Copy Link"}
        </button>
      </div>

      {/* LEFT */}
      <div className="sidebar">
        <h3>Friends</h3>

        <input
          placeholder="email / username"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button onClick={handleAddFriend}>Add</button>

        {users.map((u) => (
          <div
            key={u._id}
            className="user-item"
            onClick={() => setSelectedUser(u)}
          >
            {u.username || u.email}
          </div>
        ))}
      </div>

      {/* RIGHT */}
      <div className="chat">
        <div className="top-bar">
          <h3>
            {selectedUser
              ? selectedUser.username || selectedUser.email
              : "Select user"}
          </h3>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>

        <div className="chat-box">
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.sender === userId ? "msg-other" : "msg-me"
              }
            >
              {m.content}
            </div>
          ))}
        </div>

        <div className="input-area">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>

        {/* 🎨 THEME */}
        <select
          value={theme}
          onChange={(e) => {
            setTheme(e.target.value);
            localStorage.setItem("theme", e.target.value);
          }}
        >
          <option value="dark">Dark</option>
          <option value="spiderman">Spiderman</option>
          <option value="anime">Anime</option>
          <option value="gow">God of War</option>
          <option value="retro">Retro</option>
        </select>
      </div>
    </div>
  );
}