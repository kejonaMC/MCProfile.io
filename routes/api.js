const express = require('express')
const router = express.Router()
const apicache = require('apicache')
const converters = require('../converters')
const request = require('../request')

let cache = apicache.middleware

// Gamertag endpoint
router.get('/v1/gamertag/:gamertag', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler(request.BASE_API_URL + request.FRIENDS + req.params.gamertag, res)
})

// Xuid endpoint
router.get('/v1/xuid/:xuid', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler(request.BASE_API_URL + request.ACCOUNT + req.params.xuid, res)
})

// Fuuid endpoint
router.get('/v1/fuid/:fuuid', cache('10 minutes'), async (req, res) => {
    request.requestAPIHandler(request.BASE_API_URL + request.ACCOUNT + converters.makeXuid(req.params.fuuid), res)
})

module.exports = router