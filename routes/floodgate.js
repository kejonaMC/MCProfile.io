const express = require('express')
const router = express.Router()
const converters = require('../converters')
const request = require('../request')

router.get('/', (req, res) => {
    res.render('pages/floodgate')
});

router.post('/', async (req, res) => {
    request.requestWebHandler(request.BASE_API_URL + request.ACCOUNT + converters.makeXuid(req.body.floodgate), res)
})

module.exports = router