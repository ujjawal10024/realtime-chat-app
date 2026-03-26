const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const generateCode = () =>
  Math.random().toString(36).substring(2, 10);

// REGISTER
const registerUser = async (req, res) => {
  const { name, username, email, password, gender, referralCode } = req.body;

  const exists = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (exists) return res.status(400).json({ message: "User exists" });

  const hash = await bcrypt.hash(password, 10);

  let referredUser = null;
  if (referralCode) {
    referredUser = await User.findOne({ referralCode });
  }

  const user = await User.create({
    name,
    username,
    email,
    password: hash,
    gender,
    referralCode: generateCode(),
    referredBy: referredUser?._id,
    friends: [],
  });

  res.json({ success: true });
};

// LOGIN
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Invalid" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: "Invalid" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

  const userObj = user.toObject();
  delete userObj.password;

  res.json({ token, user: userObj });
};

// ADD FRIEND (EMAIL OR USERNAME)
const addFriend = async (req, res) => {
  const { query } = req.body;
  const myId = req.user.id;

  const userToAdd = await User.findOne({
    $or: [{ email: query }, { username: query }],
  });

  if (!userToAdd)
    return res.status(404).json({ message: "User not found" });

  if (userToAdd._id.toString() === myId)
    return res.status(400).json({ message: "Cannot add yourself" });

  const me = await User.findById(myId);

  if (me.friends.includes(userToAdd._id))
    return res.status(400).json({ message: "Already friends" });

  me.friends.push(userToAdd._id);
  userToAdd.friends.push(myId);

  await me.save();
  await userToAdd.save();

  res.json({ message: "Friend added" });
};

// GET FRIENDS
const getFriends = async (req, res) => {
  const user = await User.findById(req.user.id).populate(
    "friends",
    "-password"
  );

  res.json(user.friends);
};
// GET ME (REFERRAL CODE + USER DATA)
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  addFriend,
  getFriends,
  getMe, // 👈 ADD THIS
};