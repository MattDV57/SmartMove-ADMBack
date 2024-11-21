import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {

  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' })
  }

  jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) 
    req.user = user 
    next()
  })
}
