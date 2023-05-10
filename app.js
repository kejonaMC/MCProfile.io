import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import rateLimit from 'express-rate-limit'
import requestLogger from './js/requestLogger.js'

// Routes
import lookupRouter from './routes/lookup.js'
import apiRouter from './routes/api.js'
import endpointsRouter from './routes/endpoints.js'

// Rate limiter for API and cache
const limiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 min
  max: 100,
})

const port = process.env.PORT || 8888
const app = express()

// Middleware
app.set('view engine', 'ejs')
app.set('trust proxy', true)
app.use(express.static('attributes', { extensions: ['ico'] }))
app.use(express.static('attributes'))
app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }))
app.use(limiter)
app.use(requestLogger);

// Router Files
app.use('/lookup', lookupRouter)
app.use('/api', apiRouter)
app.use('/endpoints', endpointsRouter)

// Error handling middleware
// Specific error handling middleware for different types of errors.
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    // Handle JSON parsing errors
    res.status(400).send('Invalid JSON')
  } else if (err) {
    // Handle all other errors
    console.error(err)
    res.status(500).send('Something went wrong')
  } else {
    next()
  }
})

// Redirect to the lookup page
app.get('/', (req, res) => {
  res.redirect('/lookup')
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).render('errors/404', { title: 'Error 404' })
})

// Handle unhandled Promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`)
})

// Run server.
app.listen(port, () => {
  console.log(`Web-server started on port ${port}.`)
})