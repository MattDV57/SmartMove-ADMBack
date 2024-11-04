import "dotenv/config";
import express from "express";
import { User } from "../Models/userModel.js";
import authenticateToken from "../Middlewares/jwtChecker.js";
import logAction from "../utils/logger.js";
import { ObjectId } from "mongodb";
import { authorizeRole } from "../Middlewares/authorizeRole.js";
import { ACCESS_CONTROL } from "../utils/PERMISSIONS.js";
const router = express.Router();


//TODO: Integration with ldap.
//TODO: Middleware for admin req with groups of ldap.
//TODO: Middleware for creating logs.

/** 
Get all users: /users?page=1&limit=10 
*/
router.get("/", authenticateToken, authorizeRole(ACCESS_CONTROL.GET_ALL_USERS), async (req, res) => {
 try {

    let page = parseInt(req.query.page) || 1;
    let limitPerPage = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limitPerPage;

    const totalUsers = await User.countDocuments({});
  
      const foundUsersPaginated = await User.aggregate([
        { $match: { } },
        { $sort: { fullName: -1 } },
        { $skip: skip },
        { $limit: limitPerPage },
      ]);

    return res.status(200).send({ foundUsersPaginated, totalUsers });
 } catch (error) {
   console.log(error);
   return res.status(500).send({ message: "Error on server side" });
 }
});


/**
Get user by id: /users/:userId
 */

router.get("/:userId/profile", authenticateToken, authorizeRole(ACCESS_CONTROL.GET_USER_PROFILE), async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        if (!user) {
        return res.status(404).send({ message: "User not found" });
        }
    
        return res.status(200).send(user);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});



/** 
Put user: /users/:userId
*/

router.put("/:userId", authenticateToken, authorizeRole(ACCESS_CONTROL.PUT_USER), async (req, res) => {
    try {

        const user = await User.findById(req.params.userId);

        if (!user) {
        return res.status(404).send({ message: "User not found" });
        }
 
        
        const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true }
        );

        await createLog("Put", "Usuario modificado", user.username);
    
        return res.status(200).send(updatedUser._id);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});



/**
Post user: /users
*/

router.post("/", authenticateToken, authorizeRole(ACCESS_CONTROL.POST_USER), async (req, res) => {
    try {
        const newUser = new User(req.body);

        const savedUser = await newUser.save();

        await createLog("Created", "Usuario creado", savedUser.username);

        return res.status(201).send(savedUser._id);

    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});


/**
Delete user: /users/:userId
 */

router.delete("/:userId", authenticateToken, authorizeRole(ACCESS_CONTROL.DELETE_USER), async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user) {
        return res.status(404).send({ message: "User not found" });
        }

        await User.deleteOne(user._id);

        await createLog("Delete", "Usuario eliminado", user.usename);


        return res.status(200).send({ message: "User deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});





const createLog = async (action, details, user, performedBy = "Admin") => {
    try {
        await logAction(new ObjectId(), action, details, user, performedBy)
    } catch (error) {
        throw error;
    }
}



export default router;