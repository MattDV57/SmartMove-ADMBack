import express from 'express'
import { Claim } from '../models/claimModel.js'
import { Chat } from '../models/chatModel.js'
import { checkPermissions } from '../middlewares/authz.middleware.js'
import { ACCESS_CONTROL, INTERNAL_ROLES } from '../utils/PERMISSIONS.js'
import { emitClaimEvent } from '../events/bridge/emitters.js'
import { OUTPUT_EVENTS } from '../events/eventNames.js'

const router = express.Router()

// Get all claims
router.get('/', checkPermissions(ACCESS_CONTROL.GET_ALL_CLAIMS), async (req, res) => {
  try {
    const { foundClaimsPaginated, totalClaims } = await getPaginatedClaims(req)

    return res.status(200).send({ foundClaimsPaginated, totalClaims })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

// Get my claims
router.get('/involved/:username', checkPermissions(ACCESS_CONTROL.GET_MY_CLAIMS), async (req, res) => {
  try {
    const filter = Object.values(INTERNAL_ROLES).includes(req.user.accessRole)
      ? { assignedOperator: req.params.username }
      : { 'user.cuil': req.user.cuil }

    const { foundClaimsPaginated, totalClaims } = await getPaginatedClaims(req, filter)

    return res.status(200).send({ foundClaimsPaginated, totalClaims })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
}
)

const getPaginatedClaims = async (req, filter = {}) => {
  const page = parseInt(req.query.page) || 1
  const limitPerPage = parseInt(req.query.limit) || 10
  const skip = (page - 1) * limitPerPage
  const caseType = req.query.caseType || 'Reclamo'

  // Necessary for pagination in DataGrid, 2x(ms) with this
  const totalClaims = await Claim.countDocuments({
    caseType,
    ...filter
  })

  const foundClaimsPaginated = await Claim.aggregate([
    { $match: { caseType, ...filter } },
    { $sort: { timestamp: -1 } },
    { $skip: skip },
    { $limit: limitPerPage }
  ])

  return { foundClaimsPaginated, totalClaims }
}

// Get dashboard data
router.get('/dashboard', checkPermissions(ACCESS_CONTROL.GET_DASHBOARD), async (req, res) => {
  try {
    const today = new Date()
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + 1)
    )
    startOfWeek.setHours(0, 0, 0, 0)

    const newMediationsThisWeek = await Claim.countDocuments({
      caseType: 'Mediacion',
      timestamp: { $gte: startOfWeek }
    })

    const newClaimsThisWeek = await Claim.countDocuments({
      caseType: 'Reclamo',
      timestamp: { $gte: startOfWeek }
    })

    const claimsInProgress = await Claim.countDocuments({
      caseType: 'Reclamo',
      status: 'En Proceso'
    })

    const mediationsInProgress = await Claim.countDocuments({
      caseType: 'Mediacion',
      status: 'En Proceso'
    })

    const claimsByCategory = await Claim.aggregate([
      { $match: { caseType: 'Reclamo' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    const arbitrationsByCategory = await Claim.aggregate([
      { $match: { caseType: 'Mediacion' } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ])

    return res.status(200).send({
      newMediationsThisWeek,
      newClaimsThisWeek,
      claimsInProgress,
      mediationsInProgress,
      claimsByCategory,
      arbitrationsByCategory
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

router.post('/', checkPermissions(ACCESS_CONTROL.POST_CLAIM), async (req, res) => {
  try {

    const createdClaim = await Claim.create(req.body);

    return res.status(200).send(createdClaim)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ error: error.errors })
  }
})

router.put('/:claimId', checkPermissions(ACCESS_CONTROL.PUT_CLAIM), async (req, res) => {
  try {
    const updatedClaim = await Claim.findOneAndUpdate(
      {
        _id: req.params.claimId
      },
      req.body,
      { new: true }
    )

    await emitClaimEvent(updatedClaim, OUTPUT_EVENTS.CLAIM_UPDATED);

    return res.status(200).send(updatedClaim)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

router.put('/:claimId/assign-chat',  async (req, res) => {
  try {
    const chatID = req.body.chatID
    const updatedClaim = await Claim.findOneAndUpdate(
      { _id: req.params.claimId },
      { relatedChat: chatID },
      { new: true }
    )

    if (!updatedClaim) {
      return res.status(404).send('Claim not found')
    }

    return res.status(200).send(updatedClaim)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

router.get('/:claimId/chat', checkPermissions(ACCESS_CONTROL.GET_CHAT_HISTORY), async (req, res) => {
  try {
    const foundClaim = await Claim.findById(req.params.claimId)
    if (!foundClaim) {
      return res.status(404).send('Claim not found')
    }
    const foundChat = await Chat.findById(foundClaim.relatedChat)
    return res.status(200).send(foundChat)
  } catch (error) {
    console.log(error)
    return res.status(500).send({ message: 'Error on server side' })
  }
})

export default router
