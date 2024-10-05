import "dotenv/config.js";
import express from "express";
import ldap from "ldapjs";
import jsonwebtoken from "jsonwebtoken";

const router = express.Router();

const ldapClient = ldap.createClient({
  url: process.env.LDAP_URL, // Replace with your LDAP server URL
});

const ldapAdminDN = process.env.LDAP_ADMIN_DN;
const ldapAdminPassword = process.env.LDAP_ADMIN_PASSWORD;

router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;
    console.log(`cn=${username},ou=Usuarios,dc=example,dc=com`, password);

    ldapClient.bind(
      `cn=${username},dc=admininterna,dc=com`,
      password,
      (err) => {
        if (err) {
          ldapClient.unbind();
          res.status(401).send();
        } else {
          //Integrar un token jwt para devolver cuando es exitoso el login?
          const jwtToken = jsonwebtoken.sign(
            { username: username },
            process.env.ACCESS_TOKEN_SECRET,
            { expiresIn: "24h" }
          );
          ldapClient.unbind();
          res.status(200).send({ token: jwtToken });
        }
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error binding to LDAP server" });
  }
});

export default router;
