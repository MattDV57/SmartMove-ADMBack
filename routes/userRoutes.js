import 'dotenv/config'
import express from 'express'
import { User } from '../models/userModel.js'
import { checkPermissions } from '../middlewares/authz.middleware.js'
import { ACCESS_CONTROL } from '../utils/PERMISSIONS.js'
import { emitAdminEvent } from '../events/bridge/emitters.js'
import { OUTPUT_EVENTS } from '../events/eventNames.js'
import { Log } from '../models/logModel.js'
const router = express.Router()

// TODO: Integration with ldap.

const MODULE_EMITTER = 'Admin. Interna'

/**
Get all users: /users?page=1&limit=10
*/
router.get('/', checkPermissions(ACCESS_CONTROL.GET_ALL_USERS), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limitPerPage = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limitPerPage

    const totalUsers = await User.countDocuments({})

    const foundUsersPaginated = await User.aggregate([
      { $match: { } },
      { $addFields: { lowerFullName: { $toLower: '$fullName' } } },
      { $sort: { lowerFullName: 1 } },
      { $skip: skip },
      { $limit: limitPerPage }
    ])

    return res.status(200).send({ foundUsersPaginated, totalUsers })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

/**
Get user by id || cuit: /users/:userId
 */

router.get('/:userId/profile', checkPermissions(ACCESS_CONTROL.GET_USER_PROFILE), async (req, res) => {
  try {

    const userId = req.params.userId
    const isCuit = !isNaN(userId);

    const filter = isCuit
      ? { cuit: parseInt(userId, 10) } 
      : { _id: userId }; 

    const user = await User.findOne(filter)

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }
    
    user.accessRole = user.accessRole.toLowerCase();

    return res.status(200).send(user)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

/**
Put user: /users/:userId
*/

router.put('/:userId', checkPermissions(ACCESS_CONTROL.PUT_USER), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: req.params.userId },
      req.body,
      { new: true }
    )

    if (updatedUser.accessRole = "Admin") {
      await emitAdminEvent(updatedUser, OUTPUT_EVENTS.ADMIN_UPDATED);
    }

    return res.status(200).send(updatedUser._id)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

/**
Post user: /users
*/

router.post('/', checkPermissions(ACCESS_CONTROL.POST_USER), async (req, res) => {
  try {
    const newUser = new User(req.body)

    const savedUser = await newUser.save()

    if (savedUser.accessRole === 'Admin') {
      await handleAdminCRUD(savedUser, OUTPUT_EVENTS.ADMIN_CREATED, req.user.username)
    }

    return res.status(201).send(savedUser._id)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

/**
Delete user: /users/:userId
 */

router.delete('/:userId', checkPermissions(ACCESS_CONTROL.DELETE_USER), async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    await User.deleteOne(user._id)

    if (user.accessRole === 'Admin') {
      await handleAdminCRUD(user, OUTPUT_EVENTS.ADMIN_DELETED, req.user.username)
    }

    return res.status(200).send({ message: 'User deleted' })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})



const handleAdminCRUD = async (userData, eventName, performedBy) => {
  
  await emitAdminEvent(userData, eventName);

  await Log.create({
    eventType: eventName,
    moduleEmitter: MODULE_EMITTER,
    performedBy
  })

}


export default router
