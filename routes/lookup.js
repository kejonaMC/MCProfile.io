import express from 'express'
import converters from '../js/converters.js'
import xboxRequest from '../js/xboxRequest.js'

const router = express.Router()
router.get('/', (req, res) => {
    res.render('pages/lookup')
});

router.post('/', async (req, res) => {
    switch(req.body.lookupOption) {
        case 'Gamertag': xboxRequest.requestWebHandler('/users/gt(' + req.body.lookup + ')/profile/settings', res)
        break
        case 'Fuuid': xboxRequest.requestWebHandler('/users/xuid(' + converters.makeXuid(req.body.lookup) + ')/profile/settings', res)
        break
        default: res.render('errors/404')
    }
})

export default router