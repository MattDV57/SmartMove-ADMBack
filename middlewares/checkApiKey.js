import 'dotenv/config';

export const checkApiKey =(req, res, next) => {
  const authApiKey = req.headers["x-api-key"];

  if (!authApiKey || authApiKey !== process.env.API_KEY) {
    return res.status(403).send({ message: 'Access denied. Invalid or missing API Key.' });
  }

  next();
}


