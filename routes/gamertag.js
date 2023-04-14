const express = require('express')
const router = express.Router()
const request = require('../request')

router.get('/', (req, res) => {
    res.render('pages/gamertag')
});

router.post('/', async (req, res) => {
    request.requestWebHandler('/users/gt(' + req.body.gamertag + ')/profile/settings', res)
})

module.exports = router