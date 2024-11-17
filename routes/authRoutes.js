import "dotenv/config";
import express from "express";
import jsonwebtoken from "jsonwebtoken";
// import { authenticateLdapUser } from "../services/ldapService.js";
import { User } from '../models/userModel.js';

const router = express.Router();


router.post("/login", async (req, res) => {

  const { email, password } = req.body;

  try {

    // const username = email?.split("@")[0];

    // console.log("Username: " + username, "PassWord:", password)
    // await authenticateLdapUser(username, password);
    
    let user = await User.findOne({ username });


    const jwtToken = jsonwebtoken.sign(
      { username: username },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).send({ token: jwtToken });

   
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error binding to LDAP server" });
  }
});

export default router;