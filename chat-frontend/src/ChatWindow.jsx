import { useEffect, useState } from "react";
import API from "./api";
import socket from "./socket";

export default function ChatWindow({ selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const userId = localStorage.getItem("userId");

  // load old messages
  useEffect(() => {
    if (!selectedUser) return;

    const loadMessages = async () => {
      const res = await API.get(`/messages/${selectedUser._id}`);
      setMessages(res.data);
    };

    loadMessages();
  }, [selectedUser]);

  // socket
  useEffect(() => {
    socket.connect();
    socket.emit("join_room", userId);

    socket.on("receive_message", (data) => {
      if (
        data.sender === selectedUser?._id ||
        data.receiverId === selectedUser?._id
      ) {
        setMessages((prev) => [...prev, data]);
      }
    });

    return () => socket.disconnect();
  }, [selectedUser]);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const res = await API.post("/messages/send", {
      receiverId: selectedUser._id,
      message,
    });

    const newMsg = res.data.message || res.data;

    setMessages((prev) => [...prev, newMsg]);

    socket.emit("send_message", {
      sender: newMsg.sender,
      receiverId: selectedUser._id,
      content: newMsg.content,
    });

    setMessage("");
  };

  if (!selectedUser) return <div>Select a user</div>;

  return (
    <div style={{ width: "70%", padding: "10px" }}>
      <h3>{selectedUser.email}</h3>

      <div style={{ height: "300px", overflowY: "scroll" }}>
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign: m.sender === userId ? "right" : "left",
              margin: "5px",
            }}
          >
            <span
              style={{
                background: m.sender === userId ? "#DCF8C6" : "#eee",
                padding: "5px 10px",
                borderRadius: "10px",
              }}
            >
              {m.content}
            </span>
          </div>
        ))}
      </div>

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type..."
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
}