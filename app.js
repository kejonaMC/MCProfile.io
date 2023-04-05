require('dotenv').config('/home/container/.env')

const express = require('express')
const hexToUuid = require('hex-to-uuid')
const port = process.env.PORT
const app = express()
const request = require('request')
const bodyParser = require('body-parser')
const ejs = require('ejs')
// Call URL
const BASE_API_URL = 'https://xbl.io/api/v2'
const FRIENDS = '/friends/search?gt='
const ACCOUNT = '/account/'

// Website index page loading.
app.get('/', (req, res) => {
    res.render('pages/index')
});

app.get('/fuuid', (req, res) => {
    res.render('pages/fuuid')
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

// Endpoints
app.get('/api/v1/gamertag/:gamertag', getGamertagAPI)
app.get('/api/v1/xuid/:xuid', getXUIDAPI)
app.get('/api/v1/fuid/:fuuid', getFUUIDAPI)
app.get('/api/v1/friends/:xuid', getFriendsAPI)
app.post('/', getBedrockDataButton)
app.post('/fuuid', getBedrockDataButton)

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
        request(urlOptions(BASE_API_URL + ACCOUNT, makeXuid(req.body.fuuid)), callback)
    }
}

// Gamertag endpoint
function getGamertagAPI(req, res) {
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
}

//xuid endpoint
function getXUIDAPI(req, res) {
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
}

function getFUUIDAPI(req, res) {
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
}

//friendslist endpoint
function getFriendsAPI(req, res) {
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
}

// XBL.IO headers and options.
const headers = {
    'X-Authorization': process.env.API_KEY,
    'Accepts': 'application/json'
};

function urlOptions(URL, option) {
    var getOptions = {
        uri: URL + option,
        headers: headers,
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
