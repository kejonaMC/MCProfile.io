import express from 'express'
import profile from '../js/profileSetup.js'
import xboxRequest from '../js/xboxRequest.js'
import skinRequest from '../js/skinRequest.js'

const router = express.Router()

const GAMERTAG_API_PATH = '/users/gt('
const XUID_API_PATH = '/users/xuid('

const ERROR_MESSAGES = {
  NOT_FOUND: 'Not found',
  UNKNOWN: 'Unknown error occurred',
}

const TITLES = {
  LOOKUP: 'Lookup',
  ACCOUNT_NOT_FOUND: 'Account Not Found',
  ERROR_404: 'Error 404',
}

const PATHS = {
  LOOKUP: '/',
  ACCOUNT_NOT_FOUND: '/account-not-found',
}

router.get(PATHS.LOOKUP, async (req, res) => {
  res.render('pages/lookup', { title: TITLES.LOOKUP })
})

router.post(PATHS.LOOKUP, async (req, res) => {
  const { lookupOption, lookup } = req.body

  try {
    let xboxResponse

    switch (lookupOption) {
      case 'Gamertag':
        xboxResponse = await xboxRequest.requestXBLData(
          `${GAMERTAG_API_PATH}${lookup})/profile/settings`)
        break
      case 'Fuuid':
        xboxResponse = await xboxRequest.requestXBLData(
          `${XUID_API_PATH}${profile.createXuid(lookup)})/profile/settings`)
        break
      default:
        throw new Error(ERROR_MESSAGES.NOT_FOUND)
    }

    const bedrockData = await profile.setup(xboxResponse.body)
    const imageUrl = await skinRequest.getSkinImage(bedrockData.textureid)

    res.render('pages/account-info', { bedrockData ,title: bedrockData.gamertag })
  } catch (error) {
    res.status(404).render('pages/account-not-found', { title: TITLES.ACCOUNT_NOT_FOUND })
  }
})

router.use((err, req, res, next) => {
  if (err) {
    console.error(err)
    res.status(500).render('errors/500', { title: TITLES.ERROR_500 })
  } else {
    next()
  }
})

router.use((req, res) => {
  res.status(404).render('errors/404', { title: TITLES.ERROR_404 })
})

export default router