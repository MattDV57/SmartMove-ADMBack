import "dotenv/config";
import { Log } from "../Models/logModel.js";

const logAction = async (claimId, action, details, user, performedBy) => {
  const log = await Log.create({
    claimId: claimId,
    action: action,
    details: details,
    user: user,
    performedBy: performedBy,
  });
};

export default logAction;
