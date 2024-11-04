import "dotenv/config";
import express from "express";
import { User } from '../Models/userModel.js';
import jsonwebtoken from "jsonwebtoken";
import { ACCESS_CONTROL } from "../utils/PERMISSIONS.js";

const router = express.Router();


router.post("/", async (req, res) => {

  const { email, password } = req.body;

  try {
    
    const user = await User.findOne({ email }).select("-password -createdAt -updatedAt -__v");

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const accessToken = jsonwebtoken.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        accessRole: user.accessRole
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    const USER_PERMISSIONS = {};

    Object.entries(ACCESS_CONTROL).forEach(([method, requiredRoles]) => {
        return USER_PERMISSIONS[method] = requiredRoles.includes(user.accessRole);
      }
    )
    
    res.status(200).send({ accessToken, ...user._doc, USER_PERMISSIONS });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});




export default router;
