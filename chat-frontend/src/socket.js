import { io } from "socket.io-client";

const socket = io("https://realtime-chat-app-kvxv.onrender.com", {
  autoConnect: false,
});

export default socket;