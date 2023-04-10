const express = require('express')
const router = express.Router()
const request = require('../request')

router.get('/', (req, res) => {
    res.render('pages/gamertag')
});

router.post('/', async (req, res) => {
    request.requestWebHandler(request.BASE_API_URL + request.FRIENDS + req.body.gamertag, res)
})

module.exports = router