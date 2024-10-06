import "dotenv/config.js";
import { Log } from "../Models/logModel.js";

const logAction = async (claimId, action, details, user) => {
  const log = await Log.create({
    claimId: claimId,
    action: action,
    details: details,
    user: user,
  });
};

export default logAction;
