import mongoose from "mongoose";

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  claimId: { type: String },
  action: { type: String },
  details: { type: String },
  user: { type: String },
  performedBy: { type: String, enum: ["Soporte", "Admin"] },
});

export const Log = mongoose.model("Log", logSchema);
