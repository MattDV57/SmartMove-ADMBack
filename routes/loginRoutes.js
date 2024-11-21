import "dotenv/config";
import express from "express";
import { User } from "../models/userModel.js";
import jsonwebtoken from "jsonwebtoken";
import { ACCESS_CONTROL } from "../utils/PERMISSIONS.js";


const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email }).select(
      "-password -createdAt -updatedAt -__v"
    );

    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    const accessRole = (user.accessRole).toLowerCase()

    const USER_PERMISSIONS = getUserPermissions(accessRole);

    const accessToken = jsonwebtoken.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        accessRole,
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // Expira en 24 horas
      sameSite: 'Lax'
    })

    res.status(200).send({ user: {...user._doc, accessRole}, USER_PERMISSIONS });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

// GET user externo por cookies
router.get("/user-session",  async (req, res) => {
  try {

    const accessRole = (req.user.accessRole).toLowerCase()

    const USER_PERMISSIONS = getUserPermissions(accessRole);

    const user = {...req.user, accessRole }

    res.status(200).send({ user, USER_PERMISSIONS });
  } catch (error) {
    res.status(500).send({ message: "Error on server side" });
  }
});

router.post("/logout", (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: 'Lax'
  })

  res.status(200).send({ message: "Succesful logout" });
});


const getUserPermissions = (accessRole) => {
  const USER_PERMISSIONS = {};

    Object.entries(ACCESS_CONTROL).forEach(([method, requiredRoles]) => {
      USER_PERMISSIONS[method] = requiredRoles.includes(accessRole);
    });
  
  return USER_PERMISSIONS;
}



export default router;
