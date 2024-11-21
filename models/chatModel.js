import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    timestamp: { type: Date, default: Date.now },
    messages: [
      {
        from: { type: String },
        body: { type: String },
        sender: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    active: { type: Boolean, default: true },
  },
  { collection: "Chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);
