import express from 'express'
import profile from '../js/profileSetup.js'
import xboxRequest from '../js/xboxRequest.js'
import minecraftRequest from '../js/minecraftRequest.js'

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
    try {
        res.render('pages/lookup', { title: TITLES.LOOKUP })
    } catch (error) {
        res.status(500).render('errors/500', { title: TITLES.ERROR_500 })
    }
})

router.post(PATHS.LOOKUP, async (req, res) => {
    const { lookupOption, lookup } = req.body

    try {
        let Response
        let bedrockData
        let javaData

        switch (lookupOption) {
            case 'Bedrock Username':
                Response = await xboxRequest.requestXBLData(
                    `${GAMERTAG_API_PATH}${lookup})/profile/settings`
                )
                bedrockData = await profile.bedrockSetup(Response.body)
                res.render('pages/bedrock-account-info', { bedrockData, title: bedrockData.gamertag })
                break
            case 'Java Username':
                Response = await minecraftRequest.requestMCData(lookup, true)
                javaData = await profile.javaSetup(Response)
                res.render('pages/java-account-info', { javaData, title: javaData.name })
                break
            case 'Fuuid':
                Response = await xboxRequest.requestXBLData(
                    `${XUID_API_PATH}${profile.createXuid(lookup)})/profile/settings`
                )
                bedrockData = await profile.bedrockSetup(Response.body)
                res.render('pages/bedrock-account-info', { bedrockData, title: bedrockData.gamertag })
                break
            case 'Juuid':
                Response = await minecraftRequest.requestMCData(lookup, false)
                javaData = await profile.javaSetup(Response)
                res.render('pages/java-account-info', { javaData, title: javaData.name })
                break
            default:
                throw new Error(ERROR_MESSAGES.NOT_FOUND)
        }
    } catch (error) {

        res.status(505).render('pages/account-not-found', { title: TITLES.ACCOUNT_NOT_FOUND })

    }
})

router.use((req, res, next) => {
    res.status(404).render('errors/404', { title: TITLES.ERROR_404 })
})

export default router