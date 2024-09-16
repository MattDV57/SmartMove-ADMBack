import express from "express";
import { Claim } from "../Models/claimModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const foundClaims = await Claim.find({});
    return res.status(200).send(foundClaims);
  } catch (error) {
    console.log(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const createdClaim = await Claim.create(req.body);
    return res.status(200).send(createdClaim);
  } catch (error) {
    console.log(error);
    return res.status(500).send(error);
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
  }
});

export default router;
