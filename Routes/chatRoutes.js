import express from "express";
import { Chat } from "../Models/chatModel.js";
import whatsappRoutes from "./whatsappRoutes.js";
import authenticateToken from "../middlewares/jwtChecker.js";

const router = express.Router();

//No esta siendo utilizado

router.get("/:chatId", authenticateToken, async (req, res) => {
  try {
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
  }
});

export default router;
