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
      const query4 = `CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255),
        password VARCHAR(255),
        verification_token VARCHAR(255),
        verified BOOLEAN,
        reset_token VARCHAR(255)
      )`
      
    const conn = await pool.getConnection()

    try {
      await conn.query(query1)
      await conn.query(query2)
      await conn.query(query3)
      await conn.query(query4)
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

const createUser = async (name, email, hashedPassword, verificationToken) => {
  try {
    const conn = await pool.getConnection()
    const query =
      'INSERT INTO users (name, email, password, verification_token) VALUES (?, ?, ?, ?)'
    const [result] = await conn.query(query, [
      name,
      email,
      hashedPassword,
      verificationToken,
    ])
    conn.release()
    return result.insertId
  } catch (error) {
    console.error(`Error creating user: ${error}`)
    throw error
  }
}

const getUserByEmail = async (email) => {
  try {
    const conn = await pool.getConnection()
    const query = 'SELECT * FROM users WHERE email = ?'
    const [rows] = await conn.query(query, [email])
    conn.release()
    return rows.length ? rows[0] : null
  } catch (error) {
    console.error(`Error retrieving user by email: ${error}`)
    throw error
  }
}

const updateUserPassword = async (userId, newPassword) => {
  try {
    const conn = await pool.getConnection()
    const query = 'UPDATE users SET password = ? WHERE id = ?'
    const [result] = await conn.query(query, [newPassword, userId])
    conn.release()
    return result.affectedRows > 0
  } catch (error) {
    console.error(`Error updating user password: ${error}`)
    throw error
  }
}

const getUserByVerificationToken = async (verificationToken) => {
  try {
    const conn = await pool.getConnection()
    const query = 'SELECT * FROM users WHERE verification_token = ?'
    const [rows] = await conn.query(query, [verificationToken])
    conn.release()
    return rows.length ? rows[0] : null
  } catch (error) {
    console.error(`Error retrieving user by verification token: ${error}`)
    throw error
  }
}

const updateUserVerificationStatus = async (userId, status) => {
  try {
    const conn = await pool.getConnection()
    const query = 'UPDATE users SET verified = ? WHERE id = ?'
    const [result] = await conn.query(query, [status, userId])
    conn.release()
    return result.affectedRows > 0
  } catch (error) {
    console.error(`Error updating user verification status: ${error}`)
    throw error
  }
}

const updateUserResetToken = async (userId, resetToken) => {
  try {
    const conn = await pool.getConnection()
    const query = 'UPDATE users SET reset_token = ? WHERE id = ?'
    const [result] = await conn.query(query, [resetToken, userId])
    conn.release()
    return result.affectedRows > 0
  } catch (error) {
    console.error(`Error updating user reset token: ${error}`)
    throw error
  }
}

const getUserByResetToken = async (resetToken) => {
  try {
    const conn = await pool.getConnection()
    const query = 'SELECT * FROM users WHERE reset_token = ?'
    const [rows] = await conn.query(query, [resetToken])
    conn.release()
    return rows.length ? rows[0] : null
  } catch (error) {
    console.error(`Error retrieving user by reset token: ${error}`)
    throw error
  }
}

const clearUserResetToken = async (userId) => {
  try {
    const conn = await pool.getConnection()
    const query = 'UPDATE users SET reset_token = NULL WHERE id = ?'
    const [result] = await conn.query(query, [userId])
    conn.release()
    return result.affectedRows > 0
  } catch (error) {
    console.error(`Error clearing user reset token: ${error}`)
    throw error
  }
}



export {
  pool,
  incrementRequestCount,
  incrementTotalRequests,
  insertRequestLog,
  getTotalRequests,
  getLogs,
  createUser,
  getUserByEmail,
  updateUserPassword,
  getUserByVerificationToken,
  updateUserVerificationStatus,
  updateUserResetToken,
  getUserByResetToken,
  clearUserResetToken,
}