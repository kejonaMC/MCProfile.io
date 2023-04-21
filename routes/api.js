import express from 'express'
import apicache from 'apicache'
import profile from '../js/profileSetup.js'
import xboxRequest from '../js/xboxRequest.js'
import minecraftRequest from '../js/minecraftRequest.js'

const router = express.Router()
const gamertagApiPath = '/users/gt('
const xuidApiPath = '/users/xuid('
const cacheTime = '10 minutes'
const errorMessage = 'Could not get account details from xbox api.'

const cacheMiddleware = apicache.middleware(cacheTime)

const bedrockRespond = async (xboxResponse, res) => {
  try {
    const profileData = await profile.bedrockSetup(xboxResponse.body)
    res.status(200).send(profileData)
  } catch (error) {
    res.status(400).json({ message: errorMessage })
  }
}
const javaRespond = async (javaResponse, res) => {
  try {
    const profileData = await profile.javaSetup(javaResponse)
    res.status(200).send(profileData)
  } catch (error) {
    res.status(400).json({ message: errorMessage })
  }
}

router.get('/v1/bedrock/gamertag/:gamertag', cacheMiddleware, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${gamertagApiPath}${req.params.gamertag})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/bedrock/xuid/:xuid', cacheMiddleware, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${req.params.xuid})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/bedrock/fuid/:fuuid', cacheMiddleware, async (req, res) => {
  try {
    const xuid = profile.createXuid(req.params.fuuid)
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${xuid})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/java/username/:username', cacheMiddleware, async (req, res) => {
  try {
    const minecraftResponse = await minecraftRequest.requestMCData(req.params.username, true)
    javaRespond(minecraftResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/java/uuid/:uuid', cacheMiddleware, async (req, res) => {
  try {
    const minecraftResponse = await minecraftRequest.requestMCData(req.params.uuid, false)
    javaRespond(minecraftResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

export default router
