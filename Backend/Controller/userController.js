import userModel from "../model/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signup = async (req, res) => {
  const { username, email, password } = req.body;

  const user = await userModel.findOne({ email });

  if (user) {
    console.log(user);
    return res.json({ message: "user already exist" });
  }

  // bcrypt.genSalt(10, (err, salt) => {
  //   bcrypt.hash(password, salt, async  (err, hash) => {
  //     const newUser = new userModel({
  //       username,
  //       email,
  //       password: hash,
  //     });
  //     await newUser.save();
  //   });
  // });

  const bcryptedPassword = await bcrypt.hash(password, 10);
  
  const newUser = new userModel({
    username,
    email,
    password: bcryptedPassword,
  });
  await newUser.save();

  const token = jwt.sign({ email }, "secret", { expiresIn: "1h" });
  console.log("token", token);

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict",
    secure: true,
  });

   return res.status(201).json({
    message: "user created successfully",
    user: {
      username: newUser.username,
      email: newUser.email,
    },
    token,
  });
};

//login
export const login = async (req, res) => {

  const { email, password } = req.body;
 try {
  
   const user = await userModel.findOne({ email });
  if (!user) {
    return res.json({ message: "user not register" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.json({ message: "invalid password or email" });
  }

  const token = jwt.sign({ email, id: user._id }, "secret", {
    expiresIn: "1h",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "Strict",
    secure: true,
  });
   return res.status(201).json({ message: "login successfully",user:{
    username:user.username,
    email:user.email,
  } ,token });
 } catch (error) {
  res.status(500).json({ message: "internal server error" });
  
 }
}; 


export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "Strict",
    secure: true,
  });
  return res.json({ message: "logout successfully" });
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, "secret");
    const user = await userModel.findOne({ email: decoded.email }).select('-password');

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        username: user.username,
        email: user.email,
        id: user._id
      }
    });
  } catch (error) {
    console.error("Error fetching user profile:", error);

    // Handle JWT specific errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        message: "Token expired",
        error: "TOKEN_EXPIRED",
        expiredAt: error.expiredAt
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: "Invalid token",
        error: "INVALID_TOKEN"
      });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};
