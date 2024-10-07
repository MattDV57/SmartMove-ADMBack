import "dotenv/config";
import express from "express";
import { User } from "../Models/userModel.js";
import authenticateToken from "../utils/jwtChecker.js";
import logAction from "../utils/logger.js";
import { ObjectId } from "mongodb";
const router = express.Router();


/** 
Get all users: /users?adminId=adminId&page=1&limit=10 
*/
router.get("/", authenticateToken, async (req, res) => {
 try {

    if ( await checkIfAdmin(req.query.adminId) ) {
        return res.status(403).send({ message: "You can't see this information" });
    }

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

router.get("/:userId/profile", authenticateToken, async (req, res) => {
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
Put user: /users/:userId/:adminId
*/

router.put("/:userId/:adminId", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        if (!user) {
        return res.status(404).send({ message: "User not found" });
        }

        if( await checkIfAdmin(req.params.adminId) ) {
            return res.status(403).send({ message: "You can't update this user" });
        }
    
        const updatedUser = await User.findOneAndUpdate(
        { _id: req.params.userId },
        req.body,
        { new: true }
        );

        await createLog("Put", "Usuario modificado", user.username);
    
        return res.status(200).send(updatedUser);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});



/**
Post user: /users/:adminId
*/

router.post("/", authenticateToken, async (req, res) => {
    try {
        const newUser = new User(req.body);

        // if( await checkIfAdmin(req.params.adminId) ) {
        //     return res.status(403).send({ message: "You can't update this user" });
        // }

        const savedUser = await newUser.save();

        await createLog("Created", "Usuario creado", savedUser.usename);

        return res.status(201).send(savedUser);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});


/**
Delete user: /users/:userId/:adminId
 */

router.delete("/:userId/:adminId", authenticateToken, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.userId });
        if (!user) {
        return res.status(404).send({ message: "User not found" });
        }

        if( await checkIfAdmin(req.params.adminId) ) {
            return res.status(403).send({ message: "You can't delete this user" });
        }

        await User.deleteOne({ _id: req.params.userId });

        await createLog("Delete", "Usuario eliminado", user.usename);


        return res.status(200).send({ message: "User deleted" });
    } catch (error) {
        console.log(error);
        return res.status(500).send({ message: "Error on server side" });
    }
});



const checkIfAdmin = async (userId) => {
    try {
    const user = await User({ _id: userId });
    return user.accessRole === "Admin";
    } catch (error) {
        throw error;
    }
}


const createLog = async (action, details, user, performedBy = "Admin") => {
    try {
        await logAction(new ObjectId(), action, details, user, performedBy)
    } catch (error) {
        throw error;
    }
}



export default router;