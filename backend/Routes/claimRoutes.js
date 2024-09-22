import express from "express";
import { Claim } from "../Models/claimModel.js";
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

router.post("/", async (req, res) => {
  try {
    const createdClaim = await Claim.create(req.body);
    return res.status(200).send(createdClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send({ error: error.errors });
  }
});

router.put("/:claimId", async (req, res) => {
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

router.put("/:claimId/status", async (req, res) => {
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

router.put("/:claimId/action", async (req, res) => {
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

export default router;
