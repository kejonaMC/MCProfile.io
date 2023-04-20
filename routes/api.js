import express from 'express'
import apicache from 'apicache'
import profile from '../js/profileSetup.js'
import xboxRequest from '../js/xboxRequest.js'

const router = express.Router()
const gamertagApiPath = '/users/gt('
const xuidApiPath = '/users/xuid('
const cacheTime = '10 minutes'
const errorMessage = 'Could not get account details from xbox api.'

const cacheMiddleware = apicache.middleware(cacheTime)

const respond = async (xboxResponse, res) => {
  try {
    const profileData = await profile.setup(xboxResponse.body)
    res.status(200).send(profileData)
  } catch (error) {
    res.status(400).json({ message: errorMessage })
  }
}

router.get('/v1/gamertag/:gamertag', cacheMiddleware, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${gamertagApiPath}${req.params.gamertag})/profile/settings`)
    respond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/xuid/:xuid', cacheMiddleware, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${req.params.xuid})/profile/settings`)
    respond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/fuid/:fuuid', cacheMiddleware, async (req, res) => {
  try {
    const xuid = profile.createXuid(req.params.fuuid)
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${xuid})/profile/settings`)
    respond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

export default router
