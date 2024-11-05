import "dotenv/config";
import { Log } from "../Models/logModel.js";

const logAction = async (eventType, moduleEmitter, performedBy) => {
  const log = await Log.create({
    eventType: eventType,
    moduleEmitter: moduleEmitter,
    performedBy: performedBy,
  });
};

export default logAction;
