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
  database: 'mcprofile',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

let connection

// Create the necessary tables in the database
const createTables = async () => {
  try {
    const query1 =
      'CREATE TABLE IF NOT EXISTS request_count (ip VARCHAR(255), count INT, PRIMARY KEY (ip))'
    const query2 =
      'CREATE TABLE IF NOT EXISTS request_totals (id INT PRIMARY KEY, total INT)'
    const query3 =
      'CREATE TABLE IF NOT EXISTS request_logs (id INT AUTO_INCREMENT PRIMARY KEY, ip VARCHAR(255), endpoint VARCHAR(255), request_time TIMESTAMP)'

    const conn = await pool.getConnection()

    try {
      await conn.query(query1)
      await conn.query(query2)
      await conn.query(query3)
      console.log('Tables created/loaded successfully')
    } finally {
      conn.release()
    }
  } catch (error) {
    console.error(`Error creating tables: ${error}`)
  }
}

// Check the connection to the database and retry if necessary
const checkConnection = async () => {
  try {
    if (!connection || connection.state === 'disconnected') {
      connection = await pool.getConnection()
      console.log('Database connected successfully')
      await createTables()
    }
  } catch (error) {
    console.error(`Error connecting to database: ${error}`)
  }
}

// Check the connection every 10 minutes
setInterval(() => {
  checkConnection()
}, 10 * 60 * 1000)

// Connect to the database and create the necessary tables
checkConnection()

const incrementRequestCount = async (ip) => {
  try {
    const [results] = await pool.query(
      'INSERT INTO request_count (ip, count) VALUES (?, 1) ON DUPLICATE KEY UPDATE count = count + 1',
      [ip]
    )
    return results
  } catch (error) {
    console.error(`Error incrementing request count: ${error}`)
    throw error
  }
}

const incrementTotalRequests = async () => {
  try {
    const [results] = await pool.query(
      'INSERT INTO request_totals (id, total) VALUES (1, 1) ON DUPLICATE KEY UPDATE total = total + 1'
    )
    return results
  } catch (error) {
    console.error(`Error incrementing total requests: ${error}`)
    throw error
  }
}

const insertRequestLog = async (ip, endpoint, requestTime) => {
  try {
    const formattedTime = moment(requestTime).format('YYYY-MM-DD HH:mm:ss')
    const [results] = await pool.query(
      'INSERT INTO request_logs (ip, endpoint, request_time) VALUES (?, ?, ?)',
      [ip, endpoint, formattedTime]
    )
    return results
  } catch (error) {
    console.error(`Error inserting request log: ${error}`)
    throw error
  }
}


const getLogs = async () => {
  try {
    const results = await pool.query('SELECT * FROM request_logs')
    return results
  } catch (error) {
    console.error(`Error getting request logs: ${error}`)
    return null
  }
}

const getTotalRequests = async () => {
  try {
    const result = await pool.query(
      'SELECT total FROM request_totals WHERE id = 1'
    )
    return result[0][0].total
  } catch (error) {
    console.error(`Error getting total requests: ${error}`)
    return null
  }
}

export {
  pool,
  incrementRequestCount,
  incrementTotalRequests,
  insertRequestLog,
  getTotalRequests,
  getLogs,
}