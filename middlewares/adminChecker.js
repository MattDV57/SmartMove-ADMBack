import { isAdminLdap } from "../services/ldapService.js";

export async function verifyAdmin(req, res, next) {
  const { username } = req.user; 

  try {
    const isAdmin = await isAdminLdap(username);

    if (!isAdmin) {
      return res.status(403).send({ message: "Unauthorized: Admin access required" });
    }

    next(); 
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error verificando los privilegios del usuario" });
  }
}
