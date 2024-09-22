import "dotenv/config.js";
import express from "express";
import jsonwebtoken from "jsonwebtoken";

const router = express.Router();

const fakeUser = {
  email: "userEmail@email.com",
  userId: 1,
  username: "username",
};

router.post("/", async (req, res) => {
  try {
    const accessToken = jsonwebtoken.sign(
      fakeUser,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: "24h" }
    );
    res.status(200).send({ accessToken: accessToken });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

export default router;
