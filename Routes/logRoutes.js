import "dotenv/config";
import express from "express";
import { Log } from "../Models/logModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const foundLogs = await Log.find({}).sort({ timestamp: -1 });
  return res.status(200).send(foundLogs);
});

export default router;
