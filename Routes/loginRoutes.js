import "dotenv/config";
import express from "express";
import { User } from '../Models/userModel.js';
import jsonwebtoken from "jsonwebtoken";

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
    
    res.status(200).send({ accessToken, ...user._doc });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});


// router.get("/permissions")



export default router;
