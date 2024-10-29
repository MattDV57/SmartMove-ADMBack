import "dotenv/config";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
import { authenticateLdapUser } from "../services/ldapService.js";
import { User } from '../Models/userModel.js';

const router = express.Router();


router.post("/login", async (req, res) => {

  const { email, password } = req.body;


  try {

    const username = email?.split("@")[0];

    await authenticateLdapUser(username, password);
    
    let user = await User.findOne({ username });


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
    res.status(500).send({ message: "Error binding to LDAP server" });
  }
});

export default router;