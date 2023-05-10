import { pool, incrementRequestCount, incrementTotalRequests, insertRequestLog } from './database.js'

async function requestLogger(req, res, next) {
  // Get the client IP address and the request time
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const requestTime = new Date().toISOString()
  let endpoint = req.originalUrl

  // Define the ping endpoint since we use this for better uptime
  const endpointPing = '/api/v1/bedrock/gamertag/kobenetwork'

  try {
    // Check if the request should be logged
    if (endpoint === endpointPing || !endpoint.startsWith('/lookup') && !endpoint.startsWith('/api')) {
      // Skip logging and continue with the middleware chain
      return next()
    }

    if (endpoint.startsWith('/lookup')) {
      // Append the input value to the endpoint for /lookup requests
      if (req.body && req.body.Input) {
        endpoint += `/${req.body.Input}`
      } else {
        // Skip logging and continue with the middleware chain
        return next()
      }
    }

    // Acquire a connection from the database pool
    const connection = await pool.getConnection()

    try {
      // Start a transaction
      await connection.beginTransaction()

      // Increment the request count for this IP address
      await incrementRequestCount(clientIp)

      // Increment the total number of requests
      await incrementTotalRequests()

      // Insert the request log in the database
      await insertRequestLog(clientIp, endpoint, requestTime)

      // Log the request
      console.log(`[${requestTime}] ${clientIp} ${req.method} ${endpoint}`)

      // Commit the transaction
      await connection.commit()
    } catch (error) {
      // Roll back the transaction on error
      await connection.rollback()

      // Log the error
      console.error(`Error logging request: ${error}`)
    } finally {
      // Release the connection back to the pool
      connection.release()
    }

    // Continue with the middleware chain
    next()
  } catch (error) {
    // Log the error
    console.error(`Error acquiring database connection: ${error}`)

    // Continue with the middleware chain
    next()
  }
}

export default requestLogger
