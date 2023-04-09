require('dotenv').config('/home/container/.env')

const express = require('express')
const hexToUuid = require('hex-to-uuid')
const port = process.env.PORT
const app = express()
const request = require('request')
const bodyParser = require('body-parser')
const ejs = require('ejs')
const rateLimit = require('express-rate-limit')
const apicache = require('apicache')
// Call URL
const BASE_API_URL = 'https://xbl.io/api/v2'
const FRIENDS = '/friends/search?gt='
const ACCOUNT = '/account/'

// Rate limiter for api and cache
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 min
    max: 250
})

let cache = apicache.middleware

// Website pages
app.get('/', (req, res) => {
    res.render('pages/index')
});

app.get('/floodgate', (req, res) => {
    res.render('pages/floodgate')
});

app.get('/gamertag', (req, res) => {
    res.render('pages/gamertag')
});

app.get('/endpoints', (req, res) => {
    res.render('pages/endpoints')
});

// Middleware
app.use(express.static('attributes'))
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use('/favicon.ico', express.static('attributes/images/favicon.ico'))
app.use(limiter)

app.post('/floodgate', getBedrockDataButton)
app.post('/gamertag', getBedrockDataButton)

// getBedrockDataButton gets triggered on the submit post on the index page.
function getBedrockDataButton(req, res) {
    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                var bedrockData = jsonCreator(JSON.parse(body))
                res.render('pages/account-info', {bedrockData:bedrockData})
            } else {
                res.render('pages/account-not-found')
            }
        } catch (errorLog) {
            res.render('pages/404')
        }
    }
    if (req.body.gamertag !== undefined) {
        request(urlOptions(BASE_API_URL + FRIENDS, req.body.gamertag), callback)
    } else {
        request(urlOptions(BASE_API_URL + ACCOUNT, makeXuid(req.body.floodgate)), callback)
    }
}

// Gamertag endpoint
app.get('/api/v1/gamertag/:gamertag', cache('2 minutes'), async (req, res) => {
    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                res.status(200).send(jsonCreator(JSON.parse(body)))
            } else {
                res.status(401).json({ message: 'Could not get account details from xbox api.' })
            }
        } catch (errorLog) {
            res.status(400).json({ message: 'User not found.' })
        }
    }
    request(urlOptions(BASE_API_URL + FRIENDS, req.params.gamertag), callback);
})

// Xuid endpoint
app.get('/api/v1/xuid/:xuid', cache('2 minutes'), async (req, res) => {
    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                res.status(200).send(jsonCreator(JSON.parse(body)))
            } else {
                res.status(401).json({ message: 'Could not get account details from xbox api.' })
            }
        } catch (errorLog) {
            res.status(400).json({ message: 'User not found.' })
        }
    }
    request(urlOptions(BASE_API_URL + ACCOUNT, req.params.xuid), callback)
})

// Fuuid endpoint
app.get('/api/v1/fuid/:fuuid', cache('2 minutes'), async (req, res) => {
    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                res.status(200).send(jsonCreator(JSON.parse(body)))
            } else {
                res.status(401).json({ message: 'Could not get account details from xbox api.' })
            }
        } catch (errorLog) {
            res.status(400).json({ message: 'User not found.' })
        }
    }
    request(urlOptions(BASE_API_URL + ACCOUNT, makeXuid(req.params.fuuid)), callback)
})

// Friends endpoint
app.get('/api/v1/friends/:xuid', cache('2 minutes'), async (req, res) => {
    function callback(error, response, body) {
        try {
            if (!error && response.statusCode == 200) {
                res.status(200).send(jsonCreatorFriends(JSON.parse(body)))
            } else {
                res.status(401).json({ message: 'Could not get account details from xbox api.' })
            }
        } catch (errorLog) {
            res.status(400).json({ message: 'User not found.' })
        }
    }
    request(urlOptions(BASE_API_URL + FRIENDS, req.params.xuid), callback)
})

function urlOptions(URL, option) {
    var getOptions = {
        uri: URL + option,
        headers: {
            'X-Authorization': process.env.API_KEY,
            'Accepts': 'application/json'
        },
        method: 'GET'
    };
    return getOptions;
}

function jsonCreatorFriends(xblJson) {
    var friends = xblJson.people;
    var obj = [];
    for (var i = 0; i < friends.length; i++) {
        obj.push({
            "gamertag": friends[i].gamertag,
            "xuid": friends[i].xuid
        });
    }
    return obj;
}

// Generate the xboxlive json data.
function jsonCreator(xblJson) {
    var obj = {
        "gamertag": xblJson.profileUsers[0].settings[2].value,
        "xuid": xblJson.profileUsers[0].id,
        "floodgateuid": makeFuuid(parseInt(xblJson.profileUsers[0].id)),
        "icon": xblJson.profileUsers[0].settings[0].value,
    };
    return obj;
}

// Convert xuid into FUUID.
function makeFuuid(xuid) {
    var hexFUUID = "0000000000000000000" + xuid.toString(16);
    return hexToUuid(hexFUUID);
}
function makeXuid(fuuid) {
    var zeroStrip = fuuid.substring(22).replace( /-/g, "" );
    return parseInt(zeroStrip, 16);
}

// run server.
app.listen(port, () => {
    console.log('server started!')
});
