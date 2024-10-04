import express from "express";
import { Claim } from "../Models/claimModel.js";
import { Chat } from "../Models/chatModel.js";
import authenticateToken from "../utils/jwtChecker.js";

const router = express.Router();

router.get("/", authenticateToken, async (req, res) => {
  try {
    let page = parseInt(req.query.page) || 1;
    let limitPerPage = parseInt(req.query.limit) || 10;

    const skip = (page - 1) * limitPerPage;

    const foundClaimsPaginated = await Claim.aggregate([
      { $match: {} },
      { $skip: skip },
      { $limit: limitPerPage },
    ]);

    return res.status(200).send(foundClaimsPaginated);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

router.post("/", authenticateToken, async (req, res) => {
  try {
    const createdChat = await Chat.create({});
    const createdChatId = createdChat._id.toString();

    const requestBody = req.body;
    requestBody.relatedChat = createdChatId;

    const createdClaim = await Claim.create(requestBody);
    return res.status(200).send(createdClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.errors });
  }
});

router.put("/:claimId", authenticateToken, async (req, res) => {
  try {
    const updatedClaim = await Claim.findOneAndUpdate(
      {
        _id: req.params.claimId,
      },
      req.body,
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).send("Claim not found");
    }

    return res.status(200).send(updatedClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

router.put("/:claimId/status", authenticateToken, async (req, res) => {
  try {
    const updatedClaim = await Claim.findOneAndUpdate(
      { _id: req.params.claimId },
      { status: req.body.status },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).send("Claim not found");
    }
    return res.status(200).send(updatedClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

router.put("/:claimId/action", authenticateToken, async (req, res) => {
  try {
    const actionToPush = req.body.action;
    const updatedClaim = await Claim.findOneAndUpdate(
      { _id: req.params.claimId },
      { $push: { actionHistory: { action: actionToPush } } },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).send("Claim not found");
    }

    return res.status(200).send(updatedClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.errors });
  }
});

router.put("/:claimId/assign-chat", authenticateToken, async (req, res) => {
  try {
    const chatID = req.body.chatID;
    const updatedClaim = await Claim.findOneAndUpdate(
      { _id: req.params.claimId },
      { relatedChat: chatID },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).send("Claim not found");
    }

    return res.status(200).send(updatedClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

router.get("/:claimId/chat", authenticateToken, async (req, res) => {
  try {
    const foundClaim = await Claim.findById(req.params.claimId);
    if (!foundClaim) {
      return res.status(404).send("Claim not found");
    }
    const foundChat = await Chat.findById(foundClaim.relatedChat);
    return res.status(200).send(foundChat);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Error on server side" });
  }
});

export default router;
