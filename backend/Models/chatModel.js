import mongoose from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    date: { type: Date, default: Date.now },
    messages: [
      {
        from: { type: String, required: true },
        body: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { collection: "Chats" }
);

export const Chat = mongoose.model("Chat", chatSchema);
