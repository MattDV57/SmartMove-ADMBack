import 'dotenv/config'
import express from 'express'
import { User } from '../Models/userModel.js'
import jsonwebtoken from 'jsonwebtoken'
import { ACCESS_CONTROL } from '../utils/PERMISSIONS.js'
import authenticateToken from '../Middlewares/jwtChecker.js'

const router = express.Router()

router.post('/', async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email }).select('-password -createdAt -updatedAt -__v')

    if (!user) {
      return res.status(404).send({ message: 'User not found' })
    }

    const USER_PERMISSIONS = {}

    Object.entries(ACCESS_CONTROL).forEach(([method, requiredRoles]) => {
      USER_PERMISSIONS[method] = requiredRoles.includes(user.accessRole)
    }
    )

    const accessToken = jsonwebtoken.sign(
      {
        userId: user._id,
        email: user.email,
        username: user.username,
        accessRole: user.accessRole
      },
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: '24h' }
    )

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: false,
      maxAge: 24 * 60 * 60 * 1000, // Expira en 24 horas
      sameSite: 'strict'
    })

    res.status(200).send({ ...user._doc, USER_PERMISSIONS })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

// GET user externo por cookies
router.get('/user-session', authenticateToken, async (req, res) => {
  try {
    const USER_PERMISSIONS = {}

    Object.entries(ACCESS_CONTROL).forEach(([method, requiredRoles]) => {
      USER_PERMISSIONS[method] = requiredRoles.includes(req.user.accessRole)
    })

    res.status(200).send({ user: req.user, USER_PERMISSIONS })
  } catch (error) {
    res.status(500).send({ message: 'Error on server side' })
  }
})

router.post('/logout', (req, res) => {
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'strict'
  })

  res.status(200).send({ message: 'Succesful logout' })
})

export default router
