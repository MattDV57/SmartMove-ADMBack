import "dotenv/config";
import { Log } from "../Models/logModel.js";

const logAction = async (claimId, action, details, user, perfomedBy) => {
  const log = await Log.create({
    claimId: claimId,
    action: action,
    details: details,
    user: user,
    perfomedBy: perfomedBy,
  });
};

export default logAction;
