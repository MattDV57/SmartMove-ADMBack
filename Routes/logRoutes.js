import "dotenv/config";
import express from "express";
import { Log } from "../Models/logModel.js";

const router = express.Router();

// Query params: performedBy, search, page, limit
router.get("/", async (req, res) => {
  try {

    const { performedBy, search, page = 1, limit = 10 } = req.query;
    const filter = {};


    if (performedBy) {
      filter.performedBy = performedBy; 
    }


    if (search) {
      filter.$or = [
        { "claimId": { $regex: search, $options: "i" } }, 
        { "action": { $regex: search, $options: "i" } }, 
        { "details": { $regex: search, $options: "i" } }, 
        { "user": { $regex: search, $options: "i" } }, 
      ];
    }

    const pageNumber = parseInt(page) || 1;
    const pageSize = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const foundLogs = await Log.find(filter)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(pageSize); 


    const totalLogs = await Log.countDocuments(filter);

    return res.status(200).json({
      totalLogs,
      currentPage: pageNumber,
      logs: foundLogs,
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ message: "Error fetching logs" });
  }
});



export default router;