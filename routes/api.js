import express from 'express'
import apicache from 'apicache'
import converters from '../converters.js'
import request from '../request.js'

const router = express.Router()
let cache = apicache.middleware

// Gamertag endpoint
router.get('/v1/gamertag/:gamertag', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler('/users/gt(' + req.params.gamertag + ')/profile/settings', res)
})

// Xuid endpoint
router.get('/v1/xuid/:xuid', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler('/users/xuid(' + req.params.xuid + ')/profile/settings', res)
})

// Fuuid endpoint
router.get('/v1/fuid/:fuuid', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler('/users/xuid(' + converters.makeXuid(req.params.fuuid) + ')/profile/settings', res)
})

export default router