import axios from 'axios'
import converters from '../js/converters.js'
import { Authflow } from 'prismarine-auth'
const BASE_URL = 'https://profile.xboxlive.com'

var XSTSToken
var userHash

// xbox auth
const doAuth = async () => {
    const userIdentifier = 'KejonaMC'
    const cacheDir = './cache'
    const flow = new Authflow(userIdentifier, cacheDir)
    const response = await flow.getXboxToken()
    XSTSToken = response.XSTSToken
    userHash = response.userHash
}

doAuth()

// Handle requests from and to our website.
export function requestWebHandler(extention, res) {
    axios.get(BASE_URL + extention,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'XBL3.0 x=' + userHash + ';' + XSTSToken,
                'x-xbl-contract-version': '3'
            },
            params: {
                "settings": "Gamertag,GameDisplayPicRaw"
            }
        })
        .then(response => {
            if (response.status == 200) {
                var bedrockData = converters.jsonCreator(response.data)
                res.render('pages/account-info', { bedrockData: bedrockData })
            } else {
                res.render('pages/404')
            }
        }).catch(() => {
            res.render('pages/account-not-found')
        })
}
// Handle requests from and to our api endpoints.
export function requestAPIHandler(extention, res) {
    axios.get(BASE_URL + extention,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'XBL3.0 x=' + userHash + ';' + XSTSToken,
                'x-xbl-contract-version': '3'
            },
            params: {
                "settings": "Gamertag,GameDisplayPicRaw"
            }
        })
        .then(response => {
            if (response.status == 200) {
                res.status(200).send(converters.jsonCreator(response.data))
            } else {
                res.status(401).json({ message: 'Could not get account details from xbox api.' })
            }
        }).catch(() => {
            res.status(400).json({ message: 'User not found.' })
        })
}

export default {requestWebHandler, requestAPIHandler}