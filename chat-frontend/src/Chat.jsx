import { useEffect, useState } from "react";
import API from "./api";
import socket from "./socket";
import EmojiPicker from "emoji-picker-react";

export default function Chat() {
  const [showEmoji, setShowEmoji] = useState(false);
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

  const referralLink = `${import.meta.env.VITE_BASE_URL}/register?ref=${myCode}`;

  /* ================= SOCKET ================= */
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

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchMe = async () => {
      const res = await API.get("/auth/me");
      setMyCode(res.data.referralCode);
    };
    fetchMe();
  }, []);

  useEffect(() => {
    const fetchFriends = async () => {
      const res = await API.get("/auth/friends");
      setUsers(res.data);
    };
    fetchFriends();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      const res = await API.get(`/messages/${selectedUser._id}`);
      setMessages(res.data.messages || res.data);
    };

    loadMessages();
  }, [selectedUser]);

  /* ================= SEND ================= */
  const sendMessage = async () => {
    if (!selectedUser || !message.trim()) return;

    const res = await API.post("/messages/send", {
      receiverId: selectedUser._id,
      message,
    });

    const newMsg = res.data.message || res.data;

    setMessages((prev) => [...prev, newMsg]);

    socket.emit("send_message", {
      sender: userId,
      receiverId: selectedUser._id,
      content: newMsg.content,
    });

    setMessage("");
  };

  /* ================= ADD FRIEND ================= */
  const handleAddFriend = async () => {
    if (!query.trim()) return;

    await API.post("/auth/add-friend", { query });
    setQuery("");

    const res = await API.get("/auth/friends");
    setUsers(res.data);
  };

  /* ================= COPY ================= */
  const copyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ================= AUTO SCROLL ================= */
  useEffect(() => {
    const box = document.querySelector(".chat-box");
    if (box) box.scrollTop = box.scrollHeight;
  }, [messages]);

  return (
    <div className={`app ${theme}`}>

      {/* 🔥 REFERRAL */}
      <div className="ref-box">
        <p>Code: <b>{myCode}</b></p>
        <button onClick={copyLink}>
          {copied ? "Copied ✅" : "Copy Link"}
        </button>
      </div>

      {/* ================= SIDEBAR ================= */}
      <div className="sidebar">
        <h3>Friends</h3>

        <div className="add-user">
          <input
            placeholder="email / username"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleAddFriend}>+</button>
        </div>

        {users.map((u) => (
          <div
            key={u._id}
            className={`user-item ${selectedUser?._id === u._id ? "active" : ""}`}
            onClick={() => setSelectedUser(u)}
          >
            {u.username || u.email}
          </div>
        ))}
      </div>

      {/* ================= CHAT ================= */}
      <div className="chat">

        {/* HEADER */}
        <div className="top-bar">
          <div>
            <h3>
              {selectedUser
                ? selectedUser.username || selectedUser.email
                : "Select user"}
            </h3>
            {selectedUser && <span className="status">🟢 Online</span>}
          </div>

          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
          >
            Logout
          </button>
        </div>

        {/* MESSAGES */}
        <div className="chat-box">
          {messages.map((m, i) => (
            <div
              key={i}
              className={m.sender === userId ? "msg-other" : "msg-me"}
            >
              {m.content}
            </div>
          ))}
        </div>

        {/* INPUT */}
        <div className="input-area">
          <button onClick={() => setShowEmoji(!showEmoji)}>😊</button>

          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
          />

          <button onClick={sendMessage}>Send</button>

          {showEmoji && (
            <div className="emoji-box">
              <EmojiPicker
                onEmojiClick={(e) =>
                  setMessage((prev) => prev + e.emoji)
                }
              />
            </div>
          )}
        </div>

        {/* 🎨 THEME SWITCHER */}
        <div className="theme-switcher">
          {["dark", "spiderman", "anime", "gow", "retro"].map((t) => (
            <button
              key={t}
              className={theme === t ? "active" : ""}
              onClick={() => {
                setTheme(t);
                localStorage.setItem("theme", t);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}