import 'dotenv/config'
import jsonwebtoken from 'jsonwebtoken'

export default function authenticateToken (req, res, next) {
  // const authHeader = req.headers["authorization"];
  // const token = authHeader && authHeader.split(" ")[1];
  // if (token == null) return res.sendStatus(401); //Unauthorized = No se envió token

  const token = req.cookies.accessToken

  if (!token) {
    return res.status(401).send({ message: 'Access denied. No token provided.' })
  }

  // Verificar el token
  jsonwebtoken.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403) // Forbidden = Existe el token pero no tiene permisos o no es válido
    req.user = user // Adjuntamos dato del user (sacados del jwt) al request por si se quieren usar
    next()
  })
}
