


export const authorizeRole = ( requiredRoles = ["Admin"]) => {
    return (req, res, next) => {
        if (!req.user || !requiredRoles.includes(req.user.accessRole)) {
            return res.status(401).send({messsage: "Access forbidden: Unauthorized"})
        }
        next();
    }
}