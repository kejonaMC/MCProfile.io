const axios = require('axios')
const converters = require('./converters')
// Constant URLS
const BASE_API_URL = 'https://xbl.io/api/v2'
const FRIENDS = '/friends/search?gt='
const ACCOUNT = '/account/'
// XBL Headers
const headers = {
    'X-Authorization': process.env.API_KEY,
    'Accepts': 'application/json'
};
// Handle request/response from API request.
function requestAPIHandler(url, res) {
    axios.get(url, {
        headers: headers,
    })
        .then(function (serverResponse) {
            try {
                if (serverResponse.status == 200) {
                    res.status(200).send(converters.jsonCreator(serverResponse.data))
                } else {
                    res.status(401).json({ message: 'Could not get account details from xbox api.' })
                }
            } catch (errorLog) {
                res.status(400).json({ message: 'User not found.' })
            }
        })
}
// Handle request/response from web request.
function requestWebHandler(url, res) {
    axios.get(url, {
        headers: headers,
    })
        .then(function (serverResponse) {
            try {
                if (serverResponse.status == 200) {
                    var bedrockData = converters.jsonCreator(serverResponse.data)
                    res.render('pages/account-info', { bedrockData: bedrockData })
                } else {
                    res.render('pages/account-not-found')
                }
            } catch (errorLog) {
                res.render('pages/404')
            }
        })
}
module.exports = { 
    requestAPIHandler, 
    requestWebHandler,
    BASE_API_URL,
    FRIENDS,
    ACCOUNT
}