const express = require('express')
const router = express.Router()
const apicache = require('apicache')
const converters = require('../converters')
const request = require('../request')

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

module.exports = router