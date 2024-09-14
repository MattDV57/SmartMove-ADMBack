import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const claimSchema = new mongoose.Schema({});

claimSchema.plugin(mongooseSequence(mongoose), { inc_field: "claimId" });
export const Claim = mongoose.model("Claim", claimSchema);
