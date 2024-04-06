const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const authMiddleware = require("../middleware/authMiddleware");


// Validate email format
function isValidEmail(email) {
  return email.includes("@") && email.includes(".");
}

// Validate phone number format
function isValidPhoneNumber(phoneNumber) {
  return phoneNumber.length === 10 && !isNaN(phoneNumber);
}

// Sign up route
router.post("/api/signup", async (req, res) => {
  const { email, password, firstName, lastName, phoneNumber, address } =
    req.body;

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!isValidPhoneNumber(phoneNumber)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  let retryCount = 0;
  const maxRetries = 2;
  let savedUser;

  while (retryCount < maxRetries) {
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: "Email already exists" });
      }

      const highestUidUser = await User.findOne({}, { uid: 1 }).sort({
        uid: -1,
      });
      const newUid = highestUidUser ? highestUidUser.uid + 1 : 1;

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = new User({
        uid: newUid,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phoneNumber,
        address,
      });
      savedUser = await newUser.save();
      if (!savedUser) {
        throw new Error("User could not be saved");
      }
      res.status(201).json({ message: "User created successfully" });
      break;
    } catch (err) {
      console.error("Error creating user:", err);
      retryCount++;
      if (retryCount === maxRetries) {
        res.status(500).json({ error: "Internal server error" });
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
});

// Login route
router.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  let retryCount = 0;
  const maxRetries = 2;

  while (retryCount < maxRetries) {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ error: "Invalid Email" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid Password" });
      }
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.status(200).json({ token, expiresIn: "1h" });
      break;
    } catch (err) {
      console.error("Error logging in:", err);
      retryCount++;
      if (retryCount === maxRetries) {
        res.status(500).json({ error: "Internal server error" });
      }
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }
});

// Get user details route
router.get("/api/userdetails/:uid", authMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.uid !== user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, email, phoneNumber, address, createdAt } =
      user;
    res.json({
      user: {
        firstName,
        lastName,
        email,
        phoneNumber,
        address,
        createdAt,
      },
    });
  } catch (err) {
    console.error("Error retrieving user details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update user details route
router.put("/api/userdetails/:uid", authMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.uid !== user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { firstName, lastName, email, phoneNumber, address } = req.body;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;

    await user.save();
    res.status(200).json({ message: "User details updated successfully" });
  } catch (err) {
    console.error("Error updating user details:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user details route
router.delete("/api/userdetails/:uid", authMiddleware, async (req, res) => {
  try {
    const { uid } = req.params;
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (req.user.uid !== user.uid) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    await User.deleteOne({ uid });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user account:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
