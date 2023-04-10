require('dotenv').config('/home/container/.env')

const express = require('express')
const port = process.env.PORT
const app = express()
const bodyParser = require('body-parser')
const ejs = require('ejs')
const rateLimit = require('express-rate-limit')
// Routes
const gamertagRouter = require('./routes/gamertag')
const floodgateRouter = require('./routes/floodgate')
const apiRouter = require('./routes/api')
const endpointsRouter = require('./routes/endpoints')

// Rate limiter for api and cache
const limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 min
    max: 100
})

// Middleware
app.use(express.static('attributes'))
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use('/favicon.ico', express.static('attributes/images/favicon.ico'))
app.use(limiter)
// Router Files
app.use('/gamertag', gamertagRouter)
app.use('/floodgate', floodgateRouter)
app.use('/api', apiRouter)
app.use('/endpoints', endpointsRouter)

// Website Index
app.get('/', (req, res) => {
    res.render('pages/index')
});

// run server.
app.listen(port, () => {
    console.log('server started!')
});
