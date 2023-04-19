import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import rateLimit from 'express-rate-limit'
import logger from './js/logger.js'

// Routes
import lookupRouter from './routes/lookup.js'
import apiRouter from './routes/api.js'
import endpointsRouter from './routes/endpoints.js'
import documentationRouter from './routes/documentation.js'

dotenv.config()
const port = process.env.PORT || 8888
const app = express()

// Rate limiter for api and cache
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 100,
})

// Middleware
app.use(express.static('attributes'))
app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use('/favicon.ico', express.static('attributes/images/favicon.ico'))
app.use(limiter)
app.use(logger)

// Router Files
app.use('/lookup', lookupRouter)
app.use('/api', apiRouter)
app.use('/endpoints', endpointsRouter)
app.use('/documentation', documentationRouter)

// Website Index
app.get('/', (req, res) => {
  res.render('pages/index', { title: 'Homepage' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Something went wrong')
})
app.use(function(req, res) {
  res.render('errors/404', { title: 'Error 404' });
});

// run server.
app.listen(port, () => {
  console.log('Web-server started on port ' + port + '.')
})
