import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'

export const authenticateToken = (req, res, next) => {

  const token = req.cookies.token

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' })
  }
  jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
      
    user.accessRole = user.accessRole || (
      user.rol_admin_int 
        ? user.rol_admin_int.toLowerCase() 
        : user.is_admin 
            ? "admin" 
            : "unauthorized"
      );
    user.userId = user.userId || user.cuit;
    req.user = user;
    next()
  })
}
