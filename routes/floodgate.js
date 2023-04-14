const express = require('express')
const router = express.Router()
const converters = require('../converters')
const request = require('../request')

router.get('/', (req, res) => {
    res.render('pages/floodgate')
});

router.post('/', async (req, res) => {
    request.requestWebHandler('/users/xuid(' + converters.makeXuid(req.body.floodgate) + ')/profile/settings', res)
})

module.exports = router