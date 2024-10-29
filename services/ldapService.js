import "dotenv/config";

import ldap from "ldapjs";


const ldapOptions = {
    url: process.env.LDAP_URL
};

const client = ldap.createClient(ldapOptions)

export const authenticateLdapUser = (username, password) => {
  return new Promise((resolve, reject) => {
    const adminDn = `cn=${username},ou=administradores,${process.env.LDAP_DN}`;
    const userDn = `cn=${username},ou=usuarios,${process.env.LDAP_DN}`;

    client.bind(adminDn, password, (err) => {
      if (!err) {
        return resolve(true); // Autenticado en administradores
      }

      // Si falla en administradores, intenta en usuarios
      client.bind(userDn, password, (err) => {
        if (err) {
          return reject(err); // Falló también en usuarios
        }
        resolve(true); // Autenticado en usuarios
      });
    });
  });
};


export const createLdapUser = (username, accessRole) => {
    console.log(username, accessRole)
    return new Promise((resolve, reject) => {
        
        // Definir el DN de acuerdo al rol de acceso
        const baseDn = accessRole === "Admin" 
            ? `ou=administradores,${process.env.LDAP_DN}` 
            : `ou=usuarios,${process.env.LDAP_DN}`;
        
        const userDn = `cn=${username},${baseDn}`;

        // Crear el objeto del usuario para LDAP
        const newUser = {
            cn: username,
            sn: username, // Apellido o identificador único
            userPassword: "admin", // Contraseña por defecto
            objectClass: ["inetOrgPerson", "organizationalPerson", "person", "top"], // Clases de objeto necesarias
        };

        // Llamada para añadir el usuario
        client.add(userDn, newUser, (err) => {
            if (err) {
                return reject("Error al crear el usuario en LDAP: " + err.message);
            }
            resolve(true);
        });
    });
};



// export const isAdminLdap = async (username) => {
//   const client = ldap.createClient({
//     url: process.env.LDAP_URL, 
//   });

//   // Obtengo credenciales de un admin que pueda buscar dentro de ldap.
//   const adminDn = process.env.LDAP_ADMIN_DN; 
//   const adminPassword = process.env.LDAP_ADMIN_PASSWORD; 
//   const searchBase = process.env.LDAP_SEARCH_BASE; 
//   const adminGroup = process.env.LDAP_ADMIN_GROUP; 

//   return new Promise((resolve, reject) => {

//     client.bind(adminDn, adminPassword, (err) => {
//       if (err) {
//         return reject("Error binding to LDAP as admin: " + err.message);
//       }


//       const searchOptions = {
//         filter: `(uid=${username})`, 
//         scope: "sub", 
//       };

//       client.search(searchBase, searchOptions, (err, res) => {
//         if (err) {
//           client.unbind();
//           return reject("Error searching for user: " + err.message);
//         }

//         let userDn = null;

//         res.on("searchEntry", (entry) => {
//           userDn = entry.object.dn; 
//         });

//         res.on("end", (result) => {
//           if (!userDn) {
//             client.unbind();
//             return resolve(false); 
//           }

//           const groupSearchOptions = {
//             filter: `(&(objectClass=groupOfNames)(member=${userDn}))`, 
//             scope: "sub",
//           };

//           client.search(adminGroup, groupSearchOptions, (err, res) => {
//             if (err) {
//               client.unbind();
//               return reject("Error searching for admin group: " + err.message);
//             }

//             let isAdmin = false;

//             res.on("searchEntry", () => {
//               isAdmin = true; 
//             });

//             res.on("end", () => {
//               client.unbind();
//               resolve(isAdmin); 
//             });
//           });
//         });
//       });
//     });
//   });
// };
