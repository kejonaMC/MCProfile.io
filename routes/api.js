import express from 'express'
import apicache from 'apicache'
import profile from '../js/profileSetup.js'
import xboxRequest from '../js/xboxRequest.js'
import minecraftRequest from '../js/minecraftRequest.js'
import { checkRequestLimit, incrementTotalRequests, incrementRequestsPerHour, isApiKeyPresent } from '../js/database.js'

const router = express.Router()
const gamertagApiPath = '/users/gt('
const xuidApiPath = '/users/xuid('
const cacheTime = '10 minutes'
const errorMessage = 'Could not get account details from xbox api.'

const cacheMiddleware = apicache.middleware(cacheTime)

const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key']

  try {
    // Check if the API key is present in the database
    const apiKeyPresent = await isApiKeyPresent(apiKey)
    if (!apiKeyPresent) {
      return res.status(401).json({ message: 'Invalid API key.' })
    }

    // Check the request limit for the API key
    const withinLimit = await checkRequestLimit(apiKey)
    if (!withinLimit) {
      return res.status(429).json({ message: 'Too many requests. Please try again later.' })
    }

    await Promise.all([incrementRequestsPerHour(apiKey), incrementTotalRequests()])

    req.user = { apiKey }

    next()
  } catch (error) {
    console.error('Error authenticating API key:', error)
    res.status(500).json({ message: 'An error occurred while authenticating the API key.' })
  }
}

router.get('/v1/bedrock/gamertag/:gamertag', cacheMiddleware, authenticateApiKey, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${gamertagApiPath}${req.params.gamertag})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/bedrock/xuid/:xuid', cacheMiddleware, authenticateApiKey, async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${req.params.xuid})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/bedrock/fuid/:fuuid', cacheMiddleware, authenticateApiKey, async (req, res) => {
  try {
    const xuid = profile.createXuid(req.params.fuuid)
    const xboxResponse = await xboxRequest.requestXBLData(`${xuidApiPath}${xuid})/profile/settings`)
    bedrockRespond(xboxResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/java/username/:username', cacheMiddleware, authenticateApiKey, async (req, res) => {
  try {
    const minecraftResponse = await minecraftRequest.requestMCData(req.params.username, true)
    javaRespond(minecraftResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/java/uuid/:uuid', cacheMiddleware, authenticateApiKey, async (req, res) => {
  try {
    const minecraftResponse = await minecraftRequest.requestMCData(req.params.uuid, false)
    javaRespond(minecraftResponse, res)
  } catch (error) {
    res.status(404).json({ message: 'User not found.' })
  }
})

router.get('/v1/status/health', async (req, res) => {
  try {
    const xboxResponse = await xboxRequest.requestXBLData(`${gamertagApiPath}kobenetwork)/profile/settings`)
    const profileData = await profile.bedrockSetup(xboxResponse.body)
    if (profileData.gamertag === 'KobeNetwork') {
      res.status(200).json({ health: 'ok' })
    } else {
      res.status(402).json({ health: 'nok' })
    }
  } catch (error) {
    res.status(404).json({ health: 'nok' })
  }
})

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

export default router