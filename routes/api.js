import express from 'express'
import apicache from 'apicache'
import converters from '../js/converters.js'
import xboxRequest from '../js/xboxRequest.js'

const router = express.Router()
const cache = apicache.middleware

// Gamertag endpoint
router.get('/v1/gamertag/:gamertag', cache('10 minutes'), async (req, res, next) => {
  try {
    await xboxRequest.requestAPIHandler('/users/gt(' + req.params.gamertag + ')/profile/settings', res)
  } catch (error) {
    next(error)
  }
})

// Xuid endpoint
router.get('/v1/xuid/:xuid', cache('10 minutes'), async (req, res, next) => {
  try {
    await xboxRequest.requestAPIHandler('/users/xuid(' + req.params.xuid + ')/profile/settings', res)
  } catch (error) {
    next(error)
  }
})

// Fuuid endpoint
router.get('/v1/fuid/:fuuid', cache('10 minutes'), async (req, res, next) => {
  try {
    await xboxRequest.requestAPIHandler('/users/xuid(' + converters.makeXuid(req.params.fuuid) + ')/profile/settings', res)
  } catch (error) {
    next(error)
  }
})

// Error handling middleware
router.use((error, req, res, next) => {
  console.error(error)
  res.status(500).send({ message: 'Internal server error.' })
})

export default router