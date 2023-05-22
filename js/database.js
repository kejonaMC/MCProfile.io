import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import moment from 'moment'

// Load the environment variables from .env file
dotenv.config()

// Create a connection pool with the database credentials
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSERNAME,
  port: process.env.DBPORT,
  password: process.env.DBPASSWORD,
  database: 'test',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Create the necessary tables in the database
const createTables = async () => {
  try {
    const query1 =
      'CREATE TABLE IF NOT EXISTS request_totals (id INT PRIMARY KEY, total INT)'
    const query2 = `
      CREATE TABLE IF NOT EXISTS api_keys (
        id INT AUTO_INCREMENT PRIMARY KEY,
        xuid VARCHAR(255) UNIQUE,
        api_key VARCHAR(255),
        generated_at DATETIME,
        requests_per_hour INT DEFAULT 0,
        total_requests INT DEFAULT 0,
        INDEX api_key_unique_idx (api_key)
      )
    `

    await executeQuery(query1)
    await executeQuery(query2)

    console.log('Tables created/loaded successfully')
  } catch (error) {
    console.error(`Error creating tables: ${error}`)
  }
}

// Check the connection to the database and retry if necessary
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection()
    try {
      console.log('Database connected successfully')
      await createTables()
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error(`Error connecting to database: ${error}`)
  }
}

// Check the connection every 10 minutes
setInterval(() => {
  checkConnection()
}, 10 * 60 * 1000)

// Reset all request counters for all API keys
setInterval(() => {
  resetRequestsPerHour()
}, 60 * 60 * 1000)

// Connect to the database and create the necessary tables
checkConnection()

const executeQuery = async (query, params = []) => {
  try {
    const connection = await pool.getConnection()
    try {
      const [results] = await connection.query(query, params)
      return results
    } finally {
      connection.release()
    }
  } catch (error) {
    console.error(`Error executing query: ${error}`)
    throw error
  }
}

const incrementTotalRequests = async () => {
  try {
    const results = await executeQuery(
      'INSERT INTO request_totals (id, total) VALUES (1, 1) ON DUPLICATE KEY UPDATE total = total + 1'
    )
    return results
  } catch (error) {
    console.error(`Error incrementing total requests: ${error}`)
    throw error
  }
}

const getTotalRequests = async () => {
  try {
    const result = await executeQuery(
      'SELECT total FROM request_totals WHERE id = 1'
    )
    return result[0].total
  } catch (error) {
    console.error(`Error getting total requests: ${error}`)
    return null
  }
}

const insertApiKey = async (xuid, apiKey) => {
  try {
    const generatedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    await executeQuery(
      'INSERT INTO api_keys (xuid, api_key, generated_at) VALUES (?, ?, ?)',
      [xuid, apiKey, generatedAt]
    )
    console.log('API key inserted successfully')
  } catch (error) {
    console.error(`Error inserting API key: ${error}`)
    throw error
  }
}

const updateApiKey = async (xuid, apiKey) => {
  try {
    const generatedAt = moment().format('YYYY-MM-DD HH:mm:ss')
    await executeQuery(
      'UPDATE api_keys SET api_key = ?, generated_at = ? WHERE xuid = ?',
      [apiKey, generatedAt, xuid]
    )
    console.log('API key updated successfully')
  } catch (error) {
    console.error('Error updating API key:', error)
    throw error
  }
}

const getApiKey = async (xuid) => {
  try {
    const result = await executeQuery(
      'SELECT api_key, generated_at, requests_per_hour, total_requests FROM api_keys WHERE xuid = ?',
      [xuid]
    )

    if (result.length > 0) {
      const { api_key, generated_at, requests_per_hour, total_requests } = result[0]
      return {
        apiKey: api_key,
        generatedAt: generated_at,
        requestsPerHour: requests_per_hour,
        totalRequests: total_requests,
      }
    }

    return null
  } catch (error) {
    console.error('Error getting API key:', error)
    throw error
  }
}

const incrementApiRequests = async (apiKey) => {
  try {
    const currentHour = moment().format('YYYY-MM-DD HH:00:00')
    await executeQuery(
      'UPDATE api_keys SET requests_per_hour = requests_per_hour + 1, total_requests = total_requests + 1 WHERE api_key = ? AND HOUR(generated_at) = HOUR(?)',
      [apiKey, currentHour]
    )
    console.log('Requests incremented successfully')
  } catch (error) {
    console.error(`Error incrementing requests: ${error}`)
    throw error
  }
}

const isApiKeyPresent = async (apiKey) => {
  try {
    const result = await executeQuery(
      'SELECT EXISTS(SELECT 1 FROM api_keys WHERE api_key = ?) AS present',
      [apiKey]
    )
    return result[0].present === 1
  } catch (error) {
    console.error('Error checking API key presence:', error)
    throw error
  }
}

const resetRequestsPerHour = async () => {
  try {
    const currentHour = moment().format('YYYY-MM-DD HH:00:00')
    await executeQuery(
      'UPDATE api_keys SET requests_per_hour = 0 WHERE HOUR(generated_at) != HOUR(?)',
      [currentHour]
    )
    console.log('Requests per hour count reset successfully')
  } catch (error) {
    console.error(`Error resetting requests per hour count: ${error}`)
    throw error
  }
}

const checkRequestLimit = async (apiKey) => {
  try {
    const result = await executeQuery(
      'SELECT requests_per_hour FROM api_keys WHERE api_key = ?',
      [apiKey]
    )
    const requestsPerHour = result[0].requests_per_hour

    return requestsPerHour < 200
  } catch (error) {
    console.error('Error checking request limit:', error)
    throw error
  }
}

export {
  pool,
  getTotalRequests,
  incrementTotalRequests,
  incrementApiRequests,
  updateApiKey,
  insertApiKey,
  getApiKey,
  isApiKeyPresent,
  checkRequestLimit,
}