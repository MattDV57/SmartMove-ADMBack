import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {

  const token = req.cookies.token

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' })
  }

  console.log(token)

  jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    console.log("JWT verification error:", err, "Token:", token, user);
    if (err) return res.sendStatus(403)
    user.accessRole = user.accessRole || user.rol_admin_int.toLowerCase();
    req.user = user;
    next()
  })
}
