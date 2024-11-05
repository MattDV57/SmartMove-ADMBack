import "dotenv/config";
import express from "express";
import { Log } from "../Models/logModel.js";
import authenticateToken from "../Middlewares/jwtChecker.js";
import { authorizeRole } from "../Middlewares/authorizeRole.js";
import { ACCESS_CONTROL } from "../utils/PERMISSIONS.js";

const router = express.Router();

// Query params: search, page, limit
router.get("/", authenticateToken, authorizeRole(ACCESS_CONTROL.GET_LOGS), async (req, res) => {
  try {

    const { search= "", page = 1, limit = 10 } = req.query;
    const filter = {};


    if (search) {
      filter.$or = [
        { "claimId": { $regex: search, $options: "i" } }, 
        { "action": { $regex: search, $options: "i" } }, 
        { "details": { $regex: search, $options: "i" } }, 
        { "user": { $regex: search, $options: "i" } }, 
      ];
    }

    const pageNumber = parseInt(page) || 1;
    const limitPerPage = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * limit;
    const foundLogs = await Log.aggregate([
      { $match: {  ...filter  } },
      { $sort: { timestamp: -1 } },
      { $skip: skip },
      { $limit: limitPerPage },
    ])

    const totalLogs = await Log.countDocuments({ });

    return res.status(200).json({
      totalLogs: totalLogs,
      currentPage: pageNumber,
      logs: foundLogs,
    });
    
  } catch (error) {
    console.error("Error fetching logs:", error);
    return res.status(500).json({ message: "Error fetching logs" });
  }
});



export default router;