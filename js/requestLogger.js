import { pool, incrementRequestCount, incrementTotalRequests, insertRequestLog } from './database.js'

async function requestLogger(req, res, next) {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress
  const requestTime = new Date().toISOString()
  const endpoint = req.originalUrl

  try {
    // Check if the request should be logged
    if (!endpoint.startsWith('/lookup') && !endpoint.startsWith('/api')) {
      return next()
    }

    // Acquire a connection from the pool
    const connection = await pool.getConnection()

    // Start a transaction
    await connection.beginTransaction()

    // Increment the request count for this IP address
    await incrementRequestCount(clientIp)

    // Increment the total number of requests
    await incrementTotalRequests()

    // Insert the request log in the database
    await insertRequestLog(clientIp, endpoint, requestTime)

    // Log the request
    console.log(`[${requestTime}] ${clientIp} ${req.method} ${req.originalUrl}`)

    // Commit the transaction
    await connection.commit()

    // Release the connection back to the pool
    connection.release()

    next()
  } catch (error) {
    console.error(`Error logging request: ${error}`)
    // Roll back the transaction on error
    if (connection) {
      await connection.rollback()
    }
    res.status(500).send('Internal Server Error')
  }
}

export default requestLogger