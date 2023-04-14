const express = require('express')
const router = express.Router()
const converters = require('../converters')
const request = require('../request')

router.get('/', (req, res) => {
    res.render('pages/lookup')
});

router.post('/', async (req, res) => {
    console.log(req.body)
    switch(req.body.lookupOption) {
        case 'Gamertag': request.requestWebHandler('/users/gt(' + req.body.lookup + ')/profile/settings', res)
        break
        case 'Fuuid': request.requestWebHandler('/users/xuid(' + converters.makeXuid(req.body.lookup) + ')/profile/settings', res)
        break
        default: res.render('pages/404')
    }
})

module.exports = router