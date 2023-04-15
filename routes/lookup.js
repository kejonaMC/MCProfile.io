import express from 'express'
import converters from '../converters.js'
import request from '../request.js'

const router = express.Router()
router.get('/', (req, res) => {
    res.render('pages/lookup')
});

router.post('/', async (req, res) => {
    switch(req.body.lookupOption) {
        case 'Gamertag': request.requestWebHandler('/users/gt(' + req.body.lookup + ')/profile/settings', res)
        break
        case 'Fuuid': request.requestWebHandler('/users/xuid(' + converters.makeXuid(req.body.lookup) + ')/profile/settings', res)
        break
        default: res.render('pages/404')
    }
})

export default router