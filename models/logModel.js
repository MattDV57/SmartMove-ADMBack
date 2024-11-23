import mongoose from 'mongoose'

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  eventType: { type: String },
  moduleEmitter: { type: String },
  performedBy: { type: String, default: "N/A" }
})

export const Log = mongoose.model('Log', logSchema)
