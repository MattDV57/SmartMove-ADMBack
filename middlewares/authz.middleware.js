
import 'dotenv/config';


export const checkPermissions = ( requiredRoles = ["admin"]) => {

    return (req, res, next) => {

        if (!req.user || !requiredRoles.includes((req.user.accessRole).toLowerCase())) {
            return res.status(403).send({messsage: "Access forbidden: Unauthorized"})
        }
        next();
    }
}


export const checkApiKey = (req, res, next) => {
  const authApiKey = req.headers["x-api-key"];

  if (!authApiKey || authApiKey !== process.env.API_KEY) {
    return res.status(403).send({ message: 'Access denied. Invalid or missing API Key.' });
  }

  next();
}

