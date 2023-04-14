require('dotenv').config()

const express = require('express')
const port = process.env.PORT
const app = express()
const bodyParser = require('body-parser')
const ejs = require('ejs')
const rateLimit = require('express-rate-limit')
// Routes
const lookupRouter = require('./routes/lookup')
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
app.use('/lookup', lookupRouter)
app.use('/api', apiRouter)
app.use('/endpoints', endpointsRouter)

// Website Index
app.get('/', (req, res) => {
    res.render('pages/index')
});

// run server.
app.listen(port, () => {
    console.log('server started! on port ' + port)
});
