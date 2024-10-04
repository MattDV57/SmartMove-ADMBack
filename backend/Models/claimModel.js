import mongoose from "mongoose";
import mongooseSequence from "mongoose-sequence";

const claimSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    default: "Abierto",
    enum: ["Abierto", "En Proceso", "Resuelto", "Cerrado"],
  },
  priority: {
    type: String,
    default: "Normal",
    enum: ["Baja", "Normal", "Alta", "Urgente"],
  },
  user: {
    username: { type: String },
    userId: { type: Number },
    userPhoneNumber: { type: Number },
  },
  subject: { type: String, default: "Queja" },
  description: { type: String },
  category: { type: String, default: "Otros" },
  assignedOperator: { type: String },
  actionHistory: [
    {
      action: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
  ],
  resolutionDate: { type: Date },
  resolution: { type: String },
  relatedChat: { type: String },
});

claimSchema.plugin(mongooseSequence(mongoose), { inc_field: "claimNumber" });
export const Claim = mongoose.model("Claim", claimSchema);
