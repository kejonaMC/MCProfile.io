import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import session from 'express-session'
import bodyParser from 'body-parser'
import ejs from 'ejs'
import rateLimit from 'express-rate-limit'
import requestLogger from './js/requestLogger.js'

// Routes
import lookupRouter from './routes/lookup.js'
import apiRouter from './routes/api.js'
import endpointsRouter from './routes/endpoints.js'
import authRouter from './routes/auth.js'

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
app.use(requestLogger)
app.use(
  session({
    secret: process.env.SECRETKEY,
    resave: false,
    saveUninitialized: true
  })
)

// Router Files
// Set up a custom middleware to intercept requests to the root URL
app.use((req, res, next) => {
  // Check if the requested URL is the root URL
  if (req.originalUrl === '/') {
    if (req.method === 'GET') {
      // If it's a GET request to the root URL, render the response directly from the lookup router
      return lookupRouter(req, res, next)
    } else if (req.method === 'POST') {
      // If it's a POST request to the root URL, pass it on to the lookup router
      return lookupRouter.handle(req, res, next)
    }
  }
  // If not, continue processing the request
  next()
})

app.use('/api', apiRouter)
app.use('/endpoints', endpointsRouter)
app.use('/auth', authRouter)


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