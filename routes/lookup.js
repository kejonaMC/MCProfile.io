import express from 'express'
import converters from '../js/converters.js'
import xboxRequest from '../js/xboxRequest.js'

const router = express.Router()

const GAMERTAG_API_PATH = '/users/gt('
const XUID_API_PATH = '/users/xuid('

router.get('/', async (req, res) => {
    res.render('pages/lookup', { title: 'Lookup' })
})

router.post('/', async (req, res) => {
    const { lookupOption, lookup } = req.body
    switch (lookupOption) {
        case 'Gamertag':
            xboxRequest.requestWebHandler(`${GAMERTAG_API_PATH}${lookup})/profile/settings`, res)
            break
        case 'Fuuid':
            xboxRequest.requestWebHandler(`${XUID_API_PATH}${converters.makeXuid(lookup)})/profile/settings`, res)
            break
        default:
            res.render('errors/404')
    }
})

export default router