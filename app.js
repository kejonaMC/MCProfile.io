import dotenv from 'dotenv'

import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import rateLimit from 'express-rate-limit'
// Routes
import lookupRouter from './routes/lookup.js'
import apiRouter from './routes/api.js'
import endpointsRouter from './routes/endpoints.js'
import endpointLogger from './js/stats.js'

dotenv.config()
const port = process.env.PORT
const app = express()

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
app.use(endpointLogger)
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
    console.log('Web-server started on port ' + port + '.')
});
