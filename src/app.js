const express = require("express");
const cors = require("cors");

const app = express();

// ✅ CORS FIX
app.use(cors({
  origin: [ 
    "https://realtime-chat-app-phi-blush.vercel.app"
  ],
  credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/messages", require("./routes/message.routes"));

app.get("/", (req, res) => {
  res.send("API Running ✅");
});

module.exports = app;