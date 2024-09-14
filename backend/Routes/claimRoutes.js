import express from "express";
import { Claim } from "../Models/claimModel.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const foundClaims = await Claim.find({});
  return res.status(200).send(foundClaims);
});

router.post("/", async (req, res) => {
  const createdClaim = await Claim.create(req.body);
  return res.status(200).send(createdClaim);
});

router.put("/:claimId", async (req, res) => {});

router.put("/:claimId/status", async (req, res) => {
  const updatedClaim = await Claim.findOneAndUpdate(
    { _id: req.params.claimId },
    { status: req.body.status },
    { new: true }
  );
  return res.status(200).send(updatedClaim);
});

export default router;
